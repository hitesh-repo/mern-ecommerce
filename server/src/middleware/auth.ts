import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload } from '../lib/jwt';

export type AuthedRequest = Request & { user?: JwtPayload };

export function authOptional(req: AuthedRequest, _res: Response, next: NextFunction) {
	const token = extractToken(req);
	if (token) {
		const payload = verifyToken(token);
		if (payload) req.user = payload;
	}
	next();
}

export function authRequired(req: AuthedRequest, res: Response, next: NextFunction) {
	const token = extractToken(req);
	if (!token) return res.status(401).json({ error: 'Unauthorized' });
	const payload = verifyToken(token);
	if (!payload) return res.status(401).json({ error: 'Unauthorized' });
	req.user = payload;
	next();
}

export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
	if (!req.user || req.user.role !== 'ADMIN') return res.status(403).json({ error: 'Forbidden' });
	next();
}

function extractToken(req: Request): string | null {
	const header = req.headers.authorization;
	if (header?.startsWith('Bearer ')) return header.slice(7);
	const cookie = req.cookies?.token as string | undefined;
	return cookie || null;
}