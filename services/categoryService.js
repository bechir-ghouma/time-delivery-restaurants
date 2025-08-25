import axios from 'axios';


const API_BASE_URL = `https://time-delivery-server.fly.dev`; // Remplacez par l'URL de votre API

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// API methods for Category entity

// Créer une nouvelle catégorie
export const createCategory = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/categories`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Récupérer toutes les catégories
export const getAllCategories = async () => {
  return api.get('/categories');
};

// Récupérer une catégorie par ID
export const getCategoryById = async (categoryId) => {
  return api.get(`/categories/${categoryId}`);
};

// Récupérer les catégories par restaurant
export const getCategoriesByRestaurant = async (restaurantId) => {
  return api.get(`/categories/restaurant/${restaurantId}`);
};

// Mettre à jour une catégorie
export const updateCategory = async (categoryId, formData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/categories/${categoryId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Supprimer une catégorie
export const deleteCategory = async (categoryId) => {
  return api.delete(`/categories/${categoryId}`);
};

export const recoverCategory = async (categoryId) => {
  return api.delete(`/categories/recover/${categoryId}`);
};

export const getCategoriesWithMenusByRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/categories/restaurant/${restaurantId}/with-menus`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getRestaurantsByCategoryName = async (categoryName) => {
  try {
    const response = await api.get(`/categories/restaurants/category/${categoryName}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};
