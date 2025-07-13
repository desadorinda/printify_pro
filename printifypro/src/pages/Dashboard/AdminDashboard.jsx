import { useEffect, useState } from "react";
import { Link, useNavigate, Outlet, useLocation } from "react-router-dom";
import { FaUser, FaBox, FaClipboardList, FaSignOutAlt, FaTachometerAlt, FaCogs, FaUsers, FaStar, FaHeart, FaPaperPlane } from "react-icons/fa";
import { API_BASE_URL } from '../../config';
import "./AdminDashboard.css";

const AdminDashboard = ({ user }) => {
  console.log("AdminDashboard user:", user); // DEBUG LOG

  const navigate = useNavigate();
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  // Only allow admins, but wait for user to be loaded
  useEffect(() => {
    if (user === undefined) return; // still loading
    if (user === null) return; // still loading
    if (!user || user.role !== "admin") {
      navigate("/login");
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchStats = async () => {
      setStatsLoading(true);
      setStatsError("");
      try {
        const res = await fetch(`${API_BASE_URL}/admin/stats`, {
          headers: {
            'Authorization': localStorage.getItem('token') ? `Bearer ${localStorage.getItem('token')}` : undefined
          }
        });
        const data = await res.json();
        if (res.ok) setStats(data);
        else setStatsError(data.error || "Failed to load stats");
      } catch {
        setStatsError("Failed to load stats");
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (user === undefined || user === null) {
    // Show nothing or a spinner while loading
    return <div className="admin-loading">Loading...</div>;
  }

  // Show welcome card only on /admin-dashboard root
  const isDashboardHome = location.pathname === "/admin-dashboard";

  return (
    <div className="admin-dashboard">
      {/* Topbar */}
      <header className="admin-topbar">
        <div className="admin-title"><FaTachometerAlt /> Admin Dashboard</div>
        <div className="admin-user">
          <FaUser /> {user?.username}
        </div>
      </header>

      {/* Sidebar */}
      <aside className="admin-sidebar advanced">
        <nav className="sidebar-nav">
          <div className="sidebar-section">
            <ul>
              <li>
                <Link to="/admin-dashboard">
                  <FaTachometerAlt /> Dashboard Home
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/users">
                  <FaUsers /> Users
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/collections">
                  <FaBox /> Collections
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/outline">
                  <FaBox /> Outline
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/orders">
                  <FaClipboardList /> Orders
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/reviews">
                  <FaStar /> Reviews
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/settings">
                  <FaCogs /> Settings
                </Link>
              </li>
              <li>
                <Link to="/admin-dashboard/custom-design-requests">
                  <FaPaperPlane /> Custom Requests
                </Link>
              </li>
            </ul>
          </div>
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-logout">
          <button className="logout-btn" onClick={() => {
            localStorage.clear();
            navigate("/login");
          }}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main advanced">
        {isDashboardHome && (
          <div className="admin-welcome-card advanced">
            <h2>Welcome, {user?.username}!</h2>
            <p className="admin-role">Role: {user?.role}</p>
            <h3>Quick Actions</h3>
            <div className="quick-actions">
              <Link to="/admin-dashboard/users" className="quick-action">
                <FaUsers /> Users
              </Link>
              <Link to="/admin-dashboard/collections" className="quick-action">
                <FaBox /> Collections
              </Link>
              <Link to="/admin-dashboard/outline" className="quick-action">
                <FaBox /> Outline
              </Link>
              <Link to="/admin-dashboard/orders" className="quick-action">
                <FaClipboardList /> Orders
              </Link>
              <Link to="/admin-dashboard/settings" className="quick-action">
                <FaCogs /> Settings
              </Link>
            </div>
            <div className="dashboard-stats dashboard-stats-advanced">
              <div className="dashboard-stat users">
                <FaUsers /> <span>Users</span>
                <span className="stat-value">{statsLoading ? '...' : stats?.users ?? '-'}</span>
              </div>
              <div className="dashboard-stat products">
                <FaBox /> <span>Products</span>
                <span className="stat-value">{statsLoading ? '...' : stats?.products ?? '-'}</span>
              </div>
              <div className="dashboard-stat orders">
                <FaClipboardList /> <span>Orders</span>
                <span className="stat-value">{statsLoading ? '...' : stats?.orders ?? '-'}</span>
              </div>
              <div className="dashboard-stat likes">
                <FaHeart /> <span>Likes</span>
                <span className="stat-value">{statsLoading ? '...' : stats?.likes ?? '-'}</span>
              </div>
              <div className="dashboard-stat reviews">
                <FaStar /> <span>Reviews</span>
                <span className="stat-value">{statsLoading ? '...' : stats?.reviews ?? '-'}</span>
              </div>
            </div>
            <div className="dashboard-overview">
              <h4>Overview</h4>
              {statsLoading ? <div>Loading...</div> : statsError ? <div style={{color:'#e53935'}}>{statsError}</div> : (
                <ul>
                  <li>Active Users: <span className="overview-value">{stats?.activeUsers ?? '-'}</span></li>
                  <li>Admins: <span className="overview-value">{stats?.admins ?? '-'}</span></li>
                  <li>Pending Orders: <span className="overview-value">{stats?.pendingOrders ?? '-'}</span></li>
                  <li>Out of Stock Products: <span className="overview-value">{stats?.outOfStock ?? '-'}</span></li>
                  <li>Recent Reviews: <span className="overview-value">{stats?.recentReviews ?? '-'}</span></li>
                </ul>
              )}
            </div>
            <p className="admin-desc">Use the sidebar to manage users, products, orders, and settings. More features coming soon!</p>
          </div>
        )}
        {/* Nested route content will render here */}
        <Outlet />
      </main>
    </div>
  );
};

export default AdminDashboard;
