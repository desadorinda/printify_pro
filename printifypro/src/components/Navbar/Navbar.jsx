import { Link } from 'react-router-dom';
import { 
  FaHome, 
  FaTshirt, 
  FaPalette, 
  FaUser, 
  FaSignOutAlt, 
  FaSignInAlt, 
  FaUserPlus, 
  FaShoppingCart, 
  FaChartLine 
} from 'react-icons/fa';
import { useEffect, useState } from 'react';
import './Navbar.css';

const Navbar = ({ cartCount, onLogout }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Check for user in localStorage on component mount and updates
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem('user');
      if (userData) {
        setCurrentUser(JSON.parse(userData));
      }
    };

    checkUser();
    window.addEventListener('storage', checkUser); // Listen for storage changes

    return () => {
      window.removeEventListener('storage', checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setCurrentUser(null);
    if (onLogout) onLogout(); // Call parent logout handler if provided
  };

  return (
    <header className="navbar">
      <div className="navbar-content">
        <Link to="/" className="logo">
          <span className="logo-text">Printify</span>
          <span className="logo-highlight">Pro</span>
        </Link>

        <nav className="nav-main">
          <Link to="/" className="nav-link">
            <FaHome className="nav-icon" />
            <span>Home</span>
          </Link>
          <Link to="/products" className="nav-link">
            <FaTshirt className="nav-icon" />
            <span>Products</span>
          </Link>
          <Link to="/designs" className="nav-link">
            <FaPalette className="nav-icon" />
            <span>Designs</span>
          </Link>
        </nav>

        <div className="nav-auth">
          {currentUser ? (
            <div className="user-actions">
              <Link
                to={currentUser.role === 'admin' ? '/admin-dashboard' : '/dashboard'}
                className="nav-link dashboard-btn"
                onClick={e => {
                  // Prevent default navigation to handle role-based redirect
                  e.preventDefault();
                  if (currentUser.role === 'admin') {
                    window.location.href = '/admin-dashboard';
                  } else {
                    window.location.href = '/dashboard';
                  }
                }}
              >
                <FaChartLine className="nav-icon" />
                <span>Dashboard</span>
              </Link>
              <Link to="" className="nav-link">
                <FaUser className="nav-icon" />
                <span>{currentUser.username || 'Profile'}</span>
              </Link>
              <button onClick={handleLogout} className="nav-link logout-btn">
                <FaSignOutAlt className="nav-icon" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <>
              <Link to="/login" className="nav-link">
                <FaSignInAlt className="nav-icon" />
                <span>Login</span>
              </Link>
              <Link to="/signup" className="nav-link signup-btn">
                <FaUserPlus className="nav-icon" />
                <span>Sign Up</span>
              </Link>
            </>
          )}
          <Link to="/cart" className="nav-link cart-btn">
            <div className="cart-wrapper">
              <FaShoppingCart className="nav-icon" />
              {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;