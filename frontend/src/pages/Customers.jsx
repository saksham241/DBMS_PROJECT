import { useState, useEffect } from 'react';
import api from '../api/api';

function Customers() {
  const [customers, setCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await api.getCustomers();
        setCustomers(response.data);
      } catch (error) {
        console.error('Error loading customers:', error);
      }
    };
    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.customer_id.toString().includes(searchTerm)
  );

  return (
    <div className="customers-page">
      <div className="page-header">
        <h1>Customers</h1>
      </div>

      <div className="search-filter">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search customers by name or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="cards-grid">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.customer_id}
            className="customer-card"
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="customer-card-header">
              <div className="customer-avatar">
                {customer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="customer-card-info">
                <h3>{customer.name}</h3>
                <span>Customer ID: {customer.customer_id}</span>
              </div>
            </div>
            <div className="customer-card-body">
              <h4>Owned Vehicles ({customer.vehicles.length})</h4>
              {customer.vehicles.map((vehicle) => (
                <div key={vehicle.vehicle_id} className="vehicle-mini">
                  <span className="car-icon">🚗</span>
                  <span className="v-plate">{vehicle.registration_no}</span>
                  <span className="v-details">{vehicle.brand} {vehicle.model} ({vehicle.year})</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <p>No customers found matching "{searchTerm}"</p>
        </div>
      )}

      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Customer Details</h3>
              <button className="modal-close" onClick={() => setSelectedCustomer(null)}>×</button>
            </div>
            <div className="modal-body">
              <div className="modal-avatar-row">
                <div className="modal-avatar">
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div className="modal-avatar-info">
                  <h3>{selectedCustomer.name}</h3>
                  <span>Customer ID: {selectedCustomer.customer_id}</span>
                </div>
              </div>

              <h4>Customer Information</h4>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="label">Customer ID</div>
                  <div className="value">#{selectedCustomer.customer_id}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Full Name</div>
                  <div className="value">{selectedCustomer.name}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Total Vehicles</div>
                  <div className="value">{selectedCustomer.vehicles.length}</div>
                </div>
                <div className="detail-item">
                  <div className="label">Status</div>
                  <div className="value status-active">Active</div>
                </div>
              </div>

              <h4>Owned Vehicles</h4>
              {selectedCustomer.vehicles.map((v) => (
                <div key={v.vehicle_id} className="vehicle-mini-detail">
                  <div className="vmd-plate">{v.registration_no}</div>
                  <div className="vmd-text">{v.brand} {v.model} ({v.year})</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;