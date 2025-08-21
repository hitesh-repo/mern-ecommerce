import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authRequired, AuthedRequest } from '../middleware/auth';

const router = Router();

router.get('/', authRequired, async (req: AuthedRequest, res) => {
	const cart = await getOrCreateCart(req.user!.userId);
	res.json(cart);
});

const upsertItemSchema = z.object({ productId: z.string(), quantity: z.number().int().min(1) });

router.post('/items', authRequired, async (req: AuthedRequest, res) => {
	const parse = upsertItemSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const { productId, quantity } = parse.data;
	const cart = await prisma.cart.upsert({
		where: { userId: req.user!.userId },
		update: {},
		create: { userId: req.user!.userId },
	});
	const existing = await prisma.cartItem.findFirst({ where: { cartId: cart.id, productId } });
	if (existing) {
		const updated = await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity } });
		return res.json(updated);
	}
	const created = await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
	res.status(201).json(created);
});

router.delete('/items/:itemId', authRequired, async (req: AuthedRequest, res) => {
	await prisma.cartItem.delete({ where: { id: req.params.itemId } });
	res.status(204).send();
});

async function getOrCreateCart(userId: string) {
	let cart = await prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true } } } });
	if (!cart) {
		cart = await prisma.cart.create({ data: { userId }, include: { items: { include: { product: true } } } });
	}
	return cart;
}

export default router;