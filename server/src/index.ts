import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import cartRoutes from './routes/cart';
import orderRoutes from './routes/orders';
import { authOptional } from './middleware/auth';

dotenv.config();

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;

app.use(cors({ origin: [process.env.CLIENT_ORIGIN || 'http://localhost:5173', process.env.ADMIN_ORIGIN || 'http://localhost:5174'], credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(authOptional);

app.get('/health', (_req, res) => {
	res.json({ ok: true, service: 'ecommerce-api' });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);

app.listen(PORT, () => {
	console.log(`API listening on http://localhost:${PORT}`);
});