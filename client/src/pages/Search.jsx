import { useState } from 'react';
import axios from '../api/axios';

const Search = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [addedIds, setAddedIds] = useState(new Set());
  const [adding, setAdding] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`/search?q=${encodeURIComponent(query)}`);
      setResults(res.data.results);
    } catch (err) {
      const statusCode = err.response?.status;
      if (statusCode === 500) {
        setError("The Manga database is currently experiencing issues. Please try again later.");
      } else if (statusCode === 429) {
        setError("Too many requests! Please wait a moment and try again.");
      } else {
        const errorMsg = err.response?.data?.message || err.message;
        setError(`Search failed: ${errorMsg}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (manga) => {
    setAdding(manga.malId);
    try {
      await axios.post('/list', {
        malId: manga.malId,
        title: manga.title,
        coverImage: manga.coverImage,
        type: manga.type,
        status: 'plan_to_read',
        progress: 0
      });
      setAddedIds(prev => new Set(prev).add(manga.malId));
    } catch (err) {
      const msg = err.response?.data?.message;
      if (msg === 'This title is already in your list') {
        setAddedIds(prev => new Set(prev).add(manga.malId));
      } else {
        alert('Failed to add. Try again.');
      }
    } finally {
      setAdding(null);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>Search Manga</h2>

        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for a manga..."
            style={styles.input}
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && <p style={styles.error}>{error}</p>}

        <div style={styles.grid}>
          {results.map(manga => (
            <div key={manga.malId} style={styles.card}>
              <img
                src={manga.coverImage || 'https://via.placeholder.com/150x200?text=No+Image'}
                alt={manga.title}
                style={styles.cover}
              />
              <div style={styles.info}>
                <h3 style={styles.title}>{manga.title}</h3>

                <div style={styles.meta}>
                  {manga.score && <span style={styles.score}>⭐ {manga.score}</span>}
                  {manga.status && <span style={styles.status}>{manga.status}</span>}
                  {manga.chapters && <span style={styles.chapters}>{manga.chapters} ch</span>}
                </div>

                {manga.genres.length > 0 && (
                  <div style={styles.genres}>
                    {manga.genres.slice(0, 3).map(g => (
                      <span key={g} style={styles.genre}>{g}</span>
                    ))}
                  </div>
                )}

                {manga.synopsis && (
                  <p style={styles.synopsis}>
                    {manga.synopsis.length > 120
                      ? manga.synopsis.slice(0, 120) + '...'
                      : manga.synopsis}
                  </p>
                )}

                <button
                  onClick={() => handleAdd(manga)}
                  style={{
                    ...styles.addButton,
                    ...(addedIds.has(manga.malId) ? styles.addedButton : {})
                  }}
                  disabled={addedIds.has(manga.malId) || adding === manga.malId}
                >
                  {adding === manga.malId
                    ? 'Adding...'
                    : addedIds.has(manga.malId)
                    ? '✓ Added'
                    : '+ Add to List'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: {
    minHeight: '100vh',
    padding: '2rem 1rem'
  },
  container: {
    maxWidth: '900px',
    margin: '0 auto'
  },
  heading: {
    fontSize: '1.5rem',
    fontWeight: '700',
    marginBottom: '1.5rem',
    color: '#e0e0e0'
  },
  form: {
    display: 'flex',
    gap: '0.75rem',
    marginBottom: '2rem'
  },
  input: {
    flex: 1,
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '0.75rem 1rem',
    color: '#e0e0e0',
    fontSize: '0.95rem',
    outline: 'none'
  },
  button: {
    background: '#e85d04',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    padding: '0.75rem 1.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  error: {
    color: '#e74c3c',
    marginBottom: '1rem'
  },
  grid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem'
  },
  card: {
    display: 'flex',
    gap: '1.25rem',
    background: '#1a1a1a',
    border: '1px solid #2a2a2a',
    borderRadius: '10px',
    padding: '1rem',
    alignItems: 'flex-start'
  },
  cover: {
    width: '80px',
    height: '110px',
    objectFit: 'cover',
    borderRadius: '6px',
    flexShrink: 0
  },
  info: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem'
  },
  title: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#e0e0e0'
  },
  meta: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center'
  },
  score: {
    fontSize: '0.8rem',
    color: '#f39c12'
  },
  status: {
    fontSize: '0.75rem',
    color: '#888',
    background: '#222',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px'
  },
  chapters: {
    fontSize: '0.75rem',
    color: '#888'
  },
  genres: {
    display: 'flex',
    gap: '0.4rem',
    flexWrap: 'wrap'
  },
  genre: {
    fontSize: '0.7rem',
    background: '#2a2a2a',
    color: '#aaa',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px'
  },
  synopsis: {
    fontSize: '0.82rem',
    color: '#999',
    lineHeight: '1.5'
  },
  addButton: {
    alignSelf: 'flex-start',
    marginTop: '0.25rem',
    background: '#e85d04',
    color: '#fff',
    border: 'none',
    borderRadius: '6px',
    padding: '0.4rem 1rem',
    fontSize: '0.82rem',
    fontWeight: '600',
    cursor: 'pointer'
  },
  addedButton: {
    background: '#2a2a2a',
    color: '#4caf50',
    cursor: 'default'
  }
};

export default Search;