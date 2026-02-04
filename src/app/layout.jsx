import './globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'QuizMeBaby - Crie Quizzes que Convertem',
  description: 'Crie quizzes interativos para capturar leads e aumentar conversões',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
