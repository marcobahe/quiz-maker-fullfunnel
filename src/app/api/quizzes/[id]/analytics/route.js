import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// ── POST: Save analytics event ──────────────────────────────
export async function POST(request, { params }) {
  try {
    const { id: quizId } = await params;
    const body = await request.json();

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
    const userAgent = request.headers.get('user-agent') || '';

    const event = await prisma.analyticsEvent.create({
      data: {
        quizId,
        sessionId: body.sessionId || null,
        event: body.event,
        nodeId: body.nodeId || null,
        questionId: body.questionId || null,
        data: body.data ? JSON.stringify(body.data) : '{}',
        ip,
        userAgent,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error) {
    console.error('Error saving analytics:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

// ── GET: Aggregated analytics ────────────────────────────────
export async function GET(request, { params }) {
  try {
    const { id: quizId } = await params;

    const quiz = await prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz não encontrado' }, { status: 404 });
    }

    // Fetch all events for this quiz
    const events = await prisma.analyticsEvent.findMany({
      where: { quizId },
      orderBy: { createdAt: 'asc' },
    });

    // ── Overview ────────────────────────────────────────────
    const startEvents = events.filter(e => e.event === 'quiz_start' || e.event === 'quiz_started');
    const completeEvents = events.filter(e => e.event === 'quiz_complete');
    const leadEvents = events.filter(e => e.event === 'lead_submit');
    const answerEvents = events.filter(e => e.event === 'question_answer');

    const totalStarts = startEvents.length;
    const totalCompletes = completeEvents.length;
    const completionRate = totalStarts > 0 ? Math.round((totalCompletes / totalStarts) * 1000) / 10 : 0;
    const totalLeads = leadEvents.length;
    const leadConversionRate = totalStarts > 0 ? Math.round((totalLeads / totalStarts) * 1000) / 10 : 0;

    // Avg score from complete events
    let avgScore = 0;
    const scoresFromCompletes = completeEvents.map(e => {
      try { const d = JSON.parse(e.data || '{}'); return d.score; } catch { return null; }
    }).filter(s => s !== null && s !== undefined);
    if (scoresFromCompletes.length > 0) {
      avgScore = Math.round((scoresFromCompletes.reduce((a, b) => a + b, 0) / scoresFromCompletes.length) * 10) / 10;
    }

    // Avg time: difference between quiz_start and quiz_complete per session
    let avgTimeSeconds = 0;
    const sessionStarts = {};
    const sessionCompletes = {};
    startEvents.forEach(e => {
      if (e.sessionId) sessionStarts[e.sessionId] = new Date(e.createdAt).getTime();
    });
    completeEvents.forEach(e => {
      if (e.sessionId) sessionCompletes[e.sessionId] = new Date(e.createdAt).getTime();
    });
    const times = [];
    for (const sid of Object.keys(sessionCompletes)) {
      if (sessionStarts[sid]) {
        const diff = (sessionCompletes[sid] - sessionStarts[sid]) / 1000;
        if (diff > 0 && diff < 3600) times.push(diff); // Ignore > 1h
      }
    }
    if (times.length > 0) {
      avgTimeSeconds = Math.round(times.reduce((a, b) => a + b, 0) / times.length);
    }

    const overview = {
      totalStarts,
      totalCompletes,
      completionRate,
      avgScore,
      avgTimeSeconds,
      totalLeads,
      leadConversionRate,
    };

    // ── Funnel (question views & drop-off) ──────────────────
    const viewEvents = events.filter(e => e.event === 'question_view');
    const nodeViewCounts = {};
    const nodeOrder = [];
    
    // Build ordered list of nodes from view events
    viewEvents.forEach(e => {
      const nid = e.nodeId || e.questionId || 'unknown';
      if (!nodeViewCounts[nid]) {
        nodeViewCounts[nid] = 0;
        nodeOrder.push(nid);
      }
      nodeViewCounts[nid]++;
    });

    // Try to get node labels from canvasData
    let nodeLabels = {};
    try {
      const canvasData = typeof quiz.canvasData === 'string' ? JSON.parse(quiz.canvasData) : quiz.canvasData;
      if (canvasData?.nodes) {
        canvasData.nodes.forEach(n => {
          const label = n.data?.question || n.data?.title || n.data?.label || n.type;
          nodeLabels[n.id] = label;
        });
      }
    } catch {}

    // Add start as first funnel step
    const funnel = [];
    if (totalStarts > 0) {
      funnel.push({
        nodeId: 'start',
        label: 'Início',
        views: totalStarts,
        dropoff: 0,
      });
    }

    // De-duplicate node order (keep first occurrence)
    const seenNodes = new Set();
    const uniqueNodeOrder = nodeOrder.filter(nid => {
      if (seenNodes.has(nid)) return false;
      seenNodes.add(nid);
      return true;
    });

    let prevViews = totalStarts;
    uniqueNodeOrder.forEach(nid => {
      const views = nodeViewCounts[nid] || 0;
      const dropoff = prevViews > 0 ? Math.round(((prevViews - views) / prevViews) * 1000) / 10 : 0;
      funnel.push({
        nodeId: nid,
        label: nodeLabels[nid] || nid,
        views,
        dropoff: Math.max(0, dropoff),
      });
      prevViews = views;
    });

    // ── Daily stats (last 30 days) ──────────────────────────
    const dailyMap = {};
    const now = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      dailyMap[key] = { date: key, starts: 0, completes: 0, leads: 0 };
    }

    events.forEach(e => {
      const dateKey = new Date(e.createdAt).toISOString().split('T')[0];
      if (!dailyMap[dateKey]) return;
      if (e.event === 'quiz_start' || e.event === 'quiz_started') dailyMap[dateKey].starts++;
      if (e.event === 'quiz_complete') dailyMap[dateKey].completes++;
      if (e.event === 'lead_submit') dailyMap[dateKey].leads++;
    });

    const daily = Object.values(dailyMap);

    // ── Results distribution ────────────────────────────────
    const resultCounts = {};
    completeEvents.forEach(e => {
      try {
        const d = JSON.parse(e.data || '{}');
        const title = d.resultCategory || d.category || 'Sem categoria';
        resultCounts[title] = (resultCounts[title] || 0) + 1;
      } catch {}
    });

    const results = Object.entries(resultCounts).map(([title, count]) => ({
      title,
      count,
      percentage: totalCompletes > 0 ? Math.round((count / totalCompletes) * 1000) / 10 : 0,
    })).sort((a, b) => b.count - a.count);

    return NextResponse.json({ overview, funnel, daily, results });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
