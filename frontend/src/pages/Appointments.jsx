import { useState, useEffect } from 'react';
import api from '../api/api';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const customersResponse = await api.getCustomers();
        const allAppointments = [];

        for (const customer of customersResponse.data) {
          for (const vehicle of customer.vehicles) {
            const historyResponse = await api.getVehicleHistory(vehicle.vehicle_id);
            historyResponse.data.forEach(apt => {
              allAppointments.push({
                ...apt,
                customer_name: customer.name,
                vehicle_plate: vehicle.registration_no,
                vehicle_model: `${vehicle.brand} ${vehicle.model}`,
                vehicle_id: vehicle.vehicle_id
              });
            });
          }
        }

        allAppointments.sort((a, b) => new Date(a.appointment_date) - new Date(b.appointment_date));
        setAppointments(allAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    loadAppointments();
  }, []);

  const filteredAppointments = appointments.filter(apt => {
    const matchesFilter = filterStatus === 'all' || apt.status.toLowerCase() === filterStatus.toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      apt.customer_name.toLowerCase().includes(query) ||
      apt.vehicle_plate.toLowerCase().includes(query) ||
      apt.vehicle_model.toLowerCase().includes(query) ||
      (apt.mechanic_name && apt.mechanic_name.toLowerCase().includes(query));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="appointments-page">
      <div className="page-header-row">
        <div className="page-title-wrap">
          <h1>Appointments</h1>
          <p className="page-subtitle">Schedule, ongoing, and completed vehicle service appointments</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search by customer, vehicle, registration plate, or mechanic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="in progress">In Progress</option>
          <option value="scheduled">Scheduled</option>
        </select>
      </div>

      {/* Clean Table */}
      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Vehicle</th>
              <th>Date</th>
              <th>Time Slot</th>
              <th>Mechanic</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAppointments.map((apt, index) => (
              <tr key={index}>
                <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                  #{apt.appointment_id}
                </td>
                <td style={{ fontWeight: 600 }}>{apt.customer_name}</td>
                <td>
                  <div>{apt.vehicle_model}</div>
                  <div style={{ fontSize: '0.78rem', fontFamily: 'var(--font-mono)', color: '#64748b' }}>
                    {apt.vehicle_plate}
                  </div>
                </td>
                <td style={{ color: '#475569' }}>{apt.appointment_date}</td>
                <td style={{ fontFamily: 'var(--font-mono)' }}>{apt.timeslot}</td>
                <td>
                  {apt.mechanic_name ? (
                    <div>
                      <div style={{ fontWeight: 600 }}>{apt.mechanic_name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{apt.specialization}</div>
                    </div>
                  ) : (
                    <span style={{ color: '#94a3b8' }}>Unassigned</span>
                  )}
                </td>
                <td>
                  <span className={`status-badge ${(apt.status || '').toLowerCase().replace(' ', '-')}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="empty-box">
          <p>No appointments found matching your criteria</p>
        </div>
      )}
    </div>
  );
}

export default Appointments;