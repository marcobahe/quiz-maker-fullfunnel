import prisma from '@/lib/prisma';

export async function generateMetadata({ params }) {
  try {
    const slug = await params.slug;
    
    // Buscar quiz no banco
    const quiz = await prisma.quiz.findFirst({
      where: { slug },
      select: {
        id: true,
        name: true,
        description: true,
        settings: true,
      },
    });

    if (!quiz) {
      return {
        title: 'Quiz não encontrado - QuizMeBaby',
        description: 'O quiz que você está procurando não foi encontrado.',
        openGraph: {
          title: 'Quiz não encontrado - QuizMeBaby',
          description: 'O quiz que você está procurando não foi encontrado.',
          type: 'website',
          images: ['/og-default.png'],
        },
        twitter: {
          card: 'summary_large_image',
          title: 'Quiz não encontrado - QuizMeBaby',
          description: 'O quiz que você está procurando não foi encontrado.',
          images: ['/og-default.png'],
        },
      };
    }

    const title = quiz.name;
    const description = quiz.description || 'Responda e descubra seu resultado!';
    const ogImageUrl = `/api/og?slug=${slug}`;
    
    return {
      title: `${title} - QuizMeBaby`,
      description,
      openGraph: {
        title,
        description,
        type: 'website',
        url: `${process.env.NEXTAUTH_URL}/q/${slug}`,
        siteName: 'QuizMeBaby',
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    
    // Fallback metadata
    return {
      title: 'Quiz - QuizMeBaby',
      description: 'Responda e descubra seu resultado!',
      openGraph: {
        title: 'Quiz - QuizMeBaby',
        description: 'Responda e descubra seu resultado!',
        type: 'website',
        images: ['/og-default.png'],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Quiz - QuizMeBaby',
        description: 'Responda e descubra seu resultado!',
        images: ['/og-default.png'],
      },
    };
  }
}

export default function QuizLayout({ children }) {
  return children;
}