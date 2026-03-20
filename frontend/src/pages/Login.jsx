import API_BASE_URL from '../config';
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

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
            background: 'var(--bg)',
            padding: '24px',
        }}>

            {/* Decorative background blob */}
            <div style={{
                position: 'fixed',
                top: '-20%',
                right: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(145,83,39,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed',
                bottom: '-20%',
                left: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(66,97,82,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{
                width: '100%',
                maxWidth: '420px',
                position: 'relative',
            }}>

                {/* Logo / Brand */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--accent)',
                        marginBottom: '16px',
                        fontSize: '28px',
                    }}>
                        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="14" cy="14" r="6" fill="var(--sage)"/>
                          <circle cx="14" cy="14" r="10" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                          <circle cx="14" cy="4" r="2.5" fill="var(--green)"/>
                          <circle cx="24" cy="19" r="2.5" fill="var(--green)"/>
                          <circle cx="4" cy="19" r="2.5" fill="var(--accent)"/>
                        </svg>
                    </div>
                    <h1 style={{ fontSize: '32px', letterSpacing: '-0.5px', color: 'var(--text)' }}>
                        Pantry Pal
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '15px' }}>
                        Sign in to your kitchen
                    </p>
                </div>

                {/* Card */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '20px',
                    padding: '40px',
                    boxShadow: 'var(--shadow)',
                }}>
                    <form onSubmit={handleSubmit}>

                        {/* Username */}
                        <div style={{ marginBottom: '20px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                marginBottom: '8px',
                            }}>
                                Email
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="your@email.com"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    color: 'var(--text)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        {/* Password */}
                        <div style={{ marginBottom: '28px' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '13px',
                                fontWeight: '500',
                                color: 'var(--text-muted)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.8px',
                                marginBottom: '8px',
                            }}>
                                Password
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={{
                                    width: '100%',
                                    padding: '12px 16px',
                                    background: 'var(--surface-2)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    color: 'var(--text)',
                                    fontSize: '15px',
                                    outline: 'none',
                                    transition: 'border-color 0.2s',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        {/* Error */}
                        {error && (
                            <div style={{
                                padding: '12px 16px',
                                background: 'rgba(145,83,39,0.15)',
                                border: '1px solid rgba(145,83,39,0.3)',
                                borderRadius: '10px',
                                color: '#E8A87C',
                                fontSize: '14px',
                                marginBottom: '20px',
                            }}>
                                {error}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loading ? 'var(--surface-2)' : 'var(--accent)',
                                color: loading ? 'var(--text-muted)' : 'var(--text)',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s, transform 0.1s',
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--accent-hover)' }}
                            onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--accent)' }}
                            onMouseDown={e => { if (!loading) e.target.style.transform = 'scale(0.98)' }}
                            onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>

                    </form>
                </div>

                {/* Footer link */}
                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                }}>
                    No account?{' '}
                    <Link to="/register" style={{ color: 'var(--sage)', textDecoration: 'none', fontWeight: '500' }}>
                        Create one
                    </Link>
                </p>

            </div>
        </div>
    )
}