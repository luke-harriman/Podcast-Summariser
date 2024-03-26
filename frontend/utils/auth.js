import { serialize, parse } from 'cookie';
import { sign, verify } from 'jsonwebtoken';

const TOKEN_NAME = 'auth_token';
const MAX_AGE = 60 * 60 * 8; // 8 hours

export function setLoginSession(res, session) {
  const token = sign(session, process.env.JWT_SECRET, { expiresIn: MAX_AGE });
  const cookie = serialize(TOKEN_NAME, token, {
    maxAge: MAX_AGE,
    expires: new Date(Date.now() + MAX_AGE * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    sameSite: 'lax',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function removeLoginSession(res) {
  const cookie = serialize(TOKEN_NAME, '', {
    maxAge: -1,
    path: '/',
  });

  res.setHeader('Set-Cookie', cookie);
}

export function parseLoginSession(req) {
  if (!req.cookies) return;

  const token = req.cookies[TOKEN_NAME];
  if (!token) return;

  try {
    const session = verify(token, process.env.JWT_SECRET);
    return session;
  } catch (error) {
    return;
  }
}
