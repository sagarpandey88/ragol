import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as MicrosoftStrategy } from 'passport-microsoft';
import bcrypt from 'bcryptjs';
import { findUserByEmail, findUserById, findUserByProvider, createUser } from '../db/queries/users';

passport.serializeUser((user: Express.User, done) => {
  done(null, (user as { id: number }).id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await findUserById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Local
passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    try {
      const user = await findUserByEmail(email);
      if (!user || !user.password_hash) {
        return done(null, false, { message: 'Invalid credentials' });
      }
      const match = await bcrypt.compare(password, user.password_hash);
      if (!match) return done(null, false, { message: 'Invalid credentials' });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Google OAuth
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL!,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          let user = await findUserByProvider('google', profile.id);
          if (!user) {
            const email = profile.emails?.[0]?.value ?? `${profile.id}@google.oauth`;
            const name = profile.displayName ?? email;
            user = await createUser(email, name, null, 'google', profile.id);
          }
          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

// Microsoft OAuth
if (process.env.MICROSOFT_CLIENT_ID && process.env.MICROSOFT_CLIENT_SECRET) {
  passport.use(
    new MicrosoftStrategy(
      {
        clientID: process.env.MICROSOFT_CLIENT_ID,
        clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
        callbackURL: process.env.MICROSOFT_CALLBACK_URL!,
        scope: ['user.read'],
      },
      async (_accessToken: string, _refreshToken: string, profile: { id: string; displayName?: string; emails?: { value: string }[] }, done: (err: Error | null, user?: unknown) => void) => {
        try {
          let user = await findUserByProvider('microsoft', profile.id);
          if (!user) {
            const email = profile.emails?.[0]?.value ?? `${profile.id}@microsoft.oauth`;
            const name = profile.displayName ?? email;
            user = await createUser(email, name, null, 'microsoft', profile.id);
          }
          return done(null, user);
        } catch (err) {
          return done(err as Error);
        }
      }
    )
  );
}

export default passport;
