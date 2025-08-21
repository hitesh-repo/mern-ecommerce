import { PrismaClient } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
	const adminEmail = 'admin@example.com';
	const admin = await prisma.user.upsert({
		where: { email: adminEmail },
		update: {},
		create: {
			email: adminEmail,
			name: 'Admin',
			passwordHash: await bcrypt.hash('admin123', 10),
			role: 'ADMIN',
		},
	});
	console.log('Admin user:', admin.email);

	const cat = await prisma.category.upsert({
		where: { slug: 'general' },
		update: {},
		create: { name: 'General', slug: 'general' },
	});

	const samples = [
		{ title: 'T-Shirt', slug: 't-shirt', description: 'Soft cotton tee', priceCents: 1999, inventory: 100, categoryId: cat.id },
		{ title: 'Hoodie', slug: 'hoodie', description: 'Cozy hoodie', priceCents: 4999, inventory: 50, categoryId: cat.id },
		{ title: 'Cap', slug: 'cap', description: 'Stylish cap', priceCents: 1499, inventory: 200, categoryId: cat.id },
	];

	for (const p of samples) {
		await prisma.product.upsert({ where: { slug: p.slug }, update: p, create: p });
	}
	console.log('Seeded products');
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
}).finally(async () => {
	await prisma.$disconnect();
});