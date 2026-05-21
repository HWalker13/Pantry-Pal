import API_BASE_URL from '../config';
import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import PantryItem from '../components/PantryItem'

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Other']

const EMOJI = {
    Produce: '🥬', Protein: '🥩', Dairy: '🥛', Grains: '🌾',
    Snacks: '🍿', Beverages: '🧃', Condiments: '🫙', Other: '📦',
}

const inputStyle = {
    padding: '10px 13px',
    background: '#fff',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text)',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
}

export default function Dashboard() {
    const [items, setItems] = useState([])
    const [expiringItems, setExpiringItems] = useState([])
    const [newItem, setNewItem] = useState('')
    const [category, setCategory] = useState('Other')
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('')
    const [expirationDate, setExpirationDate] = useState('')
    const [loading, setLoading] = useState(true)
    const [adding, setAdding] = useState(false)
    const [recipes, setRecipes] = useState([])
    const [recipeLoading, setRecipeLoading] = useState(false)
    const [showRecipes, setShowRecipes] = useState(false)
    const [deletingId, setDeletingId] = useState(null)
    const [selectedIngredients, setSelectedIngredients] = useState([])
    const [showIngredientDropdown, setShowIngredientDropdown] = useState(false)
    const dropdownRef = useRef(null)
    const navigate = useNavigate()

    const token = localStorage.getItem('token')

    const authHeaders = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    }

    useEffect(() => {
        fetchItems()
        fetchExpiringItems()
    }, [])

    // Close ingredient dropdown on outside click
    useEffect(() => {
        function handleClick(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowIngredientDropdown(false)
            }
        }
        document.addEventListener('mousedown', handleClick)
        return () => document.removeEventListener('mousedown', handleClick)
    }, [])

    async function fetchItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/pantry/items`, {
                headers: authHeaders,
            })
            if (res.status === 401) {
                logout()
                return
            }
            const data = await res.json()
            setItems(data.items || [])
        } catch (err) {
            console.error('Failed to fetch items', err)
        } finally {
            setLoading(false)
        }
    }

    async function fetchExpiringItems() {
        try {
            const res = await fetch(`${API_BASE_URL}/pantry/items/expiring-soon`, {
                headers: authHeaders,
            })
            if (res.ok) {
                const data = await res.json()
                setExpiringItems(data.items || [])
            }
        } catch (err) {
            console.error('Failed to fetch expiring items', err)
        }
    }

    async function addItem(e) {
        e.preventDefault()
        if (!newItem.trim()) return
        setAdding(true)

        try {
            const res = await fetch(`${API_BASE_URL}/pantry/items`, {
                method: 'POST',
                headers: authHeaders,
                body: JSON.stringify({
                    name: newItem.trim(),
                    category,
                    quantity: quantity ? parseInt(quantity) : null,
                    unit: unit.trim() || null,
                    expiration_date: expirationDate || null,
                }),
            })
            if (res.ok) {
                setNewItem('')
                setCategory('Other')
                setQuantity('')
                setUnit('')
                setExpirationDate('')
                fetchItems()
                fetchExpiringItems()
            }
        } catch (err) {
            console.error('Failed to add item', err)
        } finally {
            setAdding(false)
        }
    }

    async function deleteItem(id) {
        setDeletingId(id)
        try {
            await fetch(`${API_BASE_URL}/pantry/items/${id}`, {
                method: 'DELETE',
                headers: authHeaders,
            })
            setItems(prev => prev.filter(item => item.id !== id))
            setExpiringItems(prev => prev.filter(item => item.id !== id))
            setSelectedIngredients(prev => {
                const deleted = items.find(i => i.id === id)
                return deleted ? prev.filter(n => n !== deleted.name) : prev
            })
        } catch (err) {
            console.error('Failed to delete item', err)
        } finally {
            setDeletingId(null)
        }
    }

    async function getSuggestions() {
        setRecipeLoading(true)
        setShowRecipes(true)
        setRecipes([])

        try {
            const res = await fetch(`${API_BASE_URL}/recipes/ai-suggestions`, {
                headers: authHeaders,
            })
            const data = await res.json()
            const sorted = (data.recipes || []).sort(
                (a, b) => b.uses_from_pantry.length - a.uses_from_pantry.length
            )
            setRecipes(sorted)
        } catch (err) {
            console.error('Failed to get suggestions', err)
        } finally {
            setRecipeLoading(false)
        }
    }

    function logout() {
        localStorage.removeItem('token')
        navigate('/login')
    }

    function toggleIngredient(name) {
        setSelectedIngredients(prev =>
            prev.includes(name) ? prev.filter(n => n !== name) : [...prev, name]
        )
    }

    // Group items by category
    const grouped = {}
    items.forEach(item => {
        const key = item.category || 'Uncategorized'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(item)
    })
    const orderedKeys = [
        ...CATEGORIES.filter(c => grouped[c]),
        ...(grouped['Uncategorized'] ? ['Uncategorized'] : []),
    ]

    return (
        <div style={{ minHeight: '100vh' }}>
            <Navbar onLogout={logout} />

            <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px' }}>

                {/* ── Section A: My Pantry ── */}
                <div style={{ marginBottom: '48px' }}>
                    <h1 style={{
                        fontSize: '38px',
                        letterSpacing: '-0.5px',
                        color: 'var(--accent)',
                        marginBottom: '8px',
                    }}>
                        My Pantry
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '24px' }}>
                        Add ingredients to your pantry to get started and find recipes you can make.
                    </p>

                    {/* Add Ingredient Card */}
                    <div style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: 'var(--shadow)',
                    }}>
                        {/* Dark header strip */}
                        <div style={{
                            background: '#1A1A1A',
                            padding: '12px 20px',
                        }}>
                            <span style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: '#fff',
                                textTransform: 'uppercase',
                                letterSpacing: '1.2px',
                                fontFamily: 'DM Sans, sans-serif',
                            }}>
                                Add Ingredient
                            </span>
                        </div>

                        {/* Form body */}
                        <div style={{ padding: '20px' }}>
                            <form onSubmit={addItem}>
                                {/* Row 1: Name + Category */}
                                <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                                    <div style={{ flex: '2', minWidth: '160px', position: 'relative' }}>
                                        <span style={{
                                            position: 'absolute',
                                            left: '12px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            color: 'var(--text-muted)',
                                            fontSize: '15px',
                                            pointerEvents: 'none',
                                        }}>
                                            🔍
                                        </span>
                                        <input
                                            type="text"
                                            value={newItem}
                                            onChange={e => setNewItem(e.target.value)}
                                            placeholder="e.g. Olive oil"
                                            required
                                            style={{ ...inputStyle, width: '100%', paddingLeft: '36px' }}
                                            onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                            onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                        />
                                    </div>
                                    <select
                                        value={category}
                                        onChange={e => setCategory(e.target.value)}
                                        required
                                        style={{ ...inputStyle, flex: '1', minWidth: '130px', cursor: 'pointer' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    >
                                        <option value="" disabled>Category...</option>
                                        {CATEGORIES.map(c => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Row 2: Qty + Unit + Expiry + Submit */}
                                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                                    <input
                                        type="number"
                                        value={quantity}
                                        onChange={e => setQuantity(e.target.value)}
                                        placeholder="Qty"
                                        style={{ ...inputStyle, flex: '0.5', minWidth: '70px' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                    <input
                                        type="text"
                                        value={unit}
                                        onChange={e => setUnit(e.target.value)}
                                        placeholder="Unit"
                                        style={{ ...inputStyle, flex: '0.7', minWidth: '80px' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                    <input
                                        type="date"
                                        value={expirationDate}
                                        onChange={e => setExpirationDate(e.target.value)}
                                        style={{ ...inputStyle, flex: '1', minWidth: '140px' }}
                                        onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                        onBlur={e => e.target.style.borderColor = 'var(--border)'}
                                    />
                                    <button
                                        type="submit"
                                        disabled={adding}
                                        style={{
                                            padding: '10px 20px',
                                            background: adding ? 'var(--border)' : 'var(--accent)',
                                            color: '#fff',
                                            border: 'none',
                                            borderRadius: '10px',
                                            fontSize: '14px',
                                            fontWeight: '500',
                                            cursor: adding ? 'not-allowed' : 'pointer',
                                            transition: 'background 0.2s',
                                            whiteSpace: 'nowrap',
                                        }}
                                        onMouseEnter={e => { if (!adding) e.target.style.background = 'var(--accent-hover)' }}
                                        onMouseLeave={e => { if (!adding) e.target.style.background = 'var(--accent)' }}
                                    >
                                        {adding ? 'Adding...' : '+ Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── Section B: Ingredients ── */}
                <div style={{ marginBottom: '48px' }}>
                    <h2 style={{
                        fontSize: '26px',
                        color: 'var(--accent)',
                        marginBottom: '16px',
                    }}>
                        Ingredients
                    </h2>

                    {/* Controls row */}
                    <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '20px',
                    }}>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'default' }}>
                            Your Ingredients ({items.length}) ▾
                        </span>
                        <span style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'default' }}>
                            Sort By: Category ▾
                        </span>
                    </div>

                    {/* Expiring Soon */}
                    {expiringItems.length > 0 && (
                        <div style={{
                            background: 'rgba(196,98,29,0.06)',
                            border: '1px solid rgba(196,98,29,0.25)',
                            borderRadius: '12px',
                            padding: '16px 20px',
                            marginBottom: '20px',
                        }}>
                            <p style={{
                                fontSize: '11px',
                                fontWeight: '600',
                                color: 'var(--accent)',
                                textTransform: 'uppercase',
                                letterSpacing: '0.9px',
                                marginBottom: '10px',
                            }}>
                                Expiring Soon
                            </p>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {expiringItems.map(item => (
                                    <div key={item.id} style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                    }}>
                                        <span style={{ color: 'var(--text)', fontSize: '14px' }}>{item.name}</span>
                                        <span style={{
                                            fontSize: '12px',
                                            color: 'var(--accent)',
                                            background: 'rgba(196,98,29,0.12)',
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                        }}>
                                            {item.expiration_date}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Items list */}
                    {loading ? (
                        <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px', fontSize: '14px' }}>
                            Loading your pantry...
                        </div>
                    ) : items.length === 0 ? (
                        <div style={{
                            textAlign: 'center',
                            padding: '56px 24px',
                            color: 'var(--text-muted)',
                            border: '1px dashed var(--border)',
                            borderRadius: '14px',
                            background: 'var(--surface)',
                        }}>
                            <div style={{ fontSize: '40px', marginBottom: '14px' }}>🥬</div>
                            <p style={{ fontSize: '15px', color: 'var(--text)' }}>Your pantry is empty.</p>
                            <p style={{ fontSize: '13px', marginTop: '6px' }}>Add some ingredients above to get started.</p>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                            {orderedKeys.map(key => (
                                <div key={key}>
                                    {/* Category header */}
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '10px',
                                        marginBottom: '10px',
                                    }}>
                                        <span style={{
                                            fontSize: '11px',
                                            fontWeight: '600',
                                            color: 'var(--text-category)',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px',
                                        }}>
                                            {EMOJI[key] || '📦'} {key}
                                        </span>
                                        <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                        {grouped[key].map(item => (
                                            <PantryItem
                                                key={item.id}
                                                id={item.id}
                                                name={item.name}
                                                category={item.category}
                                                quantity={item.quantity}
                                                unit={item.unit}
                                                expiryDate={item.expiration_date}
                                                onDelete={deleteItem}
                                                deletingId={deletingId}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* ── Section C: Recipes ── */}
                <div>
                    <h2 style={{
                        fontSize: '26px',
                        color: 'var(--accent)',
                        marginBottom: '16px',
                    }}>
                        Recipes
                    </h2>

                    {/* Ingredient multi-select */}
                    {items.length > 0 && (
                        <div style={{ marginBottom: '16px' }} ref={dropdownRef}>
                            {/* Trigger */}
                            <div
                                onClick={() => setShowIngredientDropdown(p => !p)}
                                style={{
                                    padding: '10px 14px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '14px',
                                    color: 'var(--text-muted)',
                                    userSelect: 'none',
                                }}
                            >
                                <span>Add Ingredients...</span>
                                <span style={{ fontSize: '12px' }}>▾</span>
                            </div>

                            {/* Dropdown list */}
                            {showIngredientDropdown && (
                                <div style={{
                                    marginTop: '4px',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '10px',
                                    boxShadow: 'var(--shadow)',
                                    maxHeight: '200px',
                                    overflowY: 'auto',
                                }}>
                                    {items.map(item => {
                                        const selected = selectedIngredients.includes(item.name)
                                        return (
                                            <div
                                                key={item.id}
                                                onClick={() => toggleIngredient(item.name)}
                                                style={{
                                                    padding: '10px 14px',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: '10px',
                                                    fontSize: '14px',
                                                    color: selected ? 'var(--accent)' : 'var(--text)',
                                                    background: selected ? 'rgba(196,98,29,0.06)' : 'transparent',
                                                    borderBottom: '1px solid var(--border)',
                                                    transition: 'background 0.15s',
                                                }}
                                                onMouseEnter={e => { if (!selected) e.currentTarget.style.background = 'var(--surface-2)' }}
                                                onMouseLeave={e => { e.currentTarget.style.background = selected ? 'rgba(196,98,29,0.06)' : 'transparent' }}
                                            >
                                                <span>{EMOJI[item.category] || '📦'}</span>
                                                <span>{item.name}</span>
                                                {selected && <span style={{ marginLeft: 'auto', fontSize: '12px' }}>✓</span>}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}

                            {/* Selected chips */}
                            {selectedIngredients.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                                    {selectedIngredients.map(name => {
                                        const item = items.find(i => i.name === name)
                                        return (
                                            <span key={name} style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '6px',
                                                padding: '4px 12px',
                                                background: 'rgba(196,98,29,0.10)',
                                                border: '1px solid rgba(196,98,29,0.25)',
                                                borderRadius: '20px',
                                                fontSize: '13px',
                                                color: 'var(--accent)',
                                            }}>
                                                {EMOJI[item?.category] || '📦'} {name}
                                                <button
                                                    onClick={() => toggleIngredient(name)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        color: 'var(--accent)',
                                                        cursor: 'pointer',
                                                        padding: '0',
                                                        fontSize: '14px',
                                                        lineHeight: 1,
                                                        marginLeft: '2px',
                                                    }}
                                                >
                                                    ✕
                                                </button>
                                            </span>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Find Recipes button */}
                    {items.length > 0 && (
                        <button
                            onClick={getSuggestions}
                            disabled={recipeLoading}
                            style={{
                                padding: '12px 28px',
                                background: recipeLoading ? 'var(--border)' : 'var(--accent)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '15px',
                                fontWeight: '500',
                                cursor: recipeLoading ? 'not-allowed' : 'pointer',
                                transition: 'background 0.2s',
                                marginBottom: '32px',
                            }}
                            onMouseEnter={e => { if (!recipeLoading) e.target.style.background = 'var(--accent-hover)' }}
                            onMouseLeave={e => { if (!recipeLoading) e.target.style.background = 'var(--accent)' }}
                        >
                            {recipeLoading ? '✦ Thinking...' : '+ Find Recipes'}
                        </button>
                    )}

                    {/* Recipe results */}
                    {showRecipes && (
                        <div>
                            {/* AI Suggestions header */}
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                marginBottom: '16px',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        color: 'var(--text)',
                                        fontFamily: 'Playfair Display, serif',
                                    }}>
                                        AI Suggestions
                                    </span>
                                    {!recipeLoading && recipes.length > 0 && (
                                        <span style={{
                                            background: 'var(--green)',
                                            color: '#fff',
                                            fontSize: '12px',
                                            padding: '2px 10px',
                                            borderRadius: '20px',
                                        }}>
                                            {recipes.length}
                                        </span>
                                    )}
                                </div>
                                <span style={{ fontSize: '13px', color: 'var(--text-muted)', cursor: 'default' }}>
                                    Sort By: Best Match ▾
                                </span>
                            </div>

                            {recipeLoading ? (
                                <div style={{
                                    padding: '48px',
                                    textAlign: 'center',
                                    color: 'var(--text-muted)',
                                    background: 'var(--surface)',
                                    border: '1px solid var(--border)',
                                    borderRadius: '14px',
                                    fontSize: '14px',
                                }}>
                                    <div style={{ fontSize: '24px', marginBottom: '12px' }}>✦</div>
                                    Generating recipes from your pantry...
                                </div>
                            ) : (
                                /* Horizontally scrollable recipe cards */
                                <div style={{
                                    display: 'flex',
                                    gap: '16px',
                                    overflowX: 'auto',
                                    paddingBottom: '8px',
                                    scrollbarWidth: 'thin',
                                    scrollbarColor: 'var(--border) transparent',
                                }}>
                                    {recipes.map((recipe, i) => {
                                        const matchPct = Math.round(
                                            (recipe.uses_from_pantry?.length || 0) /
                                            Math.max(recipe.ingredients?.length || 1, 1) * 100
                                        )
                                        return (
                                            <div
                                                key={i}
                                                style={{
                                                    width: '220px',
                                                    flexShrink: 0,
                                                    background: 'var(--surface)',
                                                    border: '1px solid var(--border)',
                                                    borderRadius: '14px',
                                                    overflow: 'hidden',
                                                    boxShadow: 'var(--shadow)',
                                                    transition: 'box-shadow 0.2s, transform 0.2s',
                                                    cursor: 'default',
                                                }}
                                                onMouseEnter={e => {
                                                    e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.12)'
                                                    e.currentTarget.style.transform = 'translateY(-2px)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.currentTarget.style.boxShadow = 'var(--shadow)'
                                                    e.currentTarget.style.transform = 'translateY(0)'
                                                }}
                                            >
                                                {/* Image placeholder */}
                                                <div style={{
                                                    height: '130px',
                                                    background: 'linear-gradient(135deg, #C4621D 0%, #E8944A 100%)',
                                                    position: 'relative',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '36px',
                                                }}>
                                                    🍳
                                                    <span style={{
                                                        position: 'absolute',
                                                        top: '10px',
                                                        right: '10px',
                                                        fontSize: '16px',
                                                        cursor: 'pointer',
                                                    }}>
                                                        ★
                                                    </span>
                                                    <span style={{
                                                        position: 'absolute',
                                                        bottom: '8px',
                                                        left: '10px',
                                                        background: 'rgba(0,0,0,0.45)',
                                                        color: '#fff',
                                                        fontSize: '11px',
                                                        padding: '2px 8px',
                                                        borderRadius: '20px',
                                                    }}>
                                                        ~30 min
                                                    </span>
                                                </div>

                                                {/* Card body */}
                                                <div style={{ padding: '14px' }}>
                                                    <p style={{
                                                        fontSize: '14px',
                                                        fontWeight: '500',
                                                        color: 'var(--text)',
                                                        marginBottom: '6px',
                                                        lineHeight: '1.35',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}>
                                                        {recipe.name}
                                                    </p>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                                                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                                                            {recipe.ingredients?.length || 0} ingr.
                                                        </span>
                                                        {matchPct > 0 && (
                                                            <span style={{
                                                                fontSize: '11px',
                                                                background: 'var(--green)',
                                                                color: '#fff',
                                                                padding: '2px 8px',
                                                                borderRadius: '20px',
                                                            }}>
                                                                {matchPct}% match
                                                            </span>
                                                        )}
                                                    </div>

                                                    {/* Instructions preview */}
                                                    {recipe.description && (
                                                        <p style={{
                                                            fontSize: '12px',
                                                            color: 'var(--text-muted)',
                                                            marginTop: '8px',
                                                            lineHeight: '1.5',
                                                            display: '-webkit-box',
                                                            WebkitLineClamp: 3,
                                                            WebkitBoxOrient: 'vertical',
                                                            overflow: 'hidden',
                                                        }}>
                                                            {recipe.description}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {items.length === 0 && !showRecipes && (
                        <div style={{
                            padding: '32px 24px',
                            textAlign: 'center',
                            color: 'var(--text-muted)',
                            background: 'var(--surface)',
                            border: '1px dashed var(--border)',
                            borderRadius: '14px',
                            fontSize: '14px',
                        }}>
                            Add ingredients to your pantry to find recipe suggestions.
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
