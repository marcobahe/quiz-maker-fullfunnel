import { ImageResponse } from '@vercel/og';
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const runtime = 'edge';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const quizId = searchParams.get('quizId');

    if (!slug && !quizId) {
      return new NextResponse('Missing slug or quizId parameter', { status: 400 });
    }

    // Buscar quiz no banco
    let quiz;
    if (slug) {
      quiz = await prisma.quiz.findFirst({
        where: { slug },
        select: {
          id: true,
          name: true,
          description: true,
          settings: true,
        },
      });
    } else {
      quiz = await prisma.quiz.findFirst({
        where: { id: quizId },
        select: {
          id: true,
          name: true,
          description: true,
          settings: true,
        },
      });
    }

    // Se não encontrou o quiz, usar dados padrão
    if (!quiz) {
      quiz = {
        name: 'QuizMeBaby',
        description: 'Crie quizzes interativos que convertem visitantes em leads qualificados',
        settings: '{}',
      };
    }

    // Parse das configurações do quiz
    let theme = {
      primaryColor: '#7c3aed',
      secondaryColor: '#5b21b6',
      backgroundColor: '#1e1b4b',
    };

    try {
      const settings = typeof quiz.settings === 'string' 
        ? JSON.parse(quiz.settings) 
        : quiz.settings || {};
      if (settings.theme) {
        theme = { ...theme, ...settings.theme };
      }
    } catch (e) {
      // Usar tema padrão se não conseguir fazer parse
    }

    // Preparar textos
    const title = quiz.name || 'Quiz Interativo';
    const description = quiz.description || 'Responda e descubra seu resultado!';
    
    // Truncar textos se muito longos
    const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
    const truncatedDescription = description.length > 120 ? description.substring(0, 117) + '...' : description;

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor}, ${theme.backgroundColor})`,
            padding: '60px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          {/* Background Pattern */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 70% 80%, rgba(255,255,255,0.08) 0%, transparent 50%)',
            }}
          />

          {/* Content Container */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '24px',
              padding: '60px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              textAlign: 'center',
              maxWidth: '900px',
              width: '100%',
              position: 'relative',
            }}
          >
            {/* Quiz Icon */}
            <div
              style={{
                width: '80px',
                height: '80px',
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                boxShadow: `0 8px 20px ${theme.primaryColor}40`,
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="white"
              >
                <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>

            {/* Title */}
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
                lineHeight: 1.1,
                maxWidth: '100%',
              }}
            >
              {truncatedTitle}
            </h1>

            {/* Description */}
            <p
              style={{
                fontSize: '24px',
                color: '#6b7280',
                marginBottom: '30px',
                lineHeight: 1.4,
                maxWidth: '100%',
              }}
            >
              {truncatedDescription}
            </p>

            {/* CTA Button */}
            <div
              style={{
                background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
                padding: '16px 32px',
                borderRadius: '12px',
                color: 'white',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: `0 4px 12px ${theme.primaryColor}40`,
              }}
            >
              🚀 Iniciar Quiz
            </div>

            {/* QuizMeBaby Logo */}
            <div
              style={{
                position: 'absolute',
                bottom: '20px',
                right: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                opacity: 0.6,
              }}
            >
              <div
                style={{
                  width: '24px',
                  height: '24px',
                  background: theme.primaryColor,
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}
              >
                Q
              </div>
              <span style={{ color: '#6b7280', fontSize: '14px', fontWeight: '500' }}>
                QuizMeBaby
              </span>
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (error) {
    console.error('Error generating OG image:', error);
    
    // Retornar imagem padrão em caso de erro
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #7c3aed, #5b21b6, #1e1b4b)',
            padding: '60px',
            fontFamily: 'Inter, system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '24px',
              padding: '60px',
              boxShadow: '0 25px 50px rgba(0,0,0,0.2)',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '80px',
                height: '80px',
                background: 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '30px',
                color: 'white',
                fontSize: '40px',
                fontWeight: 'bold',
              }}
            >
              Q
            </div>
            <h1
              style={{
                fontSize: '56px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '20px',
              }}
            >
              QuizMeBaby
            </h1>
            <p
              style={{
                fontSize: '24px',
                color: '#6b7280',
                marginBottom: '30px',
              }}
            >
              Crie quizzes que convertem
            </p>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}