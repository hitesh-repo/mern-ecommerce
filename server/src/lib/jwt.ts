import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

export type JwtPayload = {
	userId: string;
	role: 'ADMIN' | 'CUSTOMER';
};

export function signToken(payload: JwtPayload, expiresIn: string = '7d'): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token: string): JwtPayload | null {
	try {
		return jwt.verify(token, JWT_SECRET) as JwtPayload;
	} catch {
		return null;
	}
}