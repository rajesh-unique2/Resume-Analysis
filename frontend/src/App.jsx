import { BrowserRouter, Routes, Route, NavLink, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/authContext';
import ProtectedRoute from './components/ProductedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ATSCheckPage from './pages/ATSCheckPage';
import HistoryPage from './pages/HistoryPage';
import VoicePracticePage from './pages/VoicePracticePage';
import ResumeBuilderPage from './pages/ResumeBuilderPage';
import AmbientCanvas from './components/AmbientCanvas';
import {
  BarChart3, FileSearch, FileText, History, LogOut, Menu, Mic2, PanelLeftClose,
  PanelLeftOpen, Sparkles, X,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Resume analysis', icon: BarChart3, end: true },
  { path: '/ats', label: 'ATS scanner', icon: FileSearch },
  { path: '/history', label: 'Analysis history', icon: History },
  { path: '/voice-practice', label: 'Communication test', icon: Mic2 },
  { path: '/resume-builder', label: 'Resume builder', icon: FileText },
];

function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  if (!isAuthenticated || ['/login', '/register'].includes(location.pathname)) {
    return (
      <div className="auth-layout">
        <AmbientCanvas />
        <div className="auth-brand"><Sparkles size={18} /> ResumeAI</div>
        <Routes>
          <Route path="/login" element={<LoginPage isDark />} />
          <Route path="/register" element={<RegisterPage isDark />} />
          <Route path="*" element={<LoginPage isDark />} />
        </Routes>
      </div>
    );
  }

  const initials = (user?.name || user?.email || 'U').charAt(0).toUpperCase();
  const closeMobile = () => setMobileOpen(false);
  const signOut = () => { logout(); closeMobile(); navigate('/login'); };

  return (
    <div className={`app-frame ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <AmbientCanvas />
      {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={closeMobile} />}
      <aside className={`sidebar ${mobileOpen ? 'mobile-visible' : ''}`}>
        <div className="sidebar-top">
          <Link to="/" className="brand" onClick={closeMobile}>
            <span className="brand-mark"><Sparkles size={19} /></span>
            <span className="brand-name">Resume<span>AI</span></span>
          </Link>
          <button className="icon-button sidebar-close" onClick={closeMobile} aria-label="Close navigation"><X size={19} /></button>
        </div>

        <div className="workspace-label">Workspace</div>
        <nav className="sidebar-nav" aria-label="Main navigation">
          {navItems.map(({ path, label, icon: Icon, end }) => (
            <NavLink key={path} to={path} end={end} onClick={closeMobile} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-promo">
          <div className="promo-orb"><Sparkles size={16} /></div>
          <strong>Build with clarity</strong>
          <p>Turn your next application into a stronger story.</p>
        </div>

        <div className="account-box">
          <div className="avatar">{initials}</div>
          <div className="account-copy"><strong>{user?.name || 'Your account'}</strong><span>{user?.email}</span></div>
          <button className="icon-button" onClick={signOut} aria-label="Log out"><LogOut size={16} /></button>
        </div>
      </aside>

      <main className="app-main">
        <header className="topbar">
          <button className="icon-button mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><Menu size={21} /></button>
          <div className="crumbs"><span>Workspace</span><span className="crumb-divider">/</span><strong>{navItems.find((item) => item.path === location.pathname)?.label || 'Overview'}</strong></div>
          <button className="icon-button desktop-collapse" onClick={() => setCollapsed((value) => !value)} aria-label="Toggle sidebar">{collapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}</button>
        </header>
        <div className="page-canvas">
          <Routes>
            <Route path="/" element={<ProtectedRoute><UploadPage isDark /></ProtectedRoute>} />
            <Route path="/results" element={<ProtectedRoute><ResultsPage isDark /></ProtectedRoute>} />
            <Route path="/ats" element={<ProtectedRoute><ATSCheckPage isDark /></ProtectedRoute>} />
            <Route path="/history" element={<ProtectedRoute><HistoryPage isDark /></ProtectedRoute>} />
            <Route path="/voice-practice" element={<ProtectedRoute><VoicePracticePage isDark /></ProtectedRoute>} />
            <Route path="/resume-builder" element={<ProtectedRoute><ResumeBuilderPage isDark /></ProtectedRoute>} />
          </Routes>
        </div>
      </main>
    </div>
  );
}

export default function App() {
  return <BrowserRouter><AuthProvider><AppShell /></AuthProvider></BrowserRouter>;
}
