import { useState, useEffect } from 'react';
import './index.css';
import { useToast } from './ToastContext';
import { Search, Activity, LayoutGrid, Users, Settings, Sun, Moon, LogOut, ChevronDown, CheckCircle2, Clock, Car, Zap, ChevronRight, BarChart3, AlertCircle, Plus } from 'lucide-react';

type SlotStatus = 'Available' | 'Reserved' | 'Occupied';
type Role = 'Admin' | 'Driver';

interface Slot {
  id: string;
  status: SlotStatus;
  lane: string;
}

interface Reservation {
  id: string;
  slotId: string;
  vehicle: { licensePlate: string; type: string };
  price: number;
  durationHours: number;
  status: string;
  startTime: string;
  username: string;
}

const API_BASE = 'http://localhost:3001';

const VEHICLE_RATES: Record<string, number> = {
  Car: 15,
  Bike: 8,
  'Electric Vehicle': 12,
};

function App() {
  const { showToast } = useToast();
  const [isAuthenticated, setIsAuth] = useState(false);
  const [role, setRole] = useState<Role>('Driver');
  const [username, setUsername] = useState<string>('');
  const [showPass, setShowPass] = useState(false);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [showLanding, setShowLanding] = useState(true);

  const [isDark, setIsDark] = useState(
    () => document.documentElement.getAttribute('data-theme') === 'dark'
  );

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('nexuspark-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('nexuspark-theme', 'light');
    }
  };

  const [timeNow, setTimeNow] = useState(Date.now());
  const [modalDuration, setModalDuration] = useState(2);
  const [modalVehicleType, setModalVehicleType] = useState('Car');
  const [priceFlashKey, setPriceFlashKey] = useState(0);
  const [activeTab, setActiveTab] = useState<'parking' | 'history' | 'settings' | 'map' | 'drivers'>('parking');
  const [lotFilter, setLotFilter] = useState<'All' | 'Available'>('All');
  const [lotSearch, setLotSearch] = useState('');
  const [adminSearch, setAdminSearch] = useState('');
  const [adminSort, setAdminSort] = useState<{ col: string; dir: 'asc' | 'desc' }>({ col: 'slot', dir: 'asc' });

  const [showAddSlotModal, setShowAddSlotModal] = useState(false);
  const [newSlotId, setNewSlotId] = useState('');
  const [newSlotLane, setNewSlotLane] = useState('Lane 1');

  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [slotsRes, resRes] = await Promise.all([
        fetch(`${API_BASE}/api/slots`),
        fetch(`${API_BASE}/api/reservations`)
      ]);
      if (slotsRes.ok) setSlots(await slotsRes.json());
      if (resRes.ok) setReservations(await resRes.json());
    } catch (err) {
      console.error('Failed to fetch from backend', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchData();
    const interval = setInterval(fetchData, 5000);
    const ticker = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => {
      clearInterval(interval);
      clearInterval(ticker);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    if (selectedSlot) {
      setModalDuration(2);
      setModalVehicleType('Car');
      setPriceFlashKey(0);
    }
  }, [selectedSlot?.id]);

  if (!isAuthenticated && showLanding) {
    return (
      <div className="land-page">
        <nav className="land-nav">
          <div className="land-brand">
            <div className="brand-icon" style={{ borderRadius: '12px' }}>
              <span style={{ color: 'white', fontWeight: 800, fontSize: '1.2rem' }}>P</span>
            </div>
            <span className="land-brand-name">NexusPark</span>
          </div>
          <button onClick={() => setShowLanding(false)} className="land-nav-btn">
            Sign In
          </button>
        </nav>

        <main className="land-hero">
          <div className="land-hero-badge">
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', animation: 'pulseDot 2s infinite' }}></span>
            Next-Gen Management
          </div>
          <h1 className="land-hero-title">
            The Future of <span className="text-blue">Smart Parking</span> is Here.
          </h1>
          <p className="land-hero-sub">
            NexusPark provides real-time availability tracking, advanced reservation systems,
            and automated analytics to optimize urban parking infrastructure.
          </p>
          <div className="land-hero-actions">
            <button onClick={() => setShowLanding(false)} className="land-btn-primary">
              Launch Dashboard <ChevronRight size={18} />
            </button>
            <button className="land-btn-secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              View Features
            </button>
          </div>
        </main>

        <section className="land-features" id="features">
          <div className="feat-card">
            <div className="feat-icon" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
              <Activity size={24} />
            </div>
            <h3 className="feat-title">Real-time Tracking</h3>
            <p className="feat-sub">Live visibility into every slot with instant status updates and smart sensors.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
              <Zap size={24} />
            </div>
            <h3 className="feat-title">Instant Booking</h3>
            <p className="feat-sub">Drivers can find and reserve spots in seconds, reducing congestion and idle time.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
              <BarChart3 size={24} />
            </div>
            <h3 className="feat-title">Admin Insights</h3>
            <p className="feat-sub">Comprehensive dashboard for occupancy trends, revenue tracking, and operational control.</p>
          </div>
        </section>

        <section className="land-stats">
          <div className="land-stat">
            <div className="land-stat-num">500+</div>
            <div className="land-stat-lbl">Active Slots</div>
          </div>
          <div className="land-stat">
            <div className="land-stat-num">98%</div>
            <div className="land-stat-lbl">Efficiency Gain</div>
          </div>
          <div className="land-stat">
            <div className="land-stat-num">24/7</div>
            <div className="land-stat-lbl">Automated Ops</div>
          </div>
        </section>

        <footer className="land-footer">
          <p>© 2026 NexusPark Systems. All rights reserved.</p>
          <div style={{ display: 'flex', gap: '16px' }}>
            <span>Privacy</span>
            <span>Terms</span>
          </div>
        </footer>
      </div>
    );
  }

  if (!isAuthenticated) {
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setLoginError('');
      setLoginLoading(true);
      const target = e.target as typeof e.target & {
        username: { value: string };
        password: { value: string };
      };

      try {
        const res = await fetch(`${API_BASE}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: target.username.value, password: target.password.value })
        });

        if (res.ok) {
          const data = await res.json();
          setRole(data.role as Role);
          setUsername(data.username);
          setIsAuth(true);
        } else {
          setLoginError('Invalid credentials. Please try again.');
        }
      } catch {
        setLoginError('Server unreachable. Please try again later.');
      } finally {
        setLoginLoading(false);
      }
    };

    return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-left-blob1" />
          <div className="login-left-blob2" />
          <div className="login-left-brand">
            <div className="brand-icon" style={{ background: 'white', color: 'var(--primary)' }}>
              <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>P</span>
            </div>
            <span className="login-left-brand-name">NexusPark</span>
          </div>
          <div className="login-left-content">
            <h1 className="login-left-title">Premium infrastructure for modern cities.</h1>
            <p className="login-left-sub">Manage facilities seamlessly with enterprise-grade tools designed for operational excellence.</p>
            <div className="login-left-trust">
              <div className="trust-item"><div className="trust-dot"></div> 99.9% Uptime SLA</div>
              <div className="trust-item"><div className="trust-dot"></div> Bank-grade security</div>
              <div className="trust-item"><div className="trust-dot"></div> 24/7 Priority support</div>
            </div>
          </div>
        </div>
        <div className="login-right">
          <div className="login-form-wrap">
            <button className="login-back" onClick={() => setShowLanding(true)}>
              ← Back to site
            </button>
            <h2 className="login-title">Welcome back</h2>
            <p className="login-sub">Please enter your details to sign in.</p>

            {loginError && (
              <div className="login-error">
                <AlertCircle size={16} /> {loginError}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  type="text"
                  className="form-input"
                  placeholder="Enter your username"
                  required
                  onChange={() => setLoginError('')}
                  autoComplete="username"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <div className="form-input-wrap">
                  <input
                    name="password"
                    type={showPass ? 'text' : 'password'}
                    className="form-input"
                    placeholder="••••••••"
                    required
                    onChange={() => setLoginError('')}
                    autoComplete="current-password"
                  />
                  <div className="form-input-icon">
                    <button type="button" onClick={() => setShowPass(!showPass)} className="input-show-pass">
                      {showPass ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </div>
              </div>

              <div className="remember-row">
                <input type="checkbox" id="remember" />
                <label htmlFor="remember">Remember for 30 days</label>
              </div>

              <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '20px' }} disabled={loginLoading}>
                {loginLoading ? <span className="btn-spinner" /> : 'Sign in'}
              </button>
            </form>

            <div className="login-demo">
              <div className="login-demo-title">Demo Credentials</div>
              <div className="login-demo-row">
                <span className="demo-badge demo-badge-admin">Admin</span>
                <span className="demo-code">admin</span> / <span className="demo-code">admin123</span>
              </div>
              <div className="login-demo-row">
                <span className="demo-badge demo-badge-driver">Driver</span>
                <span>Any new username auto-registers</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: slots.length,
    available: slots.filter(s => s.status === 'Available').length,
    reserved: slots.filter(s => s.status === 'Reserved').length,
    occupied: slots.filter(s => s.status === 'Occupied').length,
  };

  const totalRevenue = reservations
    .filter(r => r.status === 'Completed')
    .reduce((sum, r) => sum + r.price, 0);

  const activeReservations = reservations.filter(r => r.status === 'Active' || r.status === 'Scheduled');

  const myHistory = reservations
    .filter(r => r.username === username)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  const myTotalSpent = myHistory.reduce((s, r) => s + r.price, 0);

  const filteredAdminRes = activeReservations
    .filter(r => {
      const q = adminSearch.toLowerCase();
      return !q || r.slotId.toLowerCase().includes(q) || r.vehicle.licensePlate.toLowerCase().includes(q);
    })
    .sort((a, b) => {
      const dir = adminSort.dir === 'asc' ? 1 : -1;
      if (adminSort.col === 'slot') return a.slotId.localeCompare(b.slotId) * dir;
      if (adminSort.col === 'vehicle') return a.vehicle.licensePlate.localeCompare(b.vehicle.licensePlate) * dir;
      if (adminSort.col === 'cost') return (a.price - b.price) * dir;
      return 0;
    });

  const toggleSort = (col: string) =>
    setAdminSort(prev => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' }));

  const myBooking = activeReservations.find(r => r.username === username);
  let timeTitle = "";
  let timeString = null;

  if (myBooking) {
    const waitMs = new Date(myBooking.startTime).getTime() - timeNow;
    if (waitMs > 0) {
      const hrs = Math.floor(waitMs / 3600000);
      const mins = Math.floor((waitMs % 3600000) / 60000);
      const secs = Math.floor((waitMs % 60000) / 1000);
      timeTitle = "Arriving In";
      timeString = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
    } else {
      const elapsedMs = timeNow - new Date(myBooking.startTime).getTime();
      const hrs = Math.floor(elapsedMs / 3600000);
      const mins = Math.floor((elapsedMs % 3600000) / 60000);
      const secs = Math.floor((elapsedMs % 60000) / 1000);
      timeTitle = "Elapsed Time";
      timeString = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
    }
  }

  const handleReserve = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const reservedSlotId = selectedSlot.id;
    const target = e.target as typeof e.target & {
      licensePlate: { value: string };
      vehicleType: { value: string };
      duration: { value: string };
      startTime: { value: string };
    };

    let startObj = new Date();
    if (target.startTime.value) {
      startObj = new Date(target.startTime.value);
    }

    try {
      const response = await fetch(`${API_BASE}/api/reserve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotId: reservedSlotId,
          licensePlate: target.licensePlate.value,
          vehicleType: target.vehicleType.value,
          durationHours: parseInt(target.duration.value, 10),
          startTime: startObj.toISOString(),
          username: username
        }),
      });

      if (response.ok) {
        await fetchData();
        setSelectedSlot(null);
        showToast(`Slot ${reservedSlotId} reserved successfully!`, 'success');
      } else {
        const errorData = await response.json();
        showToast(`Reservation failed: ${errorData.error}`, 'error');
      }
    } catch (err) {
      console.error('Error reserving slot', err);
    }
  };

  const handleRelease = async (slotId: string) => {
    const reservation = activeReservations.find(r => r.slotId === slotId);
    const isScheduled = reservation?.status === 'Scheduled';

    try {
      const response = await fetch(`${API_BASE}/api/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      if (response.ok) {
        await fetchData();
        if (isScheduled) {
          showToast('Reservation cancelled.', 'warning');
        } else {
          showToast('Vehicle exited. Session complete.', 'success');
        }
      }
    } catch (err) {
      console.error('Error releasing slot', err);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSlotId.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/api/slots`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId: newSlotId.trim(), lane: newSlotLane.trim() || 'Lane 1' }),
      });

      if (response.ok) {
        await fetchData();
        setShowAddSlotModal(false);
        setNewSlotId('');
        showToast(`Slot ${newSlotId} created successfully!`, 'success');
      } else {
        const errorData = await response.json();
        showToast(`Failed to add slot: ${errorData.error}`, 'error');
      }
    } catch (err) {
      console.error('Error adding slot', err);
    }
  };

  const NavContent = () => (
    <>
      <div className="nav-section-label">Main</div>
      <button className={`nav-item ${activeTab === 'parking' ? 'active' : ''}`} onClick={() => { setActiveTab('parking'); setMobileMenuOpen(false); }}>
        <LayoutGrid className="nav-icon" /> Dashboard
      </button>
      {role === 'Admin' && (
        <>

          <button className={`nav-item ${activeTab === 'drivers' ? 'active' : ''}`} onClick={() => { setActiveTab('drivers'); setMobileMenuOpen(false); }}>
            <Users className="nav-icon" /> Drivers
          </button>
        </>
      )}
      {role === 'Driver' && (
        <button className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} onClick={() => { setActiveTab('history'); setMobileMenuOpen(false); }}>
          <Clock className="nav-icon" /> My History
        </button>
      )}

      <div className="nav-section-label" style={{ marginTop: '20px' }}>Settings</div>
      <button className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setMobileMenuOpen(false); }}>
        <Settings className="nav-icon" /> Preferences
      </button>
    </>
  );

  return (
    <div className="app-shell">
      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${mobileMenuOpen ? 'visible' : ''}`} onClick={() => setMobileMenuOpen(false)}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-icon">
            <span style={{ color: 'white', fontWeight: 800, fontSize: '1rem' }}>P</span>
          </div>
          <span className="brand-name">NexusPark</span>
        </div>

        <nav className="sidebar-nav">
          <NavContent />
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{username.charAt(0).toUpperCase()}</div>
            <div className="user-info">
              <div className="user-name">{username}</div>
              <div className="user-role">{role}</div>
            </div>
            <ChevronDown size={14} color="var(--text-3)" />
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="app-header">
          <button className="icon-btn mobile-menu-btn" onClick={() => setMobileMenuOpen(true)}>
            <LayoutGrid size={18} />
          </button>

          <div className="header-search">
            <Search size={16} className="header-search-icon" />
            <input type="text" placeholder="Search slots, drivers..." />
          </div>

          <div className="header-actions">
            <span className="role-badge">{role}</span>
            <button className="icon-btn" onClick={toggleTheme} title="Toggle Theme">
              <span className="theme-icon" key={String(isDark)}>
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </span>
            </button>
            <button className="icon-btn" onClick={() => setIsAuth(false)} title="Log out">
              <LogOut size={18} />
            </button>
          </div>
        </header>

        <div className="page-content">
          <div className="page-header">
            <h1 className="page-title">Overview</h1>
            <p className="page-sub">Manage your parking infrastructure and operations.</p>
          </div>

          {role === 'Driver' && activeTab === 'parking' && (
            <div className="welcome-card card">
              <div>
                <h2 className="welcome-title">Welcome back, {username}</h2>
                <p className="welcome-sub">Find and reserve a premium spot in seconds.</p>
              </div>
              {myBooking && (
                <div className="timer-card">
                  <div className="timer-label">{timeTitle}</div>
                  <div className="timer-value">{timeString}</div>
                  <div className="timer-sub">Slot: {myBooking.slotId}</div>
                </div>
              )}
            </div>
          )}

          {role === 'Admin' && (
            <div className="stats-grid">
              <div className="stat-card card card-hover">
                <div className="stat-top">
                  <span className="stat-label">Total Slots</span>
                  <div className="stat-icon-wrap" style={{ background: 'var(--bg)', color: 'var(--text-2)' }}>
                    <LayoutGrid size={16} />
                  </div>
                </div>
                {loading ? <div className="skeleton skeleton-value" /> : <div className="stat-value">{stats.total}</div>}
              </div>
              <div className="stat-card card card-hover">
                <div className="stat-top">
                  <span className="stat-label">Available</span>
                  <div className="stat-icon-wrap" style={{ background: 'var(--success-light)', color: 'var(--success)' }}>
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                {loading ? <div className="skeleton skeleton-value" /> : <div className="stat-value">{stats.available}</div>}
              </div>
              <div className="stat-card card card-hover">
                <div className="stat-top">
                  <span className="stat-label">Reserved</span>
                  <div className="stat-icon-wrap" style={{ background: 'var(--warning-light)', color: 'var(--warning)' }}>
                    <Clock size={16} />
                  </div>
                </div>
                {loading ? <div className="skeleton skeleton-value" /> : <div className="stat-value">{stats.reserved}</div>}
              </div>
              <div className="stat-card card card-hover">
                <div className="stat-top">
                  <span className="stat-label">Today's Revenue</span>
                  <div className="stat-icon-wrap" style={{ background: 'var(--blue-light)', color: 'var(--blue)' }}>
                    <Activity size={16} />
                  </div>
                </div>
                <div className="stat-value">${totalRevenue.toFixed(2)}</div>
                <div className="stat-trend trend-up">↑ 12% vs yesterday</div>
              </div>
            </div>
          )}

          {/* Tab Content */}
          {(activeTab === 'parking' || activeTab === 'map') && (
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Facility Map</h3>
                <div className="lot-filters">
                  <div className="lot-search-wrap">
                    <input 
                      type="text" 
                      className="lot-search" 
                      placeholder="Search slot ID..." 
                      value={lotSearch}
                      onChange={e => setLotSearch(e.target.value)}
                    />
                  </div>
                  <button 
                    className={`lot-filter-btn ${lotFilter === 'All' ? 'active' : ''}`}
                    onClick={() => setLotFilter('All')}
                  >All</button>
                  <button 
                    className={`lot-filter-btn ${lotFilter === 'Available' ? 'active' : ''}`}
                    onClick={() => setLotFilter('Available')}
                  >Available</button>
                  {role === 'Admin' && (
                    <button 
                      className="btn btn-primary btn-sm" 
                      onClick={() => setShowAddSlotModal(true)}
                      style={{ marginLeft: '8px', padding: '5px 12px', fontSize: '0.775rem' }}
                    >
                      <Plus size={14} style={{ marginRight: '4px' }} /> Add Slot
                    </button>
                  )}
                </div>
              </div>

              {loading ? (
                <div className="slot-skeleton-grid">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div key={i} className="slot-skeleton skeleton" />
                  ))}
                </div>
              ) : (
                <div className="lot-container">
                  {(() => {
                    const filterFn = (s: Slot) => {
                      if (lotFilter === 'Available' && s.status !== 'Available') return false;
                      if (lotSearch && !s.id.toLowerCase().includes(lotSearch.toLowerCase())) return false;
                      return true;
                    };
                    
                    const handleSlotClick = (slot: Slot) => {
                      if (role === 'Driver') {
                        if (slot.status === 'Available') setSelectedSlot(slot);
                        else showToast('Slot no longer available.', 'warning');
                      } else {
                        if (slot.status === 'Available') setSelectedSlot(slot);
                      }
                    };

                    const groupedSlots = slots.reduce((acc, slot) => {
                      const lane = slot.lane || 'Lane 1';
                      if (!acc[lane]) acc[lane] = [];
                      acc[lane].push(slot);
                      return acc;
                    }, {} as Record<string, Slot[]>);

                    const laneEntries = Object.entries(groupedSlots);
                    if (laneEntries.length === 0) return <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-2)' }}>No slots found.</div>;

                    return (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {laneEntries.map(([laneName, laneSlots], index) => {
                          const slotsInLane = laneSlots.filter(filterFn);

                          const isFiltering = lotFilter !== 'All' || lotSearch !== '';
                          if (isFiltering && slotsInLane.length === 0) {
                            return null;
                          }

                          return (
                            <div key={laneName}>
                              <div className="lane-group" style={{ display: 'flex', alignItems: 'center', gap: '16px', background: 'var(--bg-2)', padding: '16px 24px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
                                <div style={{ minWidth: '80px' }}>
                                  <h4 style={{ fontSize: '0.9rem', color: 'var(--text-2)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 600, margin: 0 }}>{laneName}</h4>
                                </div>
                                <div className="slot-row" style={{ display: 'flex', gap: '16px', overflowX: 'auto', flex: 1, padding: '4px 0', minWidth: 0 }}>
                                  {slotsInLane.map((slot, idx) => (
                                    <div key={slot.id} className={`slot ${slot.status}`} style={{ '--slot-delay': `${idx * 40}ms` } as React.CSSProperties} onClick={() => handleSlotClick(slot)}>
                                      {slot.status === 'Occupied' && <Car className="car-icon" />}
                                      <span>{slot.id}</span>
                                      <small>{slot.status}</small>
                                    </div>
                                  ))}
                                </div>
                              </div>
                              
                              {index < laneEntries.length - 1 && (
                                <div className="parking-lane" style={{ margin: '16px 0 0 0' }}>
                                  <div className="lane-arrow"><ChevronRight color="#f59e0b" /></div>
                                  <div className="lane-line" />
                                  <div className="lane-arrow"><ChevronRight color="#f59e0b" /></div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && role === 'Driver' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '20px' }}>Reservation History</h3>

              {loading ? (
                <div className="skeleton-block" style={{ height: '200px' }} />
              ) : myHistory.length === 0 ? (
                <div className="history-empty">
                  <Clock size={48} color="var(--border-strong)" />
                  <p>You haven't made any reservations yet. Head to the dashboard to book a slot.</p>
                </div>
              ) : (
                <>
                  <div className="table-wrap">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Slot</th>
                          <th>Date & Time</th>
                          <th>Duration</th>
                          <th>Vehicle</th>
                          <th>Cost</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {myHistory.map(res => (
                          <tr key={res.id}>
                            <td style={{ fontWeight: 600 }}>{res.slotId}</td>
                            <td>
                              {new Date(res.startTime).toLocaleDateString()}
                              <small>{new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                            </td>
                            <td>{res.durationHours}h</td>
                            <td>
                              {res.vehicle.licensePlate}
                              <small>{res.vehicle.type}</small>
                            </td>
                            <td style={{ fontWeight: 600 }}>${res.price.toFixed(2)}</td>
                            <td>
                              <span className={`badge badge-${res.status.toLowerCase()}`}>
                                {res.status === 'Active' && <span className="badge-dot" />}
                                {res.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="history-summary">
                    {myHistory.length} reservation{myHistory.length !== 1 ? 's' : ''} • Total spent: <strong>${myTotalSpent.toFixed(2)}</strong>
                  </div>
                </>
              )}
            </div>
          )}

          {(activeTab === 'parking' || activeTab === 'drivers') && role === 'Admin' && (
            <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Active Operations</h3>
                <div className="header-search" style={{ maxWidth: '240px', margin: 0 }}>
                  <Search size={16} className="header-search-icon" />
                  <input
                    type="text"
                    placeholder="Search active..."
                    value={adminSearch}
                    onChange={e => setAdminSearch(e.target.value)}
                  />
                </div>
              </div>

              {filteredAdminRes.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle2 size={40} color="var(--success)" />
                  <div className="empty-state-title">All Clear</div>
                  <div className="empty-state-sub">No active vehicles or reservations at the moment.</div>
                </div>
              ) : (
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th className="sortable" onClick={() => toggleSort('slot')}>Slot</th>
                        <th className="sortable" onClick={() => toggleSort('vehicle')}>Vehicle</th>
                        <th className="sortable" onClick={() => toggleSort('cost')}>Time & Rate</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAdminRes.map(res => (
                        <tr key={res.id}>
                          <td style={{ fontWeight: 600 }}>{res.slotId}</td>
                          <td>
                            {res.vehicle.licensePlate}
                            <small>{res.vehicle.type}</small>
                          </td>
                          <td>
                            <span style={{ fontWeight: 600, color: 'var(--success)' }}>${res.price.toFixed(2)}</span>
                            <small>{new Date(res.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                          </td>
                          <td>
                            <span className={`badge badge-${res.status.toLowerCase()}`}>
                              {res.status === 'Active' && <span className="badge-dot" />}
                              {res.status}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className={`btn btn-sm ${res.status === 'Scheduled' ? 'btn-warning' : 'btn-danger'}`}
                              onClick={() => handleRelease(res.slotId)}
                            >
                              {res.status === 'Scheduled' ? 'Cancel' : 'Exit'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'settings' && (
            <div className="card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '24px' }}>Preferences</h3>
              
              <div style={{ maxWidth: '400px' }}>
                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Settings size={16} /> Theme Settings
                  </label>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-2)', marginBottom: '12px' }}>
                    Toggle between light and dark mode for your dashboard interface.
                  </p>
                  <button className="btn btn-secondary" onClick={toggleTheme} style={{ width: 'fit-content' }}>
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                    {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                  </button>
                </div>
                
                <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '24px 0' }} />
                
                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Users size={16} /> Account Profile
                  </label>
                  <div style={{ padding: '16px', background: 'var(--bg)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', marginTop: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="user-avatar" style={{ width: '48px', height: '48px', fontSize: '1.2rem' }}>
                        {username.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '1rem' }}>{username}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-2)', textTransform: 'capitalize' }}>{role} Account</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Bottom Nav for Mobile */}
      <div className="bottom-nav">
        <div className="bottom-nav-items">
          <button className={`bottom-nav-btn ${activeTab === 'parking' ? 'active' : ''}`} onClick={() => setActiveTab('parking')}>
            <LayoutGrid size={20} />
            <span>Map</span>
          </button>
          {role === 'Driver' && (
            <button className={`bottom-nav-btn ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>
              <Clock size={20} />
              <span>History</span>
            </button>
          )}
          <button className="bottom-nav-btn" onClick={toggleTheme}>
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
            <span>Theme</span>
          </button>
        </div>
      </div>

      {/* Reservation Modal */}
      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Reserve Slot {selectedSlot.id}</h3>
                <p className="modal-sub">Complete details to secure this space.</p>
              </div>
              <button className="modal-close" onClick={() => setSelectedSlot(null)}>✕</button>
            </div>

            <form onSubmit={handleReserve}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">License Plate</label>
                  <input name="licensePlate" type="text" className="form-input" placeholder="e.g. XYZ-123" required />
                </div>

                <div className="form-group">
                  <label className="form-label">Vehicle Type</label>
                  <div className="form-input-wrap">
                    <select
                      name="vehicleType"
                      className="form-select"
                      value={modalVehicleType}
                      onChange={e => {
                        setModalVehicleType(e.target.value);
                        setPriceFlashKey(k => k + 1);
                      }}
                    >
                      <option value="Car">Car ($15/hr)</option>
                      <option value="Bike">Bike ($8/hr)</option>
                      <option value="Electric Vehicle">Electric Vehicle ($12/hr)</option>
                    </select>
                    <ChevronDown size={14} className="form-input-icon" />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Start Time (Optional)</label>
                  <input name="startTime" type="datetime-local" className="form-input" />
                </div>

                <div className="form-group" style={{ marginBottom: '24px' }}>
                  <label className="form-label">Duration (Hours)</label>
                  <input
                    name="duration"
                    type="number"
                    className="form-input"
                    min="1" max="24"
                    value={modalDuration || ''}
                    onChange={e => {
                      const v = Math.min(24, Math.max(0, parseInt(e.target.value) || 0));
                      setModalDuration(v);
                      setPriceFlashKey(k => k + 1);
                    }}
                    required
                  />
                </div>

                <div className="price-card">
                  <div className="price-row">
                    <span className="price-lbl">Estimated Total</span>
                    <span className="price-val" key={priceFlashKey}>
                      {modalDuration > 0 ? `$${(modalDuration * (VEHICLE_RATES[modalVehicleType] ?? 15)).toFixed(2)}` : '—'}
                    </span>
                  </div>
                  {modalDuration > 0 && (
                    <div className="price-sub">
                      {modalDuration} hr × ${(VEHICLE_RATES[modalVehicleType] ?? 15).toFixed(2)} / hr (Dynamic Rate)
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-blue btn-full btn-lg">Confirm Booking</button>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setSelectedSlot(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Slot Modal */}
      {showAddSlotModal && (
        <div className="modal-overlay" onClick={() => setShowAddSlotModal(false)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-title">Add New Slot</h3>
                <p className="modal-sub">Create a new parking space in the facility.</p>
              </div>
              <button className="modal-close" onClick={() => setShowAddSlotModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddSlot}>
              <div className="modal-body">
                <div className="form-group" style={{ marginBottom: '16px' }}>
                  <label className="form-label">Slot ID</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. A-110" 
                    value={newSlotId}
                    onChange={e => setNewSlotId(e.target.value)}
                    required 
                    autoFocus
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Lane Name</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="e.g. Lane 1, Zone B..." 
                    value={newSlotLane}
                    onChange={e => setNewSlotLane(e.target.value)}
                    required 
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button type="submit" className="btn btn-primary btn-full btn-lg">Create Slot</button>
                <button type="button" className="btn btn-ghost btn-full" onClick={() => setShowAddSlotModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
