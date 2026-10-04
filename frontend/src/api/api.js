import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
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