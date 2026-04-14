import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/dashboard" style={styles.brand}>MangaShelf</Link>
      <div style={styles.links}>
        {user ? (
          <>
            <Link to="/search" style={styles.link}>Search</Link>
            <Link to="/dashboard" style={styles.link}>My List</Link>
            <span style={styles.username}>{user.username}</span>
            <button onClick={handleLogout} style={styles.button}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.link}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1rem 2rem',
    background: '#1a1a1a',
    borderBottom: '1px solid #2a2a2a',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },
  brand: {
    fontSize: '1.3rem',
    fontWeight: '700',
    color: '#e85d04'
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem'
  },
  link: {
    color: '#aaa',
    fontSize: '0.9rem',
    transition: 'color 0.2s'
  },
  username: {
    color: '#e0e0e0',
    fontSize: '0.9rem',
    fontWeight: '500'
  },
  button: {
    background: 'transparent',
    border: '1px solid #444',
    color: '#aaa',
    padding: '0.4rem 1rem',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '0.875rem'
  }
};

export default Navbar;