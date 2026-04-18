import { useState, useEffect } from 'react';
import './index.css';

type SlotStatus = 'Available' | 'Reserved' | 'Occupied';
type Role = 'Admin' | 'Driver';

interface Slot {
  id: string;
  status: SlotStatus;
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

const API_BASE = 'https://smart-parking-management-system-mwiw.onrender.com';

function App() {
  const [isAuthenticated, setIsAuth] = useState(false);
  const [role, setRole] = useState<Role>('Driver');
  const [username, setUsername] = useState<string>('');
  const [slots, setSlots] = useState<Slot[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Time remaining tracker for drivers
  const [timeNow, setTimeNow] = useState(Date.now());

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

  if (!isAuthenticated) {
    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
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
          // Real JWT Logic: Store token in local storage here
          setRole(data.role as Role);
          setUsername(data.username);
          setIsAuth(true);
        } else {
          alert('Invalid credentials');
        }
      } catch (err) {
        alert('Server unreachable');
      }
    };

    return (
      <div className="app-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="glass-card" style={{ padding: '3rem', width: '100%', maxWidth: '400px', textAlign: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '0.5rem' }}>NexusPark</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Secure Architecture Login</p>
          
          <form onSubmit={handleLogin}>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Username</label>
              <input name="username" type="text" placeholder="e.g., admin" required />
            </div>
            <div className="form-group" style={{ textAlign: 'left' }}>
              <label>Password</label>
              <input name="password" type="password" placeholder="e.g., admin123" required />
            </div>
            <button type="submit" className="btn" style={{ marginTop: '1rem' }}>Authenticate</button>
          </form>
          
          <div style={{ marginTop: '2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <p style={{ marginTop: '0.5rem', fontStyle: 'italic' }}>New drivers are automatically registered upon first login!</p>
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

  // Find their OWN booking
  const myBooking = activeReservations.find(r => r.username === username);
  let timeTitle = "";
  let timeString = null;
  
  if (myBooking) {
      const waitMs = new Date(myBooking.startTime).getTime() - timeNow;
      if (waitMs > 0) {
         const hrs = Math.floor(waitMs / 3600000);
         const mins = Math.floor((waitMs % 3600000) / 60000);
         const secs = Math.floor((waitMs % 60000) / 1000);
         timeTitle = "Time Until Expected Arrival:";
         timeString = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
      } else {
         const elapsedMs = timeNow - new Date(myBooking.startTime).getTime();
         const hrs = Math.floor(elapsedMs / 3600000);
         const mins = Math.floor((elapsedMs % 3600000) / 60000);
         const secs = Math.floor((elapsedMs % 60000) / 1000);
         timeTitle = "Elapsed Parking Time:";
         timeString = hrs > 0 ? `${hrs}h ${mins}m ${secs}s` : `${mins}m ${secs}s`;
      }
  }

  const handleReserve = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedSlot) return;

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
          slotId: selectedSlot.id,
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
      } else {
        const errorData = await response.json();
        alert(`Reservation failed: ${errorData.error}`);
      }
    } catch (err) {
      console.error('Error reserving slot', err);
    }
  };

  const handleRelease = async (slotId: string) => {
    try {
      const response = await fetch(`${API_BASE}/api/release`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotId }),
      });
      if (response.ok) {
        await fetchData();
      }
    } catch(err) {
      console.error('Error releasing slot', err);
    }
  };

  return (
    <div className="app-container">
      <header style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        <div className="logo">
          <h1>NexusPark</h1>
        </div>
        
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '1.2rem', padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '20px' }}>
             {role} Privileges
          </div>
          <button style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.2)', color: 'white', padding: '0.6rem', borderRadius: '50%', cursor: 'pointer' }} onClick={() => setIsAuth(false)}>
             ✖
          </button>
        </div>
      </header>

      <main className="dashboard" style={{ gridTemplateColumns: '1fr 3fr' }}>
        <aside>
          {role === 'Admin' && (
            <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
              <h2>Lot Analytics</h2>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="label">Total Slots</span>
                  <span className="value">{loading ? '-' : stats.total}</span>
                </div>
                <div className="stat-item" style={{ borderLeft: '3px solid var(--status-available)' }}>
                  <span className="label">Available</span>
                  <span className="value" style={{ color: 'var(--status-available)' }}>{loading ? '-' : stats.available}</span>
                </div>
                <div className="stat-item" style={{ borderLeft: '3px solid var(--status-reserved)' }}>
                  <span className="label">Reserved</span>
                  <span className="value" style={{ color: 'var(--status-reserved)' }}>{loading ? '-' : stats.reserved}</span>
                </div>
              </div>
              
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                 <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Completed Revenue</h3>
                 <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#10b981' }}>
                   ${totalRevenue.toFixed(2)}
                 </div>
              </div>
            </div>
          )}

          <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
            <h2>Pricing Strategy</h2>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
              Currently Active:
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.2)', borderRadius: '20px', color: 'var(--accent-primary)', fontSize: '0.8rem', fontWeight: 'bold' }}>
                Dynamic Hourly
              </div>
              <span>$15.00 / hr</span>
            </div>
          </div>

          {role === 'Driver' && timeString && (
             <div className="glass-card" style={{ background: 'var(--accent-gradient)' }}>
                <h2>Your Schedule</h2>
                <div style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.8)' }}>{timeTitle}</div>
                <div style={{ fontSize: '2.4rem', fontWeight: 'bold', marginTop: '0.5rem', fontFamily: 'monospace' }}>
                   {timeString}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.8)', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.2)', paddingTop: '0.5rem' }}>
                  Slot ID: {myBooking?.slotId} | Plate: {myBooking?.vehicle?.licensePlate}
                </div>
             </div>
          )}
        </aside>

        <section>
          {role === 'Driver' && (
             <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to NexusPark</h2>
                <p style={{ color: 'var(--text-secondary)' }}>Find an available slot below and tap to reserve it instantly, or schedule it for later.</p>
             </div>
          )}

          <div className="glass-card" style={{ padding: '2rem', minHeight: '400px', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>Zone A Grid View</h2>
              <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px'}}><span style={{display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-available)'}}></span> Available</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '5px'}}><span style={{display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: 'var(--status-reserved)'}}></span> Reserved/Occupied</span>
              </div>
            </div>
            
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
                Loading live backend data...
              </div>
            ) : (
              <div className="parking-grid">
                {slots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className={`slot ${slot.status}`}
                    onClick={() => {
                        if (role === 'Driver') {
                            if (slot.status === 'Available') setSelectedSlot(slot);
                            else alert("This slot is already taken!");
                        } else {
                            // Admin overriding
                            if (slot.status === 'Available') setSelectedSlot(slot);
                        }
                    }}
                  >
                    <span>{slot.id}</span>
                    <small>{slot.status}</small>
                  </div>
                ))}
              </div>
            )}
          </div>

          {role === 'Admin' && (
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h2 style={{ marginBottom: '1.5rem' }}>Active Vehicle Operations</h2>
              {activeReservations.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No active vehicles in the lot.</p>
              ) : (
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '1rem' }}>Slot & Status</th>
                      <th style={{ padding: '1rem' }}>Vehicle</th>
                      <th style={{ padding: '1rem' }}>Time & Cost</th>
                      <th style={{ padding: '1rem', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeReservations.map(res => (
                      <tr key={res.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '1rem', fontWeight: 'bold' }}>
                           <div>{res.slotId}</div>
                           <small style={{ color: res.status === 'Scheduled' ? 'var(--status-reserved)' : 'var(--status-available)' }}>{res.status}</small>
                        </td>
                        <td style={{ padding: '1rem' }}>
                          <div>{res.vehicle.licensePlate}</div>
                          <small style={{ color: 'var(--text-secondary)' }}>{res.vehicle.type}</small>
                        </td>
                        <td style={{ padding: '1rem', color: '#10b981' }}>
                           <div>${res.price.toFixed(2)}</div>
                           <small style={{ color: 'var(--text-secondary)' }}>{new Date(res.startTime).toLocaleTimeString()}</small>
                        </td>
                        <td style={{ padding: '1rem', textAlign: 'right' }}>
                          <button 
                            onClick={() => handleRelease(res.slotId)}
                            style={{
                              padding: '0.5rem 1rem', background: 'transparent',
                              border: `1px solid ${res.status === 'Scheduled' ? '#f59e0b' : '#ef4444'}`, color: res.status === 'Scheduled' ? '#f59e0b' : '#ef4444',
                              borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'
                            }}
                          >
                            {res.status === 'Scheduled' ? 'Cancel' : 'Vehicle Exit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </section>
      </main>

      {selectedSlot && (
        <div className="modal-overlay" onClick={() => setSelectedSlot(null)}>
          <div className="glass-card modal-content" onClick={e => e.stopPropagation()}>
            <h2>Reserve Slot {selectedSlot.id}</h2>
            <form onSubmit={handleReserve}>
              <div className="form-group">
                <label>Your License Plate</label>
                <input name="licensePlate" type="text" placeholder="e.g. XYZ-123" required />
              </div>
              <div className="form-group">
                <label>Vehicle Type</label>
                <select name="vehicleType">
                  <option value="Car">Car</option>
                  <option value="Bike">Bike</option>
                  <option value="Electric Vehicle">Electric Vehicle</option>
                </select>
              </div>
              <div className="form-group">
                <label>Start Time (Leave blank for NOW)</label>
                <input name="startTime" type="datetime-local" style={{color: 'white', background: 'rgba(0,0,0,0.2)'}} />
              </div>
              <div className="form-group">
                <label>Duration (Hours)</label>
                <input name="duration" type="number" min="1" max="24" defaultValue="2" required />
              </div>
              <div style={{ marginTop: '2rem' }}>
                <button type="submit" className="btn">Confirm Reservation</button>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedSlot(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
