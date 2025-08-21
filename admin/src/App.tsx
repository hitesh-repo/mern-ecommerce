import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'

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
		<div style={{ fontFamily: 'system-ui', maxWidth: 1000, margin: '0 auto', padding: 16 }}>
			<header style={{ display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
				<h2><Link to="/">Admin</Link></h2>
				<nav style={{ display: 'flex', gap: 12 }}>
					<Link to="/products">Products</Link>
					<Link to="/orders">Orders</Link>
				</nav>
			</header>
			<Routes>
				<Route path="/" element={<AdminHome />} />
				<Route path="/login" element={<Login />} />
				<Route path="/products" element={<Products />} />
				<Route path="/orders" element={<Orders />} />
			</Routes>
		</div>
	)
}

function AdminHome() {
	return <p>Use the navigation to manage products and view orders.</p>
}

function Login() {
	const [email, setEmail] = useState('admin@example.com')
	const [password, setPassword] = useState('admin123')
	const navigate = useNavigate()
	return (
		<div style={{ maxWidth: 360 }}>
			<h2>Admin Login</h2>
			<input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
			<input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ display: 'block', width: '100%', marginBottom: 8 }} />
			<button onClick={async () => {
				const r = await fetch(`${API_BASE}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }), credentials: 'include' })
				if (r.ok) navigate('/products')
				else alert('Invalid credentials')
			}}>Login</button>
		</div>
	)
}

function Products() {
	const [products, setProducts] = useState<any[]>([])
	const [form, setForm] = useState<any>({ title: '', slug: '', description: '', priceCents: 0, inventory: 0, imageUrl: '' })
	const refresh = () => fetch(`${API_BASE}/products`).then(r => r.json()).then(setProducts)
	useEffect(() => { refresh() }, [])
	return (
		<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
			<div>
				<h3>Create Product</h3>
				<input placeholder="Title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
				<input placeholder="Slug" value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} />
				<input placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
				<input placeholder="Price (cents)" type="number" value={form.priceCents} onChange={e => setForm({ ...form, priceCents: parseInt(e.target.value || '0') })} />
				<input placeholder="Inventory" type="number" value={form.inventory} onChange={e => setForm({ ...form, inventory: parseInt(e.target.value || '0') })} />
				<input placeholder="Image URL" value={form.imageUrl} onChange={e => setForm({ ...form, imageUrl: e.target.value })} />
				<div><button onClick={async () => { const r = await fetch(`${API_BASE}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form), credentials: 'include' }); if (r.ok) { setForm({ title: '', slug: '', description: '', priceCents: 0, inventory: 0, imageUrl: '' }); refresh() } else { alert('Create failed - are you logged in as admin?') } }}>Create</button></div>
			</div>
			<div>
				<h3>Products</h3>
				<ul>
					{products.map(p => (
						<li key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
							<span>{p.title}</span>
							<button onClick={async () => { await fetch(`${API_BASE}/products/${p.id}`, { method: 'DELETE', credentials: 'include' }); refresh() }}>Delete</button>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}

function Orders() {
	const [orders, setOrders] = useState<any[]>([])
	useEffect(() => { fetch(`${API_BASE}/orders`, { credentials: 'include' }).then(r => r.ok ? r.json() : Promise.reject()).then(setOrders).catch(() => alert('Login as admin')) }, [])
	return (
		<div>
			<h3>Orders</h3>
			<ul>
				{orders.map(o => (
					<li key={o.id}>Order {o.id} - Total ${(o.totalCents / 100).toFixed(2)} - Items: {o.items.length}</li>
				))}
			</ul>
		</div>
	)
}
