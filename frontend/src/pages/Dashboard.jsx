import API_BASE_URL from '../config';
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

const CATEGORIES = ['Produce', 'Protein', 'Dairy', 'Grains', 'Snacks', 'Beverages', 'Condiments', 'Other']

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
                (a, b) => a.uses_from_pantry.length - b.uses_from_pantry.length
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

    const inputStyle = {
        padding: '11px 14px',
        background: 'var(--surface-2)',
        border: '1px solid var(--border)',
        borderRadius: '10px',
        color: 'var(--text)',
        fontSize: '14px',
        outline: 'none',
        transition: 'border-color 0.2s',
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
        <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>

            {/* Botanical vine decoration */}
            <svg width="250" height="900" viewBox="0 0 250 900" fill="none" style={{ position: 'fixed', top: 0, right: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <path d="M 72 0 C 68 28 70 54 62 84 C 54 112 40 126 36 156 C 32 182 42 196 37 226 C 32 252 20 265 15 294" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.26" fill="none"/>
                <path d="M 62 84 C 76 68 88 73 104 58" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 36 156 C 19 142 7 146 0 133" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.16" fill="none"/>
                <path d="M 37 226 C 51 210 62 214 76 200" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 15 294 C 28 278 38 282 51 268" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.14" fill="none"/>
                <path d="M 38 0 C 34 22 36 43 28 70 C 20 96 8 109 4 137 C 0 162 9 175 4 202 C 0 226 0 238 0 260" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.24" fill="none"/>
                <path d="M 28 70 C 42 54 54 58 68 44" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.17" fill="none"/>
                <path d="M 4 137 C 17 121 28 125 40 111" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 4 202 C 16 187 25 190 37 176" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.14" fill="none"/>
                <path d="M 165 0 C 162 20 163 40 157 64 C 151 88 140 100 137 124 C 134 146 142 158 138 182 C 134 204 123 216 119 238" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.26" fill="none"/>
                <path d="M 157 64 C 169 48 179 52 192 38" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 137 124 C 121 110 108 114 93 101" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.16" fill="none"/>
                <path d="M 138 182 C 152 166 162 170 175 156" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 119 238 C 105 224 94 228 80 215" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.14" fill="none"/>
                <path d="M 250 0 C 248 42 250 82 246 128 C 242 172 232 192 230 238 C 227 280 236 302 232 346 C 228 386 218 406 215 448 C 211 486 218 508 214 550 C 210 588 200 608 197 648" stroke="var(--green)" strokeWidth="1.5" strokeOpacity="0.34" fill="none"/>
                <path d="M 246 128 C 234 112 222 116 206 102" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.22" fill="none"/>
                <path d="M 230 238 C 244 221 250 225 250 209" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 232 346 C 218 330 208 334 193 321" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.22" fill="none"/>
                <path d="M 215 448 C 229 432 238 436 250 421" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 214 550 C 200 535 190 539 177 526" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 228 290 C 240 274 247 278 250 263" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 218 490 C 208 476 199 479 186 467" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 220 0 C 217 35 219 68 213 105 C 207 140 195 157 192 192 C 189 224 198 241 194 276 C 190 308 178 323 174 357 C 169 388 174 408 169 440 C 164 470 153 484 148 516" stroke="var(--green)" strokeWidth="1.6" strokeOpacity="0.36" fill="none"/>
                <path d="M 213 105 C 227 87 240 92 250 77" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.22" fill="none"/>
                <path d="M 192 192 C 174 177 159 181 142 168" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 194 276 C 209 259 220 263 234 248" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.21" fill="none"/>
                <path d="M 174 357 C 159 341 148 345 133 332" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 169 440 C 183 424 194 427 207 413" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 196 148 C 210 132 220 136 232 122" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 176 320 C 162 305 151 309 137 296" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 160 500 C 148 486 138 489 124 477" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 185 0 C 181 28 183 55 175 88 C 167 120 153 136 149 168 C 145 197 155 212 150 244 C 145 272 132 286 127 317 C 121 346 126 364 120 395" stroke="var(--green)" strokeWidth="1.4" strokeOpacity="0.30" fill="none"/>
                <path d="M 175 88 C 191 70 204 75 220 60" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.22" fill="none"/>
                <path d="M 149 168 C 130 153 115 157 97 143" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 150 244 C 164 228 174 232 187 217" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 127 317 C 112 301 100 305 84 292" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 153 130 C 138 115 126 119 111 106" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 128 280 C 114 265 103 269 88 256" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 122 358 C 136 342 146 346 159 331" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 148 0 C 144 24 146 47 137 77 C 128 106 114 120 110 151 C 106 179 116 193 110 224 C 104 252 91 265 86 295" stroke="var(--green)" strokeWidth="1.3" strokeOpacity="0.28" fill="none"/>
                <path d="M 137 77 C 152 59 165 64 181 49" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 110 151 C 91 136 75 140 57 127" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 110 224 C 125 208 136 212 150 197" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 86 295 C 99 279 110 282 123 268" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 112 108 C 96 93 83 97 68 84" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 88 258 C 74 243 63 247 48 234" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.16" fill="none"/>
                <path d="M 110 0 C 106 22 108 44 100 72 C 92 100 78 114 74 144 C 70 171 80 185 75 215 C 70 242 57 255 52 284" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.26" fill="none"/>
                <path d="M 100 72 C 115 55 128 59 143 45" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 74 144 C 55 129 40 133 23 119" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 75 215 C 90 199 101 202 115 188" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 76 106 C 61 91 49 95 34 82" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.16" fill="none"/>
                <path d="M 54 247 C 40 232 30 236 16 223" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 248 80 C 245 150 242 215 245 290 C 248 360 250 410 246 480 C 242 548 235 588 238 658 C 240 720 246 760 242 830 C 239 875 234 895 230 900" stroke="var(--green)" strokeWidth="2.0" strokeOpacity="0.46" fill="none"/>
                <path d="M 245 290 C 230 273 215 277 198 263" stroke="var(--green)" strokeWidth="1.3" strokeOpacity="0.26" fill="none"/>
                <path d="M 246 480 C 235 463 223 467 208 453" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.24" fill="none"/>
                <path d="M 238 658 C 250 641 250 644 250 629" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 242 830 C 228 814 216 817 200 804" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 244 372 C 236 355 226 358 213 345" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 240 556 C 250 539 250 542 250 527" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 239 732 C 226 715 216 718 203 705" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 243 200 C 230 184 219 187 205 174" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 237 615 C 224 599 214 602 200 589" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 241 770 C 250 753 250 756 250 741" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 228 130 C 224 198 220 260 223 335 C 226 403 229 452 224 524 C 219 590 211 630 213 700 C 215 762 221 802 216 872 C 213 890 208 900 204 900" stroke="var(--green)" strokeWidth="1.8" strokeOpacity="0.40" fill="none"/>
                <path d="M 223 335 C 208 318 193 322 176 308" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.24" fill="none"/>
                <path d="M 224 524 C 237 507 244 510 250 495" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.22" fill="none"/>
                <path d="M 213 700 C 199 683 187 687 172 673" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.20" fill="none"/>
                <path d="M 216 872 C 229 855 238 858 249 843" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 222 418 C 209 402 198 406 183 392" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 214 610 C 225 593 232 596 243 581" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 215 782 C 203 765 193 768 180 754" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 221 240 C 207 224 196 228 181 214" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 218 468 C 205 452 195 455 181 442" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 212 658 C 199 642 189 645 175 632" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 193 0 C 188 68 184 130 186 207 C 189 278 193 328 187 402 C 181 470 172 510 174 582 C 176 646 183 686 178 756 C 173 816 164 848 160 900" stroke="var(--green)" strokeWidth="1.7" strokeOpacity="0.38" fill="none"/>
                <path d="M 186 207 C 171 190 156 194 138 180" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.24" fill="none"/>
                <path d="M 187 402 C 201 385 212 388 226 373" stroke="var(--green)" strokeWidth="1.2" strokeOpacity="0.22" fill="none"/>
                <path d="M 174 582 C 157 565 144 569 128 555" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.20" fill="none"/>
                <path d="M 178 756 C 193 739 204 742 218 727" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 188 296 C 173 279 160 283 145 269" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 181 492 C 194 475 204 478 217 463" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 175 670 C 161 653 150 657 135 643" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 176 846 C 189 829 200 832 213 817" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.16" fill="none"/>
                <path d="M 187 155 C 172 139 160 142 145 129" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.20" fill="none"/>
                <path d="M 183 364 C 168 348 157 351 142 338" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 176 548 C 162 532 152 535 138 522" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 179 724 C 165 708 155 711 141 698" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.16" fill="none"/>
                <path d="M 153 65 C 148 133 144 197 146 273 C 149 343 153 393 147 467 C 141 535 132 575 134 647 C 136 711 143 751 138 821 C 134 863 126 887 122 900" stroke="var(--green)" strokeWidth="1.6" strokeOpacity="0.34" fill="none"/>
                <path d="M 146 273 C 131 256 116 260 99 246" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.22" fill="none"/>
                <path d="M 147 467 C 161 450 172 453 186 438" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.20" fill="none"/>
                <path d="M 134 647 C 118 630 106 634 91 620" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 138 821 C 153 804 164 807 179 792" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 147 362 C 134 346 123 349 109 336" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 141 556 C 154 539 164 542 177 527" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 135 732 C 149 715 160 718 174 703" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.16" fill="none"/>
                <path d="M 148 180 C 134 163 122 167 107 154" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.19" fill="none"/>
                <path d="M 145 430 C 131 414 120 417 105 404" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 136 610 C 122 594 111 597 97 584" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 137 788 C 150 772 160 775 173 761" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 108 145 C 104 213 100 273 102 346 C 105 416 110 466 104 538 C 98 606 89 646 91 716 C 93 778 100 818 95 886 C 93 894 90 900 88 900" stroke="var(--green)" strokeWidth="1.5" strokeOpacity="0.30" fill="none"/>
                <path d="M 102 346 C 116 329 128 332 142 318" stroke="var(--green)" strokeWidth="1.1" strokeOpacity="0.20" fill="none"/>
                <path d="M 104 538 C 118 521 130 524 145 509" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 91 716 C 105 699 117 702 131 687" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 95 886 C 108 869 119 872 132 857" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 103 432 C 89 415 78 419 63 406" stroke="var(--green)" strokeWidth="1.0" strokeOpacity="0.18" fill="none"/>
                <path d="M 92 626 C 106 609 117 612 130 597" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.16" fill="none"/>
                <path d="M 93 806 C 79 789 68 793 54 780" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 103 218 C 89 202 78 206 63 193" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.18" fill="none"/>
                <path d="M 105 308 C 91 292 80 296 65 283" stroke="var(--green)" strokeWidth="0.9" strokeOpacity="0.17" fill="none"/>
                <path d="M 97 502 C 84 486 74 489 60 477" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.16" fill="none"/>
                <path d="M 90 672 C 76 656 66 659 52 647" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 250 320 C 244 335 241 347 245 362" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.16" fill="none"/>
                <path d="M 250 510 C 243 525 240 537 244 552" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.15" fill="none"/>
                <path d="M 250 700 C 242 714 239 726 243 740" stroke="var(--green)" strokeWidth="0.8" strokeOpacity="0.14" fill="none"/>
                <path d="M 250 880 C 242 893 240 900 244 900" stroke="var(--green)" strokeWidth="0.7" strokeOpacity="0.13" fill="none"/>
                <path d="M 0 320 C 6 335 9 346 5 360" stroke="var(--green)" strokeWidth="0.7" strokeOpacity="0.13" fill="none"/>
                <path d="M 0 480 C 7 494 10 505 6 518" stroke="var(--green)" strokeWidth="0.7" strokeOpacity="0.12" fill="none"/>
                <ellipse cx="106" cy="60" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-18 106 60)"/>
                <ellipse cx="69" cy="46" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(16 69 46)"/>
                <ellipse cx="41" cy="113" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(18 41 113)"/>
                <ellipse cx="77" cy="203" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(16 77 203)"/>
                <ellipse cx="193" cy="41" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-16 193 41)"/>
                <ellipse cx="95" cy="104" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(14 95 104)"/>
                <ellipse cx="53" cy="270" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(18 53 270)"/>
                <ellipse cx="176" cy="158" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(16 176 158)"/>
                <ellipse cx="38" cy="178" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(14 38 178)"/>
                <ellipse cx="81" cy="217" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(-16 81 217)"/>
                <ellipse cx="208" cy="104" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.16" transform="rotate(-16 208 104)"/>
                <ellipse cx="143" cy="171" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.15" transform="rotate(20 143 171)"/>
                <ellipse cx="99" cy="146" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.14" transform="rotate(18 99 146)"/>
                <ellipse cx="59" cy="129" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(15 59 129)"/>
                <ellipse cx="23" cy="122" rx="8" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(12 23 122)"/>
                <ellipse cx="200" cy="264" rx="13" ry="4" fill="var(--sage)" fillOpacity="0.17" transform="rotate(-14 200 264)"/>
                <ellipse cx="179" cy="311" rx="11" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(16 179 311)"/>
                <ellipse cx="135" cy="335" rx="11" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-18 135 335)"/>
                <ellipse cx="112" cy="270" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(18 112 270)"/>
                <ellipse cx="86" cy="294" rx="9" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(14 86 294)"/>
                <ellipse cx="202" cy="174" rx="13" ry="4" fill="var(--sage)" fillOpacity="0.15" transform="rotate(-16 202 174)"/>
                <ellipse cx="183" cy="226" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-14 183 226)"/>
                <ellipse cx="145" cy="131" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-16 145 131)"/>
                <ellipse cx="113" cy="108" rx="11" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-18 113 108)"/>
                <ellipse cx="70" cy="86" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-16 70 86)"/>
                <ellipse cx="212" cy="458" rx="13" ry="4" fill="var(--sage)" fillOpacity="0.16" transform="rotate(-14 212 458)"/>
                <ellipse cx="180" cy="394" rx="13" ry="4" fill="var(--sage)" fillOpacity="0.15" transform="rotate(-14 180 394)"/>
                <ellipse cx="143" cy="271" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-16 143 271)"/>
                <ellipse cx="101" cy="248" rx="11" ry="3" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-16 101 248)"/>
                <ellipse cx="184" cy="490" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(18 184 490)"/>
                <ellipse cx="143" cy="511" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(18 143 511)"/>
                <ellipse cx="100" cy="430" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-16 100 430)"/>
                <ellipse cx="60" cy="408" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-16 60 408)"/>
                <ellipse cx="175" cy="678" rx="13" ry="4" fill="var(--sage)" fillOpacity="0.15" transform="rotate(-14 175 678)"/>
                <ellipse cx="131" cy="645" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.14" transform="rotate(-14 131 645)"/>
                <ellipse cx="93" cy="622" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.13" transform="rotate(16 93 622)"/>
                <ellipse cx="50" cy="648" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.12" transform="rotate(-14 50 648)"/>
                <ellipse cx="205" cy="806" rx="12" ry="4" fill="var(--sage)" fillOpacity="0.13" transform="rotate(-14 205 806)"/>
                <ellipse cx="178" cy="794" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.12" transform="rotate(16 178 794)"/>
                <ellipse cx="131" cy="860" rx="11" ry="4" fill="var(--sage)" fillOpacity="0.12" transform="rotate(15 131 860)"/>
                <ellipse cx="57" cy="782" rx="10" ry="3" fill="var(--sage)" fillOpacity="0.11" transform="rotate(-14 57 782)"/>
                <circle cx="108" cy="58" r="2.2" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="43" cy="109" r="2.0" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="178" cy="156" r="2.2" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="210" cy="102" r="2.5" fill="var(--accent)" fillOpacity="0.28"/>
                <circle cx="145" cy="169" r="2.3" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="101" cy="144" r="2.3" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="25" cy="120" r="2.0" fill="var(--accent)" fillOpacity="0.22"/>
                <circle cx="71" cy="84" r="2.0" fill="var(--accent)" fillOpacity="0.22"/>
                <circle cx="115" cy="106" r="2.2" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="204" cy="172" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="185" cy="224" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="145" cy="129" r="2.3" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="202" cy="262" r="3.0" fill="var(--accent)" fillOpacity="0.32"/>
                <circle cx="181" cy="309" r="2.5" fill="var(--accent)" fillOpacity="0.28"/>
                <circle cx="137" cy="333" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="103" cy="246" r="2.3" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="88" cy="292" r="2.2" fill="var(--accent)" fillOpacity="0.22"/>
                <circle cx="214" cy="456" r="2.8" fill="var(--accent)" fillOpacity="0.30"/>
                <circle cx="182" cy="392" r="2.8" fill="var(--accent)" fillOpacity="0.28"/>
                <circle cx="145" cy="269" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="103" cy="428" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="62" cy="406" r="2.3" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="186" cy="488" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="145" cy="509" r="2.3" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="177" cy="676" r="2.8" fill="var(--accent)" fillOpacity="0.28"/>
                <circle cx="133" cy="643" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="95" cy="620" r="2.5" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="52" cy="646" r="2.2" fill="var(--accent)" fillOpacity="0.22"/>
                <circle cx="207" cy="804" r="2.5" fill="var(--accent)" fillOpacity="0.26"/>
                <circle cx="180" cy="792" r="2.3" fill="var(--accent)" fillOpacity="0.24"/>
                <circle cx="133" cy="858" r="2.3" fill="var(--accent)" fillOpacity="0.22"/>
                <circle cx="59" cy="780" r="2.2" fill="var(--accent)" fillOpacity="0.20"/>
                <circle cx="55" cy="481" r="2.0" fill="var(--accent)" fillOpacity="0.20"/>
                <circle cx="66" cy="657" r="2.0" fill="var(--accent)" fillOpacity="0.18"/>
            </svg>

            {/* Ambient background */}
            <div style={{
                position: 'fixed', top: '-30%', right: '-15%',
                width: '700px', height: '700px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(145,83,39,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'fixed', bottom: '-20%', left: '-10%',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(66,97,82,0.08) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            {/* Navbar */}
            <nav style={{
                borderBottom: '1px solid var(--border)',
                padding: '0 32px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                background: 'rgba(26,24,21,0.8)',
                backdropFilter: 'blur(12px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="14" cy="14" r="6" fill="var(--sage)"/>
                      <circle cx="14" cy="14" r="10" stroke="var(--accent)" strokeWidth="1.5" fill="none"/>
                      <circle cx="14" cy="4" r="2.5" fill="var(--green)"/>
                      <circle cx="24" cy="19" r="2.5" fill="var(--green)"/>
                      <circle cx="4" cy="19" r="2.5" fill="var(--accent)"/>
                    </svg>
                    <span style={{
                        fontFamily: 'Playfair Display, serif',
                        fontSize: '20px',
                        color: 'var(--text)',
                        fontWeight: '500',
                    }}>
                        Pantry Pal
                    </span>
                </div>
                <button
                    onClick={logout}
                    style={{
                        padding: '8px 16px',
                        background: 'transparent',
                        border: '1px solid var(--border)',
                        borderRadius: '8px',
                        color: 'var(--text-muted)',
                        fontSize: '13px',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => {
                        e.target.style.borderColor = 'var(--text-muted)'
                        e.target.style.color = 'var(--text)'
                    }}
                    onMouseLeave={e => {
                        e.target.style.borderColor = 'var(--border)'
                        e.target.style.color = 'var(--text-muted)'
                    }}
                >
                    Sign out
                </button>
            </nav>

            {/* Main content */}
            <main style={{ maxWidth: '800px', margin: '0 auto', padding: '48px 24px' }}>

                {/* Header */}
                <div style={{ marginBottom: '40px' }}>
                    <h1 style={{
                        fontSize: '42px',
                        letterSpacing: '-1px',
                        color: 'var(--text)',
                        marginBottom: '8px',
                    }}>
                        Your Pantry
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>
                        {items.length === 0
                            ? 'Add your first ingredient to get started'
                            : `${items.length} item${items.length !== 1 ? 's' : ''} in your pantry`}
                    </p>
                    <div style={{ width: '120px', height: '2px', background: 'linear-gradient(to right, var(--accent), transparent)', marginTop: '12px' }} />
                </div>

                {/* Add item form */}
                <div style={{
                    background: 'var(--surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    padding: '24px',
                    marginBottom: '32px',
                    boxShadow: 'var(--shadow)',
                }}>
                    <p style={{
                        fontSize: '12px',
                        fontWeight: '500',
                        color: 'var(--text-muted)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.8px',
                        marginBottom: '16px',
                    }}>
                        Add Ingredient
                    </p>
                    <form onSubmit={addItem}>
                        {/* Row 1: Name + Category */}
                        <div style={{ display: 'flex', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                value={newItem}
                                onChange={e => setNewItem(e.target.value)}
                                placeholder="e.g. Olive oil"
                                required
                                style={{ ...inputStyle, flex: '2', minWidth: '160px' }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            />
                            <select
                                value={category}
                                onChange={e => setCategory(e.target.value)}
                                required
                                style={{
                                    ...inputStyle,
                                    flex: '1',
                                    minWidth: '130px',
                                    cursor: 'pointer',
                                }}
                                onFocus={e => e.target.style.borderColor = 'var(--accent)'}
                                onBlur={e => e.target.style.borderColor = 'var(--border)'}
                            >
                                {CATEGORIES.map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        {/* Row 2: Qty + Unit + Expiration + Submit */}
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
                                    padding: '11px 20px',
                                    background: adding ? 'var(--surface-2)' : 'var(--accent)',
                                    color: adding ? 'var(--text-muted)' : 'var(--text)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    cursor: adding ? 'not-allowed' : 'pointer',
                                    transition: 'background 0.2s, transform 0.1s',
                                    whiteSpace: 'nowrap',
                                }}
                                onMouseEnter={e => { if (!adding) e.target.style.background = 'var(--accent-hover)' }}
                                onMouseLeave={e => { if (!adding) e.target.style.background = 'var(--accent)' }}
                                onMouseDown={e => { if (!adding) e.target.style.transform = 'scale(0.97)' }}
                                onMouseUp={e => e.target.style.transform = 'scale(1)'}
                            >
                                {adding ? 'Adding...' : '+ Add'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Expiring Soon */}
                {expiringItems.length > 0 && (
                    <div style={{
                        background: 'rgba(145,83,39,0.08)',
                        border: '1px solid rgba(145,83,39,0.4)',
                        borderRadius: '14px',
                        padding: '20px 24px',
                        marginBottom: '32px',
                    }}>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--accent)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: '12px',
                        }}>
                            Expiring Soon
                        </p>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                                        background: 'rgba(145,83,39,0.15)',
                                        padding: '2px 8px',
                                        borderRadius: '6px',
                                    }}>
                                        {item.expiration_date}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Pantry items grouped by category */}
                {loading ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px' }}>
                        Loading your pantry...
                    </div>
                ) : items.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '64px 24px',
                        color: 'var(--text-muted)',
                        border: '1px dashed var(--border)',
                        borderRadius: '16px',
                    }}>
                        <div style={{ fontSize: '40px', marginBottom: '16px' }}>🥬</div>
                        <p style={{ fontSize: '15px' }}>Your pantry is empty.</p>
                        <p style={{ fontSize: '13px', marginTop: '6px' }}>Add some ingredients above to get started.</p>
                    </div>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', marginBottom: '32px' }}>
                        {orderedKeys.map(key => (
                            <div key={key}>
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '12px',
                                    marginBottom: '10px',
                                }}>
                                    <div style={{
                                        width: '3px',
                                        height: '16px',
                                        background: 'var(--green)',
                                        borderRadius: '2px',
                                        flexShrink: 0,
                                    }} />
                                    <p style={{
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        color: 'var(--text-muted)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1.2px',
                                    }}>
                                        {key}
                                    </p>
                                    <div style={{ flexGrow: 1, height: '1px', background: 'var(--border)' }} />
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                    {grouped[key].map(item => (
                                        <div
                                            key={item.id}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                padding: '16px 20px',
                                                background: 'var(--surface)',
                                                border: '1px solid var(--border)',
                                                borderRadius: '12px',
                                                transition: 'border-color 0.2s',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(157, 191, 114, 0.3)'}
                                            onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                                        >
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                <div style={{
                                                    width: '8px', height: '8px',
                                                    borderRadius: '50%',
                                                    background: 'var(--sage)',
                                                    flexShrink: 0,
                                                }} />
                                                <span style={{ color: 'var(--text)', fontSize: '15px' }}>{item.name}</span>
                                                {(item.quantity || item.unit) && (
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-muted)',
                                                        background: 'var(--surface-2)',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                    }}>
                                                        {item.quantity} {item.unit}
                                                    </span>
                                                )}
                                                {item.expiration_date && (
                                                    <span style={{
                                                        fontSize: '12px',
                                                        color: 'var(--text-muted)',
                                                        background: 'var(--surface-2)',
                                                        padding: '2px 8px',
                                                        borderRadius: '6px',
                                                    }}>
                                                        exp {item.expiration_date}
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => deleteItem(item.id)}
                                                disabled={deletingId === item.id}
                                                style={{
                                                    background: 'transparent',
                                                    border: 'none',
                                                    color: 'var(--text-muted)',
                                                    cursor: 'pointer',
                                                    fontSize: '18px',
                                                    lineHeight: 1,
                                                    padding: '4px 8px',
                                                    borderRadius: '6px',
                                                    transition: 'color 0.2s, background 0.2s',
                                                }}
                                                onMouseEnter={e => {
                                                    e.target.style.color = '#E8A87C'
                                                    e.target.style.background = 'rgba(145,83,39,0.15)'
                                                }}
                                                onMouseLeave={e => {
                                                    e.target.style.color = 'var(--text-muted)'
                                                    e.target.style.background = 'transparent'
                                                }}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* AI Suggestions button */}
                {items.length > 0 && (
                    <button
                        onClick={getSuggestions}
                        disabled={recipeLoading}
                        style={{
                            width: '100%',
                            padding: '16px',
                            background: recipeLoading ? 'var(--surface)' : 'var(--green)',
                            color: recipeLoading ? 'var(--text-muted)' : 'var(--text)',
                            border: recipeLoading ? '1px solid var(--border)' : 'none',
                            borderRadius: '12px',
                            fontSize: '15px',
                            fontWeight: '500',
                            cursor: recipeLoading ? 'not-allowed' : 'pointer',
                            transition: 'background 0.2s, transform 0.1s',
                            marginBottom: '32px',
                        }}
                        onMouseEnter={e => { if (!recipeLoading) e.target.style.background = 'var(--green-hover)' }}
                        onMouseLeave={e => { if (!recipeLoading) e.target.style.background = 'var(--green)' }}
                        onMouseDown={e => { if (!recipeLoading) e.target.style.transform = 'scale(0.99)' }}
                        onMouseUp={e => e.target.style.transform = 'scale(1)'}
                    >
                        {recipeLoading ? '✦ Thinking...' : '✦ Suggest recipes from my pantry'}
                    </button>
                )}

                {/* Recipe suggestions */}
                {showRecipes && (
                    <div>
                        <p style={{
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--text-muted)',
                            textTransform: 'uppercase',
                            letterSpacing: '0.8px',
                            marginBottom: '16px',
                        }}>
                            AI Suggestions
                        </p>

                        {recipeLoading ? (
                            <div style={{
                                padding: '48px',
                                textAlign: 'center',
                                color: 'var(--text-muted)',
                                background: 'var(--surface)',
                                border: '1px solid var(--border)',
                                borderRadius: '16px',
                            }}>
                                <div style={{ fontSize: '24px', marginBottom: '12px' }}>✦</div>
                                Generating recipes from your pantry...
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                {recipes.map((recipe, i) => (
                                    <div
                                        key={i}
                                        style={{
                                            padding: '24px',
                                            background: 'var(--surface)',
                                            border: '1px solid var(--border)',
                                            borderRadius: '16px',
                                            boxShadow: 'var(--shadow)',
                                        }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                                            <div style={{
                                                width: '32px', height: '32px',
                                                borderRadius: '8px',
                                                background: 'var(--surface-2)',
                                                border: '1px solid var(--border)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                fontSize: '13px',
                                                color: 'var(--text-muted)',
                                                flexShrink: 0,
                                                fontFamily: 'Playfair Display, serif',
                                            }}>
                                                {i + 1}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <h3 style={{
                                                    fontSize: '18px',
                                                    color: 'var(--text)',
                                                    marginBottom: '8px',
                                                    letterSpacing: '-0.3px',
                                                }}>
                                                    {recipe.name}
                                                </h3>
                                                <p style={{
                                                    color: 'var(--text-muted)',
                                                    fontSize: '14px',
                                                    lineHeight: '1.6',
                                                    marginBottom: '12px',
                                                }}>
                                                    {recipe.description}
                                                </p>
                                                {recipe.ingredients && (
                                                    <div style={{
                                                        display: 'flex',
                                                        flexWrap: 'wrap',
                                                        gap: '6px',
                                                        marginBottom: '12px',
                                                    }}>
                                                        {recipe.ingredients.map((ing, j) => (
                                                            <span key={j} style={{
                                                                fontSize: '12px',
                                                                padding: '3px 10px',
                                                                background: 'rgba(66,97,82,0.2)',
                                                                border: '1px solid rgba(66,97,82,0.3)',
                                                                borderRadius: '20px',
                                                                color: 'var(--sage)',
                                                            }}>
                                                                {ing}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                                {recipe.instructions && (
                                                    <div style={{
                                                        borderTop: '1px solid var(--border)',
                                                        paddingTop: '12px',
                                                        marginTop: '4px',
                                                    }}>
                                                        <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                                            {recipe.instructions.split('. ').filter(s => s.trim() !== '').map((step, si) => (
                                                                <div key={si} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                                                                    <span style={{
                                                                        background: 'var(--surface-2)',
                                                                        color: 'var(--text-muted)',
                                                                        fontSize: '11px',
                                                                        minWidth: '20px',
                                                                        borderRadius: '4px',
                                                                        padding: '2px 6px',
                                                                        textAlign: 'center',
                                                                        flexShrink: 0,
                                                                    }}>
                                                                        {si + 1}
                                                                    </span>
                                                                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', lineHeight: '1.6' }}>
                                                                        {step}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

            </main>
        </div>
    )
}
