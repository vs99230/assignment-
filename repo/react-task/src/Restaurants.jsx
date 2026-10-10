import { useEffect, useState } from 'react';
import { fetchRestaurants } from './api.js';

// The API response shape is not documented, so read common field names safely.
const pick = (r, keys) => keys.map((k) => k.split('.').reduce((o, p) => o?.[p], r)).find(Boolean);

function normalize(r) {
  const img = pick(r, ['images.0.url', 'images.0', 'image', 'logo', 'cover_image', 'thumbnail']);
  return {
    id: pick(r, ['id', 'restaurant_id', '_id']),
    name: pick(r, ['restaurant_name', 'name', 'title']) || 'Restaurant',
    image: typeof img === 'string' ? img : null,
    location: pick(r, ['location.location_locality', 'location', 'address', 'city_name']),
    rating: pick(r, ['rating', 'avg_rating']),
  };
}

export default function Restaurants({ token, onLogout }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    fetchRestaurants(token)
      .then((list) => !cancelled && setItems(list.map(normalize)))
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [token]);

  return (
    <main className="page">
      <header className="top">
        <h1>Restaurants</h1>
        <button className="link" onClick={onLogout}>Logout</button>
      </header>

      {loading && <p className="muted">Loading restaurants...</p>}
      {error && <p className="error">{error}</p>}
      {!loading && !error && items.length === 0 && <p className="muted">No restaurants found.</p>}

      <div className="grid">
        {items.map((r, i) => (
          <article className="rest" key={r.id ?? i}>
            {r.image ? <img src={r.image} alt={r.name} loading="lazy" /> : <div className="ph" />}
            <div className="info">
              <h3>{r.name}</h3>
              {r.location && <p className="muted">{String(r.location)}</p>}
              {r.rating && <span className="badge">★ {r.rating}</span>}
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
