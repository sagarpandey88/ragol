import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { findUserById } from '../db/queries/users';
import { User as RagolUser } from '@ragol/types';

// Augment Express.User so req.user carries our full User type
declare global {
  namespace Express {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface User extends RagolUser {}
  }
}

export type { RagolUser as User };

export async function authenticateJWT(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.token as string | undefined;
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET!) as { userId: number };
    const user = await findUserById(payload.userId);
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    req.user = user;
    next();
  } catch {
    res.status(401).json({ error: 'Unauthorized' });
  }
}
