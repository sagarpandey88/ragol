import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, BookOpen } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-indigo-700 text-white px-6 py-3 flex items-center justify-between shadow">
      <Link to="/" className="flex items-center gap-2 font-bold text-lg">
        <BookOpen size={22} />
        Ragol
      </Link>
      {user ? (
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="hover:underline text-sm">Dashboard</Link>
          <span className="text-sm opacity-80">{user.name}</span>
          <button onClick={handleLogout} className="flex items-center gap-1 text-sm hover:underline">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : (
        <Link to="/auth" className="text-sm hover:underline">Sign In</Link>
      )}
    </nav>
  );
}
