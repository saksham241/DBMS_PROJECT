import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001/api'
});

export default {
  getCustomers() {
    return API.get('/customers');
  },
  getCustomerVehicles(customerId) {
    return API.get(`/customers/${customerId}/vehicles`);
  },
  getVehicleHistory(vehicleId) {
    return API.get(`/vehicles/${vehicleId}/history`);
  },
  getMechanicVehicles(mechanicId) {
    return API.get(`/mechanics/${mechanicId}/vehicles`);
  },
  getGraph() {
    return API.get('/graph');
  }
};