import axios from 'axios';

const API_BASE_URL = `https://time-delivery-server.fly.dev/orders`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const createOrder = async (orderData) => {
  try {
    console.log("🔄 Sending order request...");
    console.log("📋 Order data:", JSON.stringify(orderData, null, 2));
    
    const response = await axios.post(`${API_BASE_URL}`, orderData, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 30000, // 30 second timeout
    });
    
    console.log("✅ Order created successfully:", response.data);
    return response.data;
    
  } catch (error) {
    console.error('❌ Error creating order:', error);
    
    // Enhanced error logging
    if (error.response) {
      // Server responded with error status
      console.error('Error response status:', error.response.status);
      console.error('Error response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Error response headers:', error.response.headers);
      
      // Throw the server error message if available
      if (error.response.data && error.response.data.error) {
        throw new Error(error.response.data.error);
      } else {
        throw new Error(`Server error: ${error.response.status} - ${error.response.statusText}`);
      }
      
    } else if (error.request) {
      // Request was made but no response received
      console.error('No response received:', error.request);
      throw new Error('Network error: No response from server. Please check your internet connection.');
      
    } else {
      // Something else happened
      console.error('Request setup error:', error.message);
      throw new Error(`Request error: ${error.message}`);
    }
  }
};

export const getAllOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  };
  
  export const getOrderById = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  };

  export const getOrdersByStatus = async (status) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status/${status}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order:', error);
      throw error;
    }
  };
  
  export const getOrderByIdWithLineOrders = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${orderId}/with-line-orders`);
      return response.data;
    } catch (error) {
      console.error('Error fetching order with line orders:', error);
      throw error;
    }
  };
  
  export const deleteOrder = async (orderId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  export const getOrdersByStatusAndRestaurant = async (restaurantId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/status/pending-and-preparing/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by status and restaurant:', error);
      throw error;
    }
  };

  export const getOrdersByRestaurant = async (restaurantId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by status and restaurant:', error);
      throw error;
    }
  };

  export const markOrderAsReady = async (orderId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${orderId}/ready`);
      console.log('Order marked as ready:', response.data);
    } catch (error) {
      console.error('Error marking order as ready:', error);
    }
  };
  
  export const getOrdersByDeliveryPerson = async (deliveryPersonId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/delivery-person/${deliveryPersonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by delivery person:', error);
      throw error;
    }
  };
  
  export const getOrdersByClientId = async (clientId) => {
    try {
      const response = await api.get(`${API_BASE_URL}/client/${clientId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by client ID:', error);
      throw error;
    }
  };

  export const getOrdersByRestaurantAndDate = async (restaurantId, date) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/restaurant/${restaurantId}/orders-by-date`, {
        date,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by restaurant and date:', error);
      throw error;
    }
  };

  export const getOrdersByLivreurAndDate = async (livreurId, date) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/livreur/${livreurId}/orders-by-date`, {
        date,
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by restaurant and date:', error);
      throw error;
    }
  };
  

  export const getPendingOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/pending`);
      return response.data;
    } catch (error) {
      console.error('Error fetching orders by delivery person:', error);
      throw error;
    }
  };

  export const assignOrderToDeliveryPerson = async (orderId, deliveryPersonId) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${orderId}/assign/${deliveryPersonId}`);
      return response.data;
    } catch (error) {
      console.error('Error assigning order to delivery person:', error);
      throw error;
    }
  };

  export const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${orderId}/status`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

    export const updateOrderStatusRes = async (orderId, status) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/${orderId}/status_Res`, { status });
      return response.data;
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  export const updateUserPushToken = async (userId, pushToken) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/${userId}/push-token`, {
      pushToken
    });
    return response.data;
  } catch (error) {
    console.error('Error updating push token:', error);
    throw error;
  }
};