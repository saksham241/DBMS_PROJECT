import { Link } from 'react-router-dom';

function Dashboard({ stats }) {
  const recentActivities = [
    {
      id: 301,
      customer: 'Saksham Mittal',
      vehicle: 'Tesla Model 3 (KA-01-MJ-5021)',
      mechanic: 'John Miller',
      date: '2026-10-10',
      time: '09:30 AM',
      status: 'Completed'
    },
    {
      id: 302,
      customer: 'Alice Johnson',
      vehicle: 'BMW M340i (DL-04-AB-1234)',
      mechanic: 'David Wilson',
      date: '2026-10-12',
      time: '02:00 PM',
      status: 'In Progress'
    },
    {
      id: 303,
      customer: 'Bob Smith',
      vehicle: 'Toyota Fortuner (MH-12-PQ-9876)',
      mechanic: 'Carlos Sanchez',
      date: '2026-10-15',
      time: '11:00 AM',
      status: 'Scheduled'
    },
    {
      id: 304,
      customer: 'Saksham Mittal',
      vehicle: 'Audi A6 (KA-05-XY-7890)',
      mechanic: 'John Miller',
      date: '2026-10-18',
      time: '04:30 PM',
      status: 'Scheduled'
    }
  ];

  return (
    <div className="dashboard-page">
      {/* Hero Banner */}
      <div className="hero-banner">
        <div className="hero-content">
          <h1 className="hero-title">
            Vehicle Service Management
          </h1>
          <p className="hero-subtitle">
            Centralized portal to manage service appointments, customer profiles, vehicle fleet records, and mechanic assignments.
          </p>
          <div className="hero-actions">
            <Link to="/graph" className="btn-primary">
              View Graph Database
            </Link>
            <Link to="/vehicles" className="btn-secondary">
              Browse Vehicles
            </Link>
          </div>
        </div>

        <div className="hero-visual">
          <div className="hero-visual-card">
            <img src="/images/car.jpg" alt="Vehicle Fleet" />
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <Link to="/customers" className="stat-card">
          <span className="stat-label">Total Customers</span>
          <span className="stat-value">{stats.customers || 4}</span>
          <span className="stat-meta">Registered vehicle owners</span>
        </Link>

        <Link to="/vehicles" className="stat-card">
          <span className="stat-label">Registered Vehicles</span>
          <span className="stat-value">{stats.vehicles || 5}</span>
          <span className="stat-meta">Active fleet models</span>
        </Link>

        <Link to="/appointments" className="stat-card">
          <span className="stat-label">Appointments</span>
          <span className="stat-value">{stats.appointments || 4}</span>
          <span className="stat-meta">Scheduled and completed</span>
        </Link>

        <Link to="/mechanics" className="stat-card">
          <span className="stat-label">Mechanics</span>
          <span className="stat-value">{stats.mechanics || 3}</span>
          <span className="stat-meta">Service specialists</span>
        </Link>
      </div>

      {/* 2-Column Content */}
      <div className="dashboard-grid">
        {/* Service Activity */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Service Activity</h3>
          </div>

          <div className="activity-list">
            {recentActivities.map((act) => (
              <div key={act.id} className="activity-item">
                <div>
                  <div className="activity-title">{act.vehicle}</div>
                  <div className="activity-desc">
                    Owner: {act.customer} • Mechanic: {act.mechanic} • {act.date} ({act.time})
                  </div>
                </div>
                <div>
                  <span className={`status-badge ${act.status.toLowerCase().replace(' ', '-')}`}>
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Quick Navigation</h3>
          </div>

          <div className="quick-actions-grid">
            <Link to="/customers" className="quick-action-card">
              <div className="qa-title">Customers</div>
              <div className="qa-desc">View customer accounts and ownership</div>
            </Link>

            <Link to="/vehicles" className="quick-action-card">
              <div className="qa-title">Vehicles</div>
              <div className="qa-desc">Browse vehicle registration details</div>
            </Link>

            <Link to="/appointments" className="quick-action-card">
              <div className="qa-title">Appointments</div>
              <div className="qa-desc">Track and review appointment schedules</div>
            </Link>

            <Link to="/graph" className="quick-action-card">
              <div className="qa-title">Graph View</div>
              <div className="qa-desc">Open the interactive network visualization</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;