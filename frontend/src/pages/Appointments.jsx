import { useState, useEffect } from 'react';
import api from '../api/api';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

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

        setAppointments(allAppointments);
      } catch (error) {
        console.error('Error loading appointments:', error);
      }
    };
    loadAppointments();
  }, []);

  const filteredAppointments = filterStatus === 'all'
    ? appointments
    : appointments.filter(a => a.status === filterStatus);

  const getStatusClass = (status) => {
    switch(status) {
      case 'COMPLETED': return 'completed';
      case 'BOOKED': return 'booked';
      case 'CANCELLED': return 'cancelled';
      default: return '';
    }
  };

  return (
    <div className="appointments-page">
      <div className="page-header">
        <h1>Appointments</h1>
      </div>

      <div className="search-filter">
        <select className="filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="COMPLETED">Completed</option>
          <option value="BOOKED">Booked</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      <div className="table-container">
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
                <td>#{apt.appointment_id}</td>
                <td>{apt.customer_name}</td>
                <td>{apt.vehicle_plate}</td>
                <td>{apt.appointment_date}</td>
                <td>{apt.timeslot}</td>
                <td>{apt.mechanic_name || 'Not assigned'}</td>
                <td>
                  <span className={`status-badge ${getStatusClass(apt.status)}`}>
                    {apt.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAppointments.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📅</div>
          <p>No appointments found with status "{filterStatus}"</p>
        </div>
      )}
    </div>
  );
}

export default Appointments;