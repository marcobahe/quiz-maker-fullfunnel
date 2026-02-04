import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'QuizMeBaby - Crie Quizzes que Convertem',
  description: 'Crie quizzes interativos para capturar leads e aumentar conversões',
};

// Inline script to prevent FOUC (flash of unstyled content) on theme load
const themeScript = `
  (function() {
    try {
      var theme = localStorage.getItem('theme');
      if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
      }
    } catch(e) {}
  })();
`;

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
