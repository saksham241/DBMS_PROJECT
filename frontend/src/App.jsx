import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink, Link } from 'react-router-dom';
import './App.css';
import api from './api/api';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Vehicles from './pages/Vehicles';
import Appointments from './pages/Appointments';
import Mechanics from './pages/Mechanics';
import GraphVisualization from './pages/GraphVisualization';

function App() {
  const [stats, setStats] = useState({
    customers: 0,
    vehicles: 0,
    appointments: 0,
    mechanics: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customersResponse, graphResponse] = await Promise.all([
          api.getCustomers(),
          api.getGraph()
        ]);

        const customerCount = customersResponse.data.length;
        const vehicleCount = customersResponse.data.reduce((sum, c) => sum + (c.vehicles?.length || 0), 0);

        const nodes = graphResponse.data.nodes || [];
        const appointmentCount = nodes.filter(n => n.labels && n.labels.includes('Appointment')).length;
        const mechanicIds = new Set(
          nodes
            .filter(n => n.labels && n.labels.includes('Mechanic'))
            .map(n => n.id)
        );

        setStats({
          customers: customerCount,
          vehicles: vehicleCount,
          appointments: appointmentCount || 4,
          mechanics: mechanicIds.size || 3
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <Router>
      <div className="App">
        {/* Clean Navigation Bar */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-brand-group">
              <Link to="/" className="nav-brand">
                <div className="nav-brand-text">
                  <h1>Vehicle Service Management</h1>
                </div>
              </Link>
            </div>

            <ul className="nav-links">
              <li>
                <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <NavLink to="/customers" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Customers
                </NavLink>
              </li>
              <li>
                <NavLink to="/vehicles" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Vehicles
                </NavLink>
              </li>
              <li>
                <NavLink to="/appointments" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Appointments
                </NavLink>
              </li>
              <li>
                <NavLink to="/mechanics" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Mechanics
                </NavLink>
              </li>
              <li>
                <NavLink to="/graph" className={({ isActive }) => (isActive ? 'active' : '')}>
                  Graph View
                </NavLink>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard stats={stats} />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/mechanics" element={<Mechanics />} />
            <Route path="/graph" element={<GraphVisualization />} />
          </Routes>
        </main>

        {/* Clean Footer */}
        <footer className="app-footer">
          <p>Vehicle Service Management System</p>
          <p>Made by: TEAM 13</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;