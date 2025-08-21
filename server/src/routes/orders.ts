import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { authRequired, AuthedRequest, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/mine', authRequired, async (req: AuthedRequest, res) => {
	const orders = await prisma.order.findMany({ where: { userId: req.user!.userId }, include: { items: true }, orderBy: { createdAt: 'desc' } });
	res.json(orders);
});

router.get('/', authRequired, requireAdmin, async (_req, res) => {
	const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: 'desc' } });
	res.json(orders);
});

router.post('/checkout', authRequired, async (req: AuthedRequest, res) => {
	const cart = await prisma.cart.findUnique({ where: { userId: req.user!.userId }, include: { items: { include: { product: true } } } });
	if (!cart || cart.items.length === 0) return res.status(400).json({ error: 'Cart is empty' });
	const items = cart.items.map(ci => ({ productId: ci.productId, quantity: ci.quantity, priceCents: ci.product.priceCents }));
	const totalCents = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
	const order = await prisma.$transaction(async (tx) => {
		const created = await tx.order.create({ data: { userId: req.user!.userId, totalCents, items: { createMany: { data: items } } }, include: { items: true } });
		await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
		return created;
	});
	res.status(201).json(order);
});

export default router;