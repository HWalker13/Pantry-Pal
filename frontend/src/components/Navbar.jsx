import { Link } from 'react-router-dom'

const AppIcon = ({ size = 32 }) => (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="8" fill="#C4621D"/>
        <circle cx="13" cy="14" r="3.5" fill="#2D5A27"/>
        <circle cx="22" cy="26" r="8" fill="#5A8A5A"/>
    </svg>
)

export default function Navbar({ onLogout }) {
    return (
        <nav style={{
            background: 'var(--surface)',
            borderBottom: '1px solid var(--border)',
            padding: '0 48px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AppIcon size={32} />
                <span style={{
                    fontFamily: 'Playfair Display, serif',
                    fontSize: '20px',
                    fontWeight: '500',
                    color: 'var(--text)',
                }}>
                    Pantry Pal
                </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                <a href="#" style={{
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    textDecoration: 'none',
                }}>
                    Favorites
                </a>
                <Link to="/dashboard" style={{
                    color: 'var(--text-muted)',
                    fontSize: '14px',
                    textDecoration: 'none',
                }}>
                    My Pantry
                </Link>
                <button
                    onClick={onLogout}
                    style={{
                        padding: '7px 16px',
                        background: 'transparent',
                        border: '1px solid var(--accent)',
                        borderRadius: '8px',
                        color: 'var(--accent)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => e.target.style.background = 'rgba(196,98,29,0.06)'}
                    onMouseLeave={e => e.target.style.background = 'transparent'}
                >
                    Sign out
                </button>
            </div>
        </nav>
    )
}
