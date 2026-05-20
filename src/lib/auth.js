import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { logLoginAttempt } from './auditLog';
import { checkRateLimit } from './rateLimit';

// Validate required OAuth environment variables at startup
if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  console.error(
    '[AUTH] Missing required environment variables: GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET'
  );
}
if (!process.env.NEXTAUTH_SECRET) {
  console.error('[AUTH] Missing required environment variable: NEXTAUTH_SECRET');
}

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
      // NextAuth v4 passes the raw Node IncomingMessage as second arg —
      // used to capture IP address and User-Agent for audit logging.
      async authorize(credentials, req) {
        // Rate limit: 5 login attempts per IP per 15 minutes
        const ip =
          req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
          req.headers['x-real-ip'] ||
          'unknown';
        const rl = await checkRateLimit(`login:${ip}`, { max: 5, windowMs: 900_000 });
        if (!rl.allowed) {
          throw new Error('Muitas tentativas. Tente novamente em instantes.');
        }

        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email e senha são obrigatórios');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          select: { id: true, name: true, email: true, image: true, password: true, plan: true, role: true, mfaEnabled: true },
        });

        if (!user || !user.password) {
          await logLoginAttempt(req, { userId: null, email: credentials.email, success: false, authMethod: 'credentials', failReason: 'user_not_found' });
          throw new Error('Usuário não encontrado');
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) {
          await logLoginAttempt(req, { userId: user.id, email: user.email, success: false, authMethod: 'credentials', failReason: 'invalid_password' });
          throw new Error('Senha incorreta');
        }

        // If MFA is enabled, return a pending token — full session granted after TOTP verification
        if (user.mfaEnabled) {
          await logLoginAttempt(req, { userId: user.id, email: user.email, success: false, authMethod: 'credentials', failReason: 'mfa_pending' });
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            plan: user.plan || 'free',
            role: user.role || 'user',
            mfaPending: true,
          };
        }

        await logLoginAttempt(req, { userId: user.id, email: user.email, success: true, authMethod: 'credentials' });
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
    maxAge: 86400, // 24 hours
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // For Google OAuth: create or link user in our database
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          let dbUserId = existingUser?.id ?? null;

          if (!existingUser) {
            // Create new user from Google account
            const created = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                password: null, // No password for OAuth users
              },
            });
            dbUserId = created.id;
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

          // Log the Google OAuth login attempt (no req in this callback — IP captured via edge middleware)
          await logLoginAttempt(null, { userId: dbUserId, email: user.email, success: true, authMethod: 'google' });
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          await logLoginAttempt(null, { userId: null, email: user.email, success: false, authMethod: 'google', failReason: 'server_error' });
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
          if (user.mfaPending) token.mfaPending = true;
        }
      }

      // Handle session updates (e.g., impersonation, MFA clearance)
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
        // MFA verification complete — clear pending flag
        if (updateSession.mfaVerified) {
          delete token.mfaPending;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.impersonatingAs || token.id;
        session.user.plan = token.plan || 'free';
        session.user.role = token.role || 'user';
        if (token.mfaPending) session.user.mfaPending = true;

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
