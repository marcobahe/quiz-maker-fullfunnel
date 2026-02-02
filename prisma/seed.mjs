import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create a demo user
  const hashedPassword = await bcrypt.hash('demo123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@quizmaker.com' },
    update: {},
    create: {
      name: 'Demo User',
      email: 'demo@quizmaker.com',
      password: hashedPassword,
    },
  });

  console.log('Created demo user:', user.email);

  // Create a sample quiz
  const quiz = await prisma.quiz.upsert({
    where: { slug: 'quiz-de-perfil-investidor' },
    update: {},
    create: {
      userId: user.id,
      name: 'Quiz de Perfil de Investidor',
      slug: 'quiz-de-perfil-investidor',
      description: 'Descubra qual é o seu perfil de investidor',
      status: 'published',
      canvasData: JSON.stringify({
        nodes: [
          {
            id: 'start',
            type: 'start',
            position: { x: 250, y: 50 },
            data: { label: 'Início' },
          },
          {
            id: 'q1',
            type: 'single-choice',
            position: { x: 200, y: 200 },
            data: {
              type: 'single-choice',
              question: 'Qual é o seu objetivo principal ao investir?',
              options: [
                { text: 'Preservar meu patrimônio', score: 5 },
                { text: 'Ter uma renda extra', score: 10 },
                { text: 'Multiplicar meu capital', score: 15 },
                { text: 'Aposentadoria', score: 8 },
              ],
            },
          },
          {
            id: 'q2',
            type: 'single-choice',
            position: { x: 200, y: 500 },
            data: {
              type: 'single-choice',
              question: 'Se seus investimentos caíssem 20%, o que faria?',
              options: [
                { text: 'Venderia tudo imediatamente', score: 3 },
                { text: 'Venderia parte', score: 7 },
                { text: 'Manteria e esperaria', score: 12 },
                { text: 'Compraria mais', score: 18 },
              ],
            },
          },
          {
            id: 'q3',
            type: 'single-choice',
            position: { x: 200, y: 800 },
            data: {
              type: 'single-choice',
              question: 'Há quanto tempo você investe?',
              options: [
                { text: 'Nunca investi', score: 3 },
                { text: 'Menos de 1 ano', score: 6 },
                { text: '1 a 5 anos', score: 12 },
                { text: 'Mais de 5 anos', score: 15 },
              ],
            },
          },
          {
            id: 'lead',
            type: 'lead-form',
            position: { x: 200, y: 1100 },
            data: { title: 'Descubra seu perfil!' },
          },
          {
            id: 'result',
            type: 'result',
            position: { x: 200, y: 1400 },
            data: { title: 'Seu Perfil de Investidor' },
          },
        ],
        edges: [
          { id: 'e-start-q1', source: 'start', target: 'q1', type: 'smoothstep', animated: true },
          { id: 'e-q1-q2', source: 'q1', target: 'q2', sourceHandle: 'option-0', type: 'smoothstep', animated: true },
          { id: 'e-q1-q2-b', source: 'q1', target: 'q2', sourceHandle: 'option-1', type: 'smoothstep', animated: true },
          { id: 'e-q1-q2-c', source: 'q1', target: 'q2', sourceHandle: 'option-2', type: 'smoothstep', animated: true },
          { id: 'e-q1-q2-d', source: 'q1', target: 'q2', sourceHandle: 'option-3', type: 'smoothstep', animated: true },
          { id: 'e-q2-q3', source: 'q2', target: 'q3', sourceHandle: 'option-0', type: 'smoothstep', animated: true },
          { id: 'e-q2-q3-b', source: 'q2', target: 'q3', sourceHandle: 'option-1', type: 'smoothstep', animated: true },
          { id: 'e-q2-q3-c', source: 'q2', target: 'q3', sourceHandle: 'option-2', type: 'smoothstep', animated: true },
          { id: 'e-q2-q3-d', source: 'q2', target: 'q3', sourceHandle: 'option-3', type: 'smoothstep', animated: true },
          { id: 'e-q3-lead', source: 'q3', target: 'lead', sourceHandle: 'option-0', type: 'smoothstep', animated: true },
          { id: 'e-q3-lead-b', source: 'q3', target: 'lead', sourceHandle: 'option-1', type: 'smoothstep', animated: true },
          { id: 'e-q3-lead-c', source: 'q3', target: 'lead', sourceHandle: 'option-2', type: 'smoothstep', animated: true },
          { id: 'e-q3-lead-d', source: 'q3', target: 'lead', sourceHandle: 'option-3', type: 'smoothstep', animated: true },
          { id: 'e-lead-result', source: 'lead', target: 'result', type: 'smoothstep', animated: true },
        ],
      }),
    },
  });

  console.log('Created sample quiz:', quiz.name, `(slug: ${quiz.slug})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
