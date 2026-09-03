import { BrowserRouter, Routes, Route, Link, NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import UploadPage from './pages/UploadPage';
import ResultsPage from './pages/ResultsPage';
import ATSCheckPage from './pages/ATSCheckPage';
import HistoryPage from './pages/HistoryPage';
import { Moon, Sun, Sparkles, Menu, X, Home, FileSearch, History } from 'lucide-react';

function App() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'dark';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  const toggleDark = () => setIsDark((prev) => !prev);
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  const bgColor = isDark ? '#0f172a' : '#f8fafc';
  const navBg = isDark ? '#1e293b' : '#ffffff';
  const textColor = isDark ? '#f1f5f9' : '#0f172a';
  const borderColor = isDark ? '#334155' : '#e2e8f0';
  const linkColor = isDark ? '#cbd5e1' : '#475569';
  const linkActiveColor = isDark ? '#818cf8' : '#4f46e5';
  const linkActiveBg = isDark ? 'rgba(79, 70, 229, 0.2)' : '#eef2ff';

  const navItems = [
    { path: '/', icon: Home, label: 'Analyze' },
    { path: '/ats', icon: FileSearch, label: 'ATS Check' },
    { path: '/history', icon: History, label: 'History' },
  ];

  return (
    <BrowserRouter>
      <div style={{ minHeight: '100vh', backgroundColor: bgColor, transition: 'all 0.3s' }}>
        {/* Top bar - ONLY logo + (nav links on desktop) + dark toggle + hamburger.
            No inline `display` styles here, so the Tailwind responsive
            classes (hidden / sm:flex) are free to actually work. */}
        <nav
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: navBg,
            borderBottom: `1px solid ${borderColor}`,
            transition: 'all 0.3s',
          }}
        >
          <div
            style={{
              maxWidth: '1280px',
              margin: '0 auto',
              padding: '0 16px',
              height: '64px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', minWidth: 0 }}>
              <div style={{ width: '32px', height: '32px', flexShrink: 0, background: 'linear-gradient(to bottom right, #4f46e5, #9333ea)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sparkles style={{ width: '16px', height: '16px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '20px', fontWeight: 'bold', color: textColor, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                ResumeAI
              </span>
            </Link>

            {/* Desktop nav links - Tailwind alone controls visibility, no inline style fighting it */}
            <div className="hidden sm:flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 500,
                    textDecoration: 'none',
                    color: isActive ? linkActiveColor : linkColor,
                    backgroundColor: isActive ? linkActiveBg : 'transparent',
                    transition: 'all 0.3s',
                  })}
                >
                  {item.label}
                </NavLink>
              ))}
              <button
                onClick={toggleDark}
                style={{
                  marginLeft: '8px',
                  padding: '8px',
                  borderRadius: '12px',
                  background: isDark ? '#334155' : '#f1f5f9',
                  color: isDark ? '#fbbf24' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDark ? <Sun style={{ width: '16px', height: '16px' }} /> : <Moon style={{ width: '16px', height: '16px' }} />}
              </button>
            </div>

            {/* Mobile: dark toggle + hamburger only. Nav links live in the drawer, not here. */}
            <div className="flex sm:hidden items-center gap-2 flex-shrink-0">
              <button
                onClick={toggleDark}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: isDark ? '#334155' : '#f1f5f9',
                  color: isDark ? '#fbbf24' : '#475569',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isDark ? <Sun style={{ width: '18px', height: '18px' }} /> : <Moon style={{ width: '18px', height: '18px' }} />}
              </button>
              <button
                onClick={toggleMobileMenu}
                aria-label="Open menu"
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  background: 'transparent',
                  color: textColor,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Menu style={{ width: '22px', height: '22px' }} />
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile drawer overlay - kept mounted and faded via opacity/pointer-events
            instead of conditionally rendered, so it actually transitions in/out
            in sync with the drawer instead of popping instantly. */}
        <div
          onClick={closeMobileMenu}
          className={`sm:hidden fixed inset-0 z-40 transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        />

        {/* Right-side mobile drawer - the ONLY place nav links live on small screens */}
        <div
          className={`sm:hidden fixed top-0 right-0 h-full w-72 max-w-[85vw] z-50 transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{
            backgroundColor: isDark ? '#1e293b' : '#ffffff',
            borderLeft: `1px solid ${borderColor}`,
            boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.15)',
            overflowY: 'auto',
          }}
        >
          <div style={{ padding: '20px', height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <span style={{ fontSize: '18px', fontWeight: 'bold', color: textColor }}>Menu</span>
              <button
                onClick={closeMobileMenu}
                aria-label="Close menu"
                style={{ padding: '8px', borderRadius: '8px', background: 'transparent', color: textColor, border: 'none', cursor: 'pointer' }}
              >
                <X style={{ width: '22px', height: '22px' }} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
              {navItems.map((item, i) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobileMenu}
                  className="transition-all duration-300 ease-out"
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    textDecoration: 'none',
                    color: isActive ? linkActiveColor : linkColor,
                    backgroundColor: isActive ? linkActiveBg : 'transparent',
                    fontSize: '16px',
                    fontWeight: isActive ? 600 : 500,
                    opacity: isMobileMenuOpen ? 1 : 0,
                    transform: isMobileMenuOpen ? 'translateX(0)' : 'translateX(16px)',
                    transitionDelay: isMobileMenuOpen ? `${80 + i * 60}ms` : '0ms',
                  })}
                >
                  <item.icon style={{ width: '20px', height: '20px' }} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        </div>

        <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '32px 16px' }}>
          <Routes>
            <Route path="/" element={<UploadPage isDark={isDark} />} />
            <Route path="/results" element={<ResultsPage isDark={isDark} />} />
            <Route path="/ats" element={<ATSCheckPage isDark={isDark} />} />
            <Route path="/history" element={<HistoryPage isDark={isDark} />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;