import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authRequired, AuthedRequest } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	name: z.string().min(1),
});

router.post('/register', async (req, res) => {
	const parse = registerSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email, password, name } = parse.data;
	const existing = await prisma.user.findUnique({ where: { email } });
	if (existing) return res.status(409).json({ error: 'Email already registered' });
	const passwordHash = await bcrypt.hash(password, 10);
	const user = await prisma.user.create({ data: { email, passwordHash, name } });
	const token = signToken({ userId: user.id, role: user.role });
	setTokenCookie(res, token);
	res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

router.post('/login', async (req, res) => {
	const parse = loginSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { email, password } = parse.data;
	const user = await prisma.user.findUnique({ where: { email } });
	if (!user) return res.status(401).json({ error: 'Invalid credentials' });
	const ok = await bcrypt.compare(password, user.passwordHash);
	if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
	const token = signToken({ userId: user.id, role: user.role });
	setTokenCookie(res, token);
	res.json({ id: user.id, email: user.email, name: user.name, role: user.role });
});

router.post('/logout', (_req, res) => {
	res.clearCookie('token', cookieOptions());
	res.json({ ok: true });
});

router.get('/me', authRequired, async (req: AuthedRequest, res) => {
	const me = await prisma.user.findUnique({ where: { id: req.user!.userId }, select: { id: true, email: true, name: true, role: true } });
	res.json(me);
});

function setTokenCookie(res: any, token: string) {
	res.cookie('token', token, cookieOptions());
}

function cookieOptions() {
	return { httpOnly: true, sameSite: 'lax', secure: false, path: '/' } as const;
}

export default router;