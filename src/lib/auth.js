import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { logLoginAttempt } from './auditLog';

function extractIpFromHeaders(headers) {
  if (!headers) return null;
  const fwd = headers['x-forwarded-for'];
  if (fwd) return (typeof fwd === 'string' ? fwd : fwd[0]).split(',')[0].trim();
  return headers['x-real-ip'] ?? null;
}

function extractUaFromHeaders(headers) {
  if (!headers) return null;
  return headers['user-agent'] ?? null;
}

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
  },
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile, req }) {
      // For Google OAuth: create or link user in our database
      if (account?.provider === 'google') {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
          });

          let dbUserId = existingUser?.id ?? null;
          const now = new Date();
          const ipAddress = extractIpFromHeaders(req?.headers);
          const userAgent = extractUaFromHeaders(req?.headers);

          if (!existingUser) {
            // Create new user from Google account
            const created = await prisma.user.create({
              data: {
                email: user.email,
                name: user.name,
                image: user.image,
                password: null, // No password for OAuth users
                termsConsentAt: now,
                privacyConsentAt: now,
              },
            });
            dbUserId = created.id;

            // Consent audit trail for OAuth sign-up
            await prisma.consentAudit.createMany({
              data: [
                {
                  userId: created.id,
                  consentType: 'terms',
                  action: 'granted',
                  ipAddress,
                  userAgent,
                  metadata: JSON.stringify({ source: 'google_oauth_signup' }),
                },
                {
                  userId: created.id,
                  consentType: 'privacy',
                  action: 'granted',
                  ipAddress,
                  userAgent,
                  metadata: JSON.stringify({ source: 'google_oauth_signup' }),
                },
              ],
            });
          } else {
            // Sync name and image from Google on each login
            const updates = {};
            if (user.name && user.name !== existingUser.name) updates.name = user.name;
            if (user.image && user.image !== existingUser.image) updates.image = user.image;
            // Backfill consent fields for users created before this feature
            if (!existingUser.termsConsentAt) updates.termsConsentAt = now;
            if (!existingUser.privacyConsentAt) updates.privacyConsentAt = now;
            if (Object.keys(updates).length > 0) {
              await prisma.user.update({
                where: { email: user.email },
                data: updates,
              });
            }

            // If backfilling consent, also write audit records once
            if (!existingUser.termsConsentAt || !existingUser.privacyConsentAt) {
              const auditRecords = [];
              if (!existingUser.termsConsentAt) {
                auditRecords.push({
                  userId: existingUser.id,
                  consentType: 'terms',
                  action: 'granted',
                  ipAddress,
                  userAgent,
                  metadata: JSON.stringify({ source: 'google_oauth_login_backfill' }),
                });
              }
              if (!existingUser.privacyConsentAt) {
                auditRecords.push({
                  userId: existingUser.id,
                  consentType: 'privacy',
                  action: 'granted',
                  ipAddress,
                  userAgent,
                  metadata: JSON.stringify({ source: 'google_oauth_login_backfill' }),
                });
              }
              if (auditRecords.length > 0) {
                await prisma.consentAudit.createMany({ data: auditRecords });
              }
            }
          }

          // Log the Google OAuth login attempt (no req in this callback — IP captured via edge middleware)
          await logLoginAttempt(req ?? null, { userId: dbUserId, email: user.email, success: true, authMethod: 'google' });
        } catch (error) {
          console.error('Error during Google sign-in:', error);
          await logLoginAttempt(req ?? null, { userId: null, email: user.email, success: false, authMethod: 'google', failReason: 'server_error' });
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
