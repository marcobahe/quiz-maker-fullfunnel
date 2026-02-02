import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/',
    '/builder/:path*',
    '/diagnostic/:path*',
    '/integration/:path*',
    '/analytics/:path*',
    '/templates/:path*',
    '/settings/:path*',
  ],
};
