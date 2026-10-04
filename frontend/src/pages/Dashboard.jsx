import React from 'react';
import { Link } from 'react-router-dom';

function Dashboard({ stats }) {
  return (
    <div className="dashboard">
      {/* Hero Banner */}
      <div className="dashboard-hero">
        <div className="dashboard-hero-content">
          <h1>Vehicle Service Center</h1>
          <p>Manage your fleet and appointments with real-time graph insights</p>
          <Link to="/graph" className="btn-primary">View Graph Database</Link>
        </div>
        <div className="dashboard-hero-image">
          <img src="/images/car.jpg" alt="Vehicle Service" />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon stat-icon--customers">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Customers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--vehicles">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2"/>
              <path d="M16 8h4a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2"/>
              <circle cx="5.5" cy="18.5" r="1.5"/>
              <circle cx="18.5" cy="18.5" r="1.5"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.vehicles}</div>
            <div className="stat-label">Vehicles</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--appointments">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.appointments}</div>
            <div className="stat-label">Appointments</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon stat-icon--mechanics">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
            </svg>
          </div>
          <div>
            <div className="stat-value">{stats.mechanics}</div>
            <div className="stat-label">Mechanics</div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="section-card">
          <h3>Recent Service Activity</h3>
          <div className="activity-list">
            <div className="activity-item">
              <span className="activity-date">20 Sep</span>
              <span className="activity-text">Arun Kumar's Swift - Oil Change</span>
              <span className="status-badge completed">Completed</span>
            </div>
            <div className="activity-item">
              <span className="activity-date">21 Sep</span>
              <span className="activity-text">Priya Sharma's Creta - Brake Service</span>
              <span className="status-badge completed">Completed</span>
            </div>
            <div className="activity-item">
              <span className="activity-date">22 Sep</span>
              <span className="activity-text">Rahul Verma's City - Engine Tune Up</span>
              <span className="status-badge booked">Booked</span>
            </div>
            <div className="activity-item">
              <span className="activity-date">23 Sep</span>
              <span className="activity-text">Sneha Reddy's Nexon - Wheel Alignment</span>
              <span className="status-badge completed">Completed</span>
            </div>
            <div className="activity-item">
              <span className="activity-date">24 Sep</span>
              <span className="activity-text">Karthik Raj's Verna - AC Repair</span>
              <span className="status-badge booked">Booked</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="section-card">
          <h3>Quick Navigation</h3>
          <div className="quick-actions">
            <Link to="/customers" className="quick-action-btn">
              <span className="quick-action-icon">Customers</span>
              <span className="quick-action-label">View all customers</span>
            </Link>
            <Link to="/vehicles" className="quick-action-btn">
              <span className="quick-action-icon">Vehicles</span>
              <span className="quick-action-label">Browse vehicle fleet</span>
            </Link>
            <Link to="/appointments" className="quick-action-btn">
              <span className="quick-action-icon">Appointments</span>
              <span className="quick-action-label">Schedule and track</span>
            </Link>
            <Link to="/mechanics" className="quick-action-btn">
              <span className="quick-action-icon">Mechanics</span>
              <span className="quick-action-label">Team management</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;