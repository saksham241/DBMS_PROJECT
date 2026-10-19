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
    c.customer_id.toString().includes(searchTerm) ||
    (c.vehicles && c.vehicles.some(v => v.registration_no.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="customers-page">
      <div className="page-header-row">
        <div className="page-title-wrap">
          <h1>Customers</h1>
          <p className="page-subtitle">Directory of registered vehicle owners and fleet records</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="search-filter-bar">
        <div className="search-input-wrap">
          <input
            type="text"
            placeholder="Search customers by name, customer ID, or license plate..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Customers Cards Grid */}
      <div className="cards-grid">
        {filteredCustomers.map((customer) => (
          <div
            key={customer.customer_id}
            className="customer-card"
            onClick={() => setSelectedCustomer(customer)}
          >
            <div className="customer-card-header">
              <div className="customer-avatar">
                {customer.name
                  .split(' ')
                  .map(n => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="customer-card-info">
                <h3>{customer.name}</h3>
                <span>Customer #{customer.customer_id}</span>
              </div>
            </div>

            <div className="customer-card-body">
              <h4>Owned Vehicles ({customer.vehicles?.length || 0})</h4>
              {customer.vehicles && customer.vehicles.map((v) => (
                <div key={v.vehicle_id} className="vehicle-mini-badge">
                  <span className="v-plate-chip">{v.registration_no}</span>
                  <span className="v-desc-chip">
                    {v.brand} {v.model} ({v.year})
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="empty-box">
          <p>No customers found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div className="modal-overlay" onClick={() => setSelectedCustomer(null)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div className="customer-avatar">
                  {selectedCustomer.name
                    .split(' ')
                    .map(n => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div>
                  <h3 style={{ margin: 0, color: '#0f172a' }}>{selectedCustomer.name}</h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
                    Customer #{selectedCustomer.customer_id}
                  </span>
                </div>
              </div>
              <button className="modal-close-icon" onClick={() => setSelectedCustomer(null)}>
                ×
              </button>
            </div>

            <div className="detail-specs-grid">
              <div className="spec-cell">
                <div className="spec-cell-label">Customer ID</div>
                <div className="spec-cell-val">#{selectedCustomer.customer_id}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Status</div>
                <div className="spec-cell-val" style={{ color: '#059669' }}>Active</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Total Vehicles</div>
                <div className="spec-cell-val">{selectedCustomer.vehicles?.length || 0}</div>
              </div>
              <div className="spec-cell">
                <div className="spec-cell-label">Relationship</div>
                <div className="spec-cell-val" style={{ color: '#2563eb' }}>OWNS</div>
              </div>
            </div>

            <h4 style={{ marginTop: '1.25rem', marginBottom: '0.65rem', color: '#0f172a' }}>
              Registered Vehicles
            </h4>
            {selectedCustomer.vehicles && selectedCustomer.vehicles.map((v) => (
              <div
                key={v.vehicle_id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '6px',
                  marginBottom: '6px'
                }}
              >
                <div>
                  <div className="license-plate" style={{ marginBottom: 0 }}>
                    {v.registration_no}
                  </div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '2px' }}>
                    {v.brand} {v.model} • {v.year}
                  </div>
                </div>
                <span className="status-badge completed">Registered</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Customers;