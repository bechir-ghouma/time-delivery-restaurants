import axios from 'axios';

const API_BASE_URL = `https://time-delivery-server.fly.dev/schedule`; // Replace with your API URL

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods for RegularSchedule entity

// Create or Update Regular Schedule for a Restaurant
export const saveRegularSchedule = async (restaurantId, scheduleData) => {
  try {
    const response = await api.put(`/restaurant/${restaurantId}/regular-schedule`, { scheduleData });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
export const saveRegularScheduleRestaurant = async (restaurantId, scheduleData) => {
  try {
    const response = await api.put(`/restaurant/${restaurantId}/regular-schedule-restaurant`, { scheduleData });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
export const saveRegularScheduleLivreur = async (restaurantId, scheduleData) => {
  try {
    const response = await api.put(`/restaurant/${restaurantId}/regular-schedule-livreur`, { scheduleData });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
// Get Regular Schedule by Restaurant ID
export const getRegularScheduleRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurant/${restaurantId}/regular-schedule-restaurant`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getRegularScheduleLivreur = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurant/${restaurantId}/regular-schedule-livreur`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getRegularSchedule = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurant/${restaurantId}/regular-schedule`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// API methods for EmergencyClosure entity

// Create or Update Emergency Closure for a Restaurant
export const saveEmergencyClosure = async (restaurantId, emergencyClosure) => {
  try {
    const response = await api.post(`/restaurant/${restaurantId}/emergency-closure`, { emergencyClosure });
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Get Emergency Closure by Restaurant ID
export const getEmergencyClosure = async (restaurantId) => {
  try {
    const response = await api.get(`/restaurant/${restaurantId}/emergency-closure`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
