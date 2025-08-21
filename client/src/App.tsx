import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useParams, useNavigate } from 'react-router-dom'

const API_BASE = 'http://localhost:4000/api'

export default function App() {
	return (
		<BrowserRouter>
			<Layout />
		</BrowserRouter>
	)
}

function Layout() {
	return (
		<div style={{ fontFamily: 'system-ui', maxWidth: 960, margin: '0 auto', padding: 16 }}>
			<header style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
				<h2><Link to="/">Shop</Link></h2>
				<nav style={{ display: 'flex', gap: 12 }}>
					<Link to="/cart">Cart</Link>
					<AuthNav />
				</nav>
			</header>
			<Routes>
				<Route path="/" element={<ProductList />} />
				<Route path="/p/:slug" element={<ProductDetail />} />
				<Route path="/cart" element={<CartPage />} />
				<Route path="/login" element={<LoginPage />} />
			</Routes>
		</div>
	)
}

function AuthNav() {
	const [me, setMe] = useState<any | null>(null)
	useEffect(() => { fetch(`${API_BASE}/auth/me`, { credentials: 'include' }).then(r => r.ok ? r.json() : null).then(setMe).catch(() => {}) }, [])
	if (!me) return <Link to="/login">Login</Link>
	return <span>Hi, {me.name}</span>
}

function ProductList() {
	const [products, setProducts] = useState<any[]>([])
	useEffect(() => { fetch(`${API_BASE}/products`).then(r => r.json()).then(setProducts) }, [])
	return (
		<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16 }}>
			{products.map(p => (
				<Link to={`/p/${p.slug}`} key={p.id} style={{ border: '1px solid #ddd', padding: 12, textDecoration: 'none', color: 'inherit', borderRadius: 8 }}>
					<img src={p.imageUrl || 'https://via.placeholder.com/400x300?text=Product'} alt="" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6 }} />
					<h3 style={{ margin: '8px 0' }}>{p.title}</h3>
					<p>${(p.priceCents / 100).toFixed(2)}</p>
				</Link>
			))}
		</div>
	)
}

function ProductDetail() {
	const { slug } = useParams()
	const [p, setP] = useState<any | null>(null)
	const [qty, setQty] = useState(1)
	const navigate = useNavigate()
	useEffect(() => { fetch(`${API_BASE}/products/${slug}`).then(r => r.json()).then(setP) }, [slug])
	if (!p) return <div>Loading...</div>
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
			<img src={p.imageUrl || 'https://via.placeholder.com/600x400?text=Product'} alt="" style={{ width: '100%', borderRadius: 8 }} />
			<div>
				<h2>{p.title}</h2>
				<p>{p.description}</p>
				<p style={{ fontWeight: 700 }}>${(p.priceCents / 100).toFixed(2)}</p>
				<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
					<input type="number" min={1} value={qty} onChange={e => setQty(parseInt(e.target.value || '1'))} style={{ width: 80 }} />
					<button onClick={async () => {
						const resp = await fetch(`${API_BASE}/cart/items`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId: p.id, quantity: qty }), credentials: 'include' })
						if (resp.ok) navigate('/cart')
						else navigate('/login')
					}}>Add to Cart</button>
				</div>
			</div>
		</div>
	)
}

function CartPage() {
	const [cart, setCart] = useState<any | null>(null)
	const navigate = useNavigate()
	const refresh = () => fetch(`${API_BASE}/cart`, { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.reject()).then(setCart)
	useEffect(() => { refresh().catch(() => navigate('/login')) }, [])
	if (!cart) return <div>Loading...</div>
	const total = (cart.items?.reduce((s: number, i: any) => s + i.quantity * i.product?.priceCents ?? 0, 0) || 0) / 100
	return (
		<div>
			<h2>Your Cart</h2>
			<ul>
				{cart.items?.map((i: any) => (
					<li key={i.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
						<span>{i.quantity}x</span>
						<span>{i.productId}</span>
						<button onClick={async () => { await fetch(`${API_BASE}/cart/items/${i.id}`, { method: 'DELETE', credentials: 'include' }); refresh() }}>Remove</button>
					</li>
				))}
			</ul>
			<p>Total: ${total.toFixed(2)}</p>
			<button onClick={async () => { const r = await fetch(`${API_BASE}/orders/checkout`, { method: 'POST', credentials: 'include' }); if (r.ok) { alert('Order placed'); navigate('/') } else { alert('Checkout failed') } }}>Checkout</button>
		</div>
	)
}

function LoginPage() {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const navigate = useNavigate()
	return (
		<div style={{ maxWidth: 360 }}>
			<h2>Login</h2>
			<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
			<input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
			<button onClick={async () => {
				const r = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), credentials: 'include' })
				if (r.ok) navigate('/')
				else alert('Invalid credentials')
			}}>Login</button>
		</div>
	)
}
