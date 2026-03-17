import { Router, Request, Response } from 'express';
import passport from 'passport';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { findUserByEmail, createUser } from '../db/queries/users';
import { authenticateJWT } from '../middleware/auth';

const router = Router();

function signToken(userId: number): string {
  return jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  } as jwt.SignOptions);
}

function setTokenCookie(res: Response, token: string): void {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
router.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { email, name, password } = req.body as { email?: string; name?: string; password?: string };
  if (!email || !name || !password) {
    res.status(400).json({ error: 'email, name and password are required' });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }
  const existing = await findUserByEmail(email);
  if (existing) {
    res.status(409).json({ error: 'Email already registered' });
    return;
  }
  const hash = await bcrypt.hash(password, 12);
  const user = await createUser(email, name, hash, 'local', null);
  const token = signToken(user.id);
  setTokenCookie(res, token);
  res.status(201).json({ user: omitHash(user) });
});

// POST /api/auth/login
router.post('/login', (req: Request, res: Response, next) => {
  passport.authenticate('local', (err: Error | null, user: Express.User | false) => {
    if (err) return next(err);
    if (!user) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken(user.id);
    setTokenCookie(res, token);
    res.json({ user: omitHash(user) });
  })(req, res, next);
});

// POST /api/auth/logout
router.post('/logout', (_req: Request, res: Response): void => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});

// GET /api/auth/me
router.get('/me', authenticateJWT, (req: Request, res: Response): void => {
  res.json({ user: omitHash(req.user!) });
});

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth?error=google_failed` }),
  (req: Request, res: Response) => {
    const token = signToken((req.user as Express.User).id);
    setTokenCookie(res, token);
    res.redirect(process.env.FRONTEND_URL ?? '/');
  }
);

// Microsoft OAuth
router.get('/microsoft', passport.authenticate('microsoft'));

router.get(
  '/microsoft/callback',
  passport.authenticate('microsoft', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/auth?error=microsoft_failed` }),
  (req: Request, res: Response) => {
    const token = signToken((req.user as Express.User).id);
    setTokenCookie(res, token);
    res.redirect(process.env.FRONTEND_URL ?? '/');
  }
);

function omitHash(user: Express.User): Omit<Express.User, 'password_hash'> {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password_hash, ...safe } = user;
  return safe;
}

export default router;
