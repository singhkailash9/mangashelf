import { useState, useEffect } from 'react';
import axios from '../api/axios';

const STATUS_LABELS = {
  reading: 'Reading',
  completed: 'Completed',
  plan_to_read: 'Plan to Read',
  dropped: 'Dropped'
};

const STATUS_COLORS = {
  reading: '#3498db',
  completed: '#2ecc71',
  plan_to_read: '#f39c12',
  dropped: '#e74c3c'
};

const Dashboard = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await axios.get('/list');
      setEntries(res.data.entries);
    } catch (err) {
      console.error(`Failed to fetch list. Error: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this from your list?')) return;
    try {
      await axios.delete(`/list/${id}`);
      setEntries(prev => prev.filter(e => e._id !== id));
    } catch {
      alert('Failed to remove entry.');
    }
  };

  const handleEditStart = (entry) => {
    setEditingId(entry._id);
    setEditData({
      status: entry.status,
      progress: entry.progress,
      rating: entry.rating || ''
    });
  };

  const handleEditSave = async (id) => {
    try {
      const res = await axios.patch(`/list/${id}`, {
        status: editData.status,
        progress: Number(editData.progress),
        rating: editData.rating ? Number(editData.rating) : null
      });
      setEntries(prev => prev.map(e => e._id === id ? res.data.entry : e));
      setEditingId(null);
    } catch {
      alert('Failed to update entry.');
    }
  };

  const filtered = filter === 'all'
    ? entries
    : entries.filter(e => e.status === filter);

  const stats = {
    total: entries.length,
    reading: entries.filter(e => e.status === 'reading').length,
    completed: entries.filter(e => e.status === 'completed').length,
    plan_to_read: entries.filter(e => e.status === 'plan_to_read').length,
    dropped: entries.filter(e => e.status === 'dropped').length
  };

  if (loading) return <div style={styles.loading}>Loading your list...</div>;

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>My List</h2>

        {/* Stats */}
        <div style={styles.statsRow}>
          {Object.entries(stats).map(([key, val]) => (
            <div key={key} style={styles.statCard}>
              <span style={styles.statNum}>{val}</span>
              <span style={styles.statLabel}>
                {key === 'total' ? 'Total' : STATUS_LABELS[key]}
              </span>
            </div>
          ))}
        </div>

        {/* Filter tabs */}
        <div style={styles.filters}>
          {['all', 'reading', 'completed', 'plan_to_read', 'dropped'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                ...styles.filterBtn,
                ...(filter === f ? styles.filterActive : {})
              }}
            >
              {f === 'all' ? 'All' : STATUS_LABELS[f]}
            </button>
          ))}
        </div>

        {/* Empty state */}
        {filtered.length === 0 && (
          <div style={styles.empty}>
            {entries.length === 0
              ? 'Your list is empty. Go search for some manga!'
              : 'No entries match this filter.'}
          </div>
        )}

        {/* Entry list */}
        <div style={styles.list}>
          {filtered.map(entry => (
            <div key={entry._id} style={styles.card}>
              <img
                src={entry.coverImage || 'https://via.placeholder.com/60x80?text=?'}
                alt={entry.title}
                style={styles.cover}
              />

              <div style={styles.info}>
                <h3 style={styles.title}>{entry.title}</h3>

                {editingId === entry._id ? (
                  <div style={styles.editForm}>
                    <select
                      value={editData.status}
                      onChange={e => setEditData(p => ({ ...p, status: e.target.value }))}
                      style={styles.select}
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>

                    <input
                      type="number"
                      value={editData.progress}
                      onChange={e => setEditData(p => ({ ...p, progress: e.target.value }))}
                      placeholder="Chapter"
                      min="0"
                      style={styles.numberInput}
                    />

                    <input
                      type="number"
                      value={editData.rating}
                      onChange={e => setEditData(p => ({ ...p, rating: e.target.value }))}
                      placeholder="Rating 1-10"
                      min="1"
                      max="10"
                      style={styles.numberInput}
                    />

                    <div style={styles.editActions}>
                      <button onClick={() => handleEditSave(entry._id)} style={styles.saveBtn}>Save</button>
                      <button onClick={() => setEditingId(null)} style={styles.cancelBtn}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <div style={styles.entryMeta}>
                    <span style={{
                      ...styles.statusBadge,
                      background: STATUS_COLORS[entry.status] + '22',
                      color: STATUS_COLORS[entry.status]
                    }}>
                      {STATUS_LABELS[entry.status]}
                    </span>
                    <span style={styles.metaText}>Ch. {entry.progress}</span>
                    {entry.rating && <span style={styles.metaText}>⭐ {entry.rating}/10</span>}
                  </div>
                )}
              </div>

              {editingId !== entry._id && (
                <div style={styles.actions}>
                  <button onClick={() => handleEditStart(entry)} style={styles.editBtn}>Edit</button>
                  <button onClick={() => handleDelete(entry._id)} style={styles.deleteBtn}>Remove</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  page: { minHeight: '100vh', padding: '2rem 1rem' },
  container: { maxWidth: '900px', margin: '0 auto' },
  loading: { padding: '4rem', textAlign: 'center', color: '#888' },
  heading: { fontSize: '1.5rem', fontWeight: '700', marginBottom: '1.5rem', color: '#e0e0e0' },
  statsRow: { display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  statCard: {
    background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '8px',
    padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column',
    alignItems: 'center', minWidth: '80px'
  },
  statNum: { fontSize: '1.5rem', fontWeight: '700', color: '#e85d04' },
  statLabel: { fontSize: '0.75rem', color: '#888', marginTop: '0.2rem' },
  filters: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', flexWrap: 'wrap' },
  filterBtn: {
    background: 'transparent', border: '1px solid #333', color: '#888',
    padding: '0.4rem 1rem', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem'
  },
  filterActive: { background: '#e85d04', border: '1px solid #e85d04', color: '#fff' },
  empty: { textAlign: 'center', color: '#888', padding: '3rem', background: '#1a1a1a', borderRadius: '10px' },
  list: { display: 'flex', flexDirection: 'column', gap: '0.75rem' },
  card: {
    display: 'flex', gap: '1rem', background: '#1a1a1a', border: '1px solid #2a2a2a',
    borderRadius: '10px', padding: '1rem', alignItems: 'center'
  },
  cover: { width: '55px', height: '75px', objectFit: 'cover', borderRadius: '5px', flexShrink: 0 },
  info: { flex: 1 },
  title: { fontSize: '0.95rem', fontWeight: '600', color: '#e0e0e0', marginBottom: '0.5rem' },
  entryMeta: { display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' },
  statusBadge: { fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '4px', fontWeight: '500' },
  metaText: { fontSize: '0.8rem', color: '#888' },
  actions: { display: 'flex', flexDirection: 'column', gap: '0.4rem' },
  editBtn: {
    background: 'transparent', border: '1px solid #444', color: '#aaa',
    padding: '0.3rem 0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem'
  },
  deleteBtn: {
    background: 'transparent', border: '1px solid #c0392b', color: '#e74c3c',
    padding: '0.3rem 0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem'
  },
  editForm: { display: 'flex', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' },
  select: {
    background: '#111', border: '1px solid #333', color: '#e0e0e0',
    padding: '0.3rem 0.5rem', borderRadius: '5px', fontSize: '0.82rem'
  },
  numberInput: {
    background: '#111', border: '1px solid #333', color: '#e0e0e0',
    padding: '0.3rem 0.5rem', borderRadius: '5px', fontSize: '0.82rem', width: '90px'
  },
  editActions: { display: 'flex', gap: '0.4rem' },
  saveBtn: {
    background: '#e85d04', color: '#fff', border: 'none',
    padding: '0.3rem 0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem'
  },
  cancelBtn: {
    background: 'transparent', border: '1px solid #444', color: '#aaa',
    padding: '0.3rem 0.75rem', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem'
  }
};

export default Dashboard;