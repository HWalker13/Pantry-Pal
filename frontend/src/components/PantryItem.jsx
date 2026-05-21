const EMOJI = {
    Produce: '🥬',
    Protein: '🥩',
    Dairy: '🥛',
    Grains: '🌾',
    Snacks: '🍿',
    Beverages: '🧃',
    Condiments: '🫙',
    Other: '📦',
}

function formatDate(dateStr) {
    if (!dateStr) return null
    const d = new Date(dateStr + 'T00:00:00')
    return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
}

export default function PantryItem({ id, name, category, quantity, unit, expiryDate, onDelete, deletingId }) {
    const emoji = EMOJI[category] || '📦'
    const formatted = formatDate(expiryDate)
    const isDeleting = deletingId === id

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '14px 18px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: '12px',
            gap: '14px',
            boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
            transition: 'border-color 0.2s, box-shadow 0.2s',
            opacity: isDeleting ? 0.5 : 1,
        }}
            onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'rgba(196,98,29,0.3)'
                e.currentTarget.style.boxShadow = 'var(--shadow)'
            }}
            onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)'
                e.currentTarget.style.boxShadow = 'none'
            }}
        >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{emoji}</span>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '15px', color: 'var(--text)', fontWeight: '400', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {category}
                </div>
            </div>

            {(quantity || unit) && (
                <span style={{
                    fontSize: '14px',
                    fontWeight: '500',
                    color: 'var(--accent)',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                }}>
                    {quantity} {unit}
                </span>
            )}

            {formatted && (
                <span style={{
                    fontSize: '12px',
                    background: 'var(--green)',
                    color: '#fff',
                    padding: '3px 10px',
                    borderRadius: '20px',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                }}>
                    📅 {formatted}
                </span>
            )}

            <button
                onClick={() => onDelete(id)}
                disabled={isDeleting}
                title="Delete"
                style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    fontSize: '20px',
                    lineHeight: 1,
                    padding: '4px 8px',
                    borderRadius: '6px',
                    flexShrink: 0,
                    transition: 'color 0.2s, background 0.2s',
                }}
                onMouseEnter={e => {
                    if (!isDeleting) {
                        e.target.style.color = 'var(--accent)'
                        e.target.style.background = 'rgba(196,98,29,0.08)'
                    }
                }}
                onMouseLeave={e => {
                    e.target.style.color = 'var(--text-muted)'
                    e.target.style.background = 'transparent'
                }}
            >
                ⋮
            </button>
        </div>
    )
}
