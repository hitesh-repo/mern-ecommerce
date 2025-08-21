import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';
import { authRequired, requireAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req, res) => {
	const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' } });
	res.json(products);
});

router.get('/:slug', async (req, res) => {
	const product = await prisma.product.findUnique({ where: { slug: req.params.slug } });
	if (!product) return res.status(404).json({ error: 'Not found' });
	res.json(product);
});

const upsertSchema = z.object({
	title: z.string().min(1),
	slug: z.string().min(1),
	description: z.string().min(1),
	priceCents: z.number().int().min(0),
	inventory: z.number().int().min(0),
	imageUrl: z.string().url().optional().nullable(),
	categoryId: z.string().optional().nullable(),
});

router.post('/', authRequired, requireAdmin, async (req, res) => {
	const parse = upsertSchema.safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const data = parse.data;
	const created = await prisma.product.create({ data });
	res.status(201).json(created);
});

router.put('/:id', authRequired, requireAdmin, async (req, res) => {
	const parse = upsertSchema.partial({ slug: true }).safeParse(req.body);
	if (!parse.success) return res.status(400).json({ error: parse.error.flatten() });
	const updated = await prisma.product.update({ where: { id: req.params.id }, data: parse.data });
	res.json(updated);
});

router.delete('/:id', authRequired, requireAdmin, async (req, res) => {
	await prisma.product.delete({ where: { id: req.params.id } });
	res.status(204).send();
});

export default router;