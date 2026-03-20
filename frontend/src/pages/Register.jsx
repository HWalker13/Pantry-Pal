import API_BASE_URL from '../config';
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Register() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    async function handleSubmit(e) {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('Passwords do not match.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password }),
            })

            if (!res.ok) {
                const data = await res.json()
                setError(data.detail || 'Registration failed.')
                setLoading(false)
                return
            }

            // Auto-login after register
            const loginRes = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: username, password }),
            })

            const loginData = await loginRes.json()
            localStorage.setItem('token', loginData.access_token)
            navigate('/dashboard')

        } catch (err) {
            setError('Could not connect to server.')
            setLoading(false)
        }
    }

    const inputStyle = {
        width: '100%',
        padding: '12px 16px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text)',
        fontSize: '15px',
        outline: 'none',
        transition: 'border-color 0.2s',
    }

    const labelStyle = {
        display: 'block',
        fontSize: '13px',
        fontWeight: '500',
        color: 'var(--text-muted)',
        textTransform: 'uppercase',
        letterSpacing: '0.8px',
        marginBottom: '8px',
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

            {/* Decorative blobs */}
            <div style={{
                position: 'fixed',
                top: '-20%',
                left: '-10%',
                width: '600px',
                height: '600px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(66,97,82,0.12) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed',
                bottom: '-20%',
                right: '-10%',
                width: '500px',
                height: '500px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(145,83,39,0.1) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '420px', position: 'relative' }}>

                {/* Brand */}
                <div style={{ textAlign: 'center', marginBottom: '48px' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'var(--green)',
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
                        Create Account
                    </h1>
                    <p style={{ color: 'var(--text-muted)', marginTop: '6px', fontSize: '15px' }}>
                        Start managing your pantry
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

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Email</label>
                            <input
                                type="text"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                placeholder="your@email.com"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        <div style={{ marginBottom: '20px' }}>
                            <label style={labelStyle}>Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

                        <div style={{ marginBottom: '28px' }}>
                            <label style={labelStyle}>Confirm Password</label>
                            <input
                                type="password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="••••••••"
                                required
                                style={inputStyle}
                                onFocus={e => e.target.style.borderColor = 'var(--green)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                        </div>

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

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '13px',
                                background: loading ? 'var(--surface-2)' : 'var(--green)',
                                color: loading ? 'var(--text-muted)' : 'var(--text)',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s, transform 0.1s',
                            }}
                            onMouseEnter={e => { if (!loading) e.target.style.background = 'var(--green-hover)' }}
                            onMouseLeave={e => { if (!loading) e.target.style.background = 'var(--green)' }}
                            onMouseDown={e => { if (!loading) e.target.style.transform = 'scale(0.98)' }}
                            onMouseUp={e => e.target.style.transform = 'scale(1)'}
                        >
                            {loading ? 'Creating account...' : 'Create account'}
                        </button>

                    </form>
                </div>

                <p style={{
                    textAlign: 'center',
                    marginTop: '24px',
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                }}>
                    Already have an account?{' '}
                    <Link to="/login" style={{ color: 'var(--sage)', textDecoration: 'none', fontWeight: '500' }}>
                        Sign in
                    </Link>
                </p>

            </div>
        </div>
    )
}