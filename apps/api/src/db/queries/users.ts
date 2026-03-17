import pool from '../pool';
import { User } from '@ragol/types';

export async function createUser(
  email: string,
  name: string,
  passwordHash: string | null,
  provider: User['provider'],
  providerId: string | null
): Promise<User> {
  const { rows } = await pool.query<User>(
    `INSERT INTO users (email, name, password_hash, provider, provider_id)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [email, name, passwordHash, provider, providerId]
  );
  return rows[0];
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] ?? null;
}

export async function findUserById(id: number): Promise<User | null> {
  const { rows } = await pool.query<User>('SELECT * FROM users WHERE id = $1', [id]);
  return rows[0] ?? null;
}

export async function findUserByProvider(provider: string, providerId: string): Promise<User | null> {
  const { rows } = await pool.query<User>(
    'SELECT * FROM users WHERE provider = $1 AND provider_id = $2',
    [provider, providerId]
  );
  return rows[0] ?? null;
}
