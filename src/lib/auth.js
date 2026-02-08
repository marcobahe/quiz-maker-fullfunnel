import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Usuário não encontrado');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          throw new Error('Senha incorreta');
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          plan: user.plan || 'free',
          role: user.role || 'user',
        };
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // For Google OAuth: create or link user in our database
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          if (!existingUser) {
            // Create new user from Google account
            await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                password: null, // No password for OAuth users
              },
            });
          } else {
            // Sync name and image from Google on each login
            const updates = {};
            if (user.name && user.name !== existingUser.name) updates.name = user.name;
            if (user.image && user.image !== existingUser.image) updates.image = user.image;
            if (Object.keys(updates).length > 0) {
              await prisma.user.update({
                where: { email: user.email },
                data: updates,
              });
            }
          }
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          return false;
        }
      }
      return true;
    },
    async jwt({ token, user, account, trigger, session: updateSession }) {
      if (user) {
        // For Google OAuth, fetch the DB user to get the correct id
        if (account?.provider === 'google') {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.plan = dbUser.plan || 'free';
            token.role = dbUser.role || 'user';
          }
        } else {
          token.id = user.id;
          token.plan = user.plan || 'free';
          token.role = user.role || 'user';
        }
      }

      // Handle session updates (e.g., impersonation)
      if (trigger === 'update' && updateSession) {
        if (updateSession.impersonatingAs) {
          token.impersonatingAs = updateSession.impersonatingAs;
          token.impersonatingName = updateSession.impersonatingName;
          token.originalUserId = updateSession.originalUserId;
          token.originalRole = updateSession.originalRole;
        }
        if (updateSession.stopImpersonating) {
          delete token.impersonatingAs;
          delete token.impersonatingName;
          delete token.originalUserId;
          delete token.originalRole;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.impersonatingAs || token.id;
        session.user.plan = token.plan || 'free';
        session.user.role = token.role || 'user';

        // Impersonation info
        if (token.impersonatingAs) {
          session.user.impersonatingAs = token.impersonatingAs;
          session.user.impersonatingName = token.impersonatingName;
          session.user.originalUserId = token.originalUserId || token.id;
          session.user.originalRole = token.originalRole || token.role;
          // Keep original admin role for admin checks
          session.user.role = token.originalRole || token.role;
        }
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
