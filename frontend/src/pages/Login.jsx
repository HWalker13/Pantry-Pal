import API_BASE_URL from '../config';
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

const AppIcon = () => (
    <svg width="56" height="56" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#C4621D"/>
        <circle cx="13" cy="14" r="3.5" fill="#2D5A27"/>
        <circle cx="22" cy="26" r="8" fill="#5A8A5A"/>
    </svg>
)

const inputStyle = {
    width: '100%',
    padding: '14px 16px',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
}

const labelStyle = {
    display: 'block',
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.9px',
    marginBottom: '6px',
}

export default function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password }),
            })

            if (!res.ok) {
                setError('Invalid email or password.')
                setLoading(false)
                return
            }

            const data = await res.json()
            localStorage.setItem('token', data.access_token)
            navigate('/dashboard')
        } catch (err) {
            setError('Could not connect to server.')
            setLoading(false)
        }
    }

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            position: 'relative',
        }}>
            {/* Vine — top right */}
            <img
                src="/vine.jpg"
                alt=""
                style={{
                    position: 'fixed',
                    top: 0,
                    right: 0,
                    width: '320px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    userSelect: 'none',
                    mixBlendMode: 'multiply',
                    opacity: 0.88,
                }}
            />
            {/* Vine — top left (flipped) */}
            <img
                src="/vine.jpg"
                alt=""
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '200px',
                    pointerEvents: 'none',
                    zIndex: 0,
                    userSelect: 'none',
                    transform: 'scaleX(-1)',
                    mixBlendMode: 'multiply',
                    opacity: 0.88,
                }}
            />

            <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

                {/* Outer card */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '24px',
                    padding: '48px 40px',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
                }}>
                    {/* Brand section */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <AppIcon />
                        </div>
                        <h1 style={{
                            fontSize: '42px',
                            letterSpacing: '-0.5px',
                            color: 'var(--accent)',
                            marginBottom: '6px',
                        }}>
                            Pantry Pal
                        </h1>
                        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>
                            Sign in to your kitchen
                        </p>
                    </div>

                    {/* Inner form card */}
                    <div style={{
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '24px',
                        background: 'var(--surface-2)',
                    }}>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: '18px' }}>
                                <label style={labelStyle}>Email</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    placeholder="your@email.com"
                                    required
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={labelStyle}>Password</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    style={inputStyle}
                                    onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                />
                            </div>

                            {error && (
                                <div style={{
                                    padding: '11px 14px',
                                    background: 'rgba(196,98,29,0.08)',
                                    border: '1px solid rgba(196,98,29,0.25)',
                                    borderRadius: '10px',
                                    color: 'var(--accent)',
                                    fontSize: '13px',
                                    marginBottom: '18px',
                                }}>
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    width: '100%',
                                    padding: '13px',
                                    background: loading ? 'var(--border)' : 'linear-gradient(135deg, #C4621D, #D4732E)',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: '12px',
                                    fontSize: '15px',
                                    fontWeight: '500',
                                    cursor: loading ? 'not-allowed' : 'pointer',
                                    transition: 'opacity 0.2s, box-shadow 0.2s',
                                    boxShadow: loading ? 'none' : '0 4px 16px rgba(196,98,29,0.35)',
                                }}
                                onMouseEnter={e => { if (!loading) e.target.style.opacity = '0.9' }}
                                onMouseLeave={e => { if (!loading) e.target.style.opacity = '1' }}
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Footer link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '20px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                }}>
                    No account?{' '}
                    <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: '600' }}>
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    )
}
