import axios from 'axios';

// Remplacez par l'URL de votre serveur backend
const API_BASE_URL = `https://time-delivery-server.fly.dev`;

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Créer un nouveau menu
export const createMenu = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/menus`, formData, {
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

// Récupérer tous les menus
export const getAllMenus = async () => {
  try {
    const response = await api.get('/menus');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Récupérer un menu par ID
export const getMenuById = async (menuId) => {
  try {
    const response = await api.get(`/menus/${menuId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Récupérer les menus d'une catégorie
export const getMenusByCategory = async (categoryId) => {
  try {
    const response = await api.get(`/menus/category/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getPromotionalMenusByRestaurant = async (restaurantId) => {
  try {
    const response = await api.get(`/menus/restaurant/${restaurantId}/promotions`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Mettre à jour un menu
export const updateMenu = async (menuId, formData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/menus/${menuId}`, formData, {
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

// Supprimer un menu
export const deleteMenu = async (menuId) => {
  try {
    const response = await api.delete(`/menus/${menuId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const recoverMenu = async (menuId) => {
  try {
    const response = await api.delete(`/menus/recover/${menuId}`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }

  
};

export const searchMenus = async (searchTerm) => {
  try {
    const response = await api.get(`/menus/search/${searchTerm}`);
    return response.data;  // Retourne les données des menus correspondants
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getRestaurantsWithPromotionalMenus = async () => {
  try {
    const response = await api.get(`/menus/restaurants-with-promotions`);
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

export const getAdminFavoriteDishes = async () => {
  try {
    const response = await api.get('/menus/admin-favorites');
    return response.data;
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};