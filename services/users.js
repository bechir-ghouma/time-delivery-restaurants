  import axios from 'axios';

  const API_BASE_URL = `https://time-delivery-server.fly.dev`;

  const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // API methods for User entity
  export const createUser = async (formData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users`, formData, {
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
  export const getAllUsers = async () => {
    return api.get('/users');
  };

  export const getRestaurantsWithPromotions = async () => {
    return api.get('/users/restaurants/with-promotions');
  };

  export const getUserById = async (userId) => {
    return api.get(`/users/${userId}`);
  };

  export const getUsersByRole = async (role) => {
      return api.get(`/users/role/${role}`);
  };

  export const updateUser = async (userId, formData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/${userId}`, formData, {
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

  export const deleteUser = async (userId) => {
    return api.delete(`/users/${userId}`);
  };

  export const recoverUser = async (userId) => {
    return api.delete(`/users/recover/${userId}`);
  };

  export const handleSignIn = async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/signin`, { email, password });
      console.log('Sign-in successful:', response.data);
      return response;  // Return the response from Axios
    } catch (error) {
      // Handle error response properly
      if (error.response && error.response.data) {
        console.error('Sign-in failed:', error.response.data.error);
        throw new Error(error.response.data.error); // Throw error with a meaningful message
      } else {
        console.error('Sign-in failed:', error.message);
        throw new Error('An error occurred during sign-in');
      }
    }
  };

  export const searchRestaurants = async (nameRestaurant) => {
    try {
      const response = await api.get(`${API_BASE_URL}/users//search/restaurants/${nameRestaurant}`);
      return response.data;  // Retourne les données des restaurants correspondants
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  export const getTopRatedRestaurants = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users/restaurants/top-rated`);
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  // Request password reset code
  export const requestPasswordReset = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/request-password-reset`, { email });
      console.log('Password reset email sent:', response.data);
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  // Reset password with code
  export const resetPassword = async (email, verificationCode, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/request-password-reset`, {
        email,
        verificationCode,
        newPassword,
      });
      console.log('Password reset successful:', response.data);
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error;
    }
  };

  export const verifyToken = async (email, verificationCode) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/verify-token`, {
        email,
        verificationCode,
      });
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error.response ? error.response.data.error : 'Une erreur est survenue';
    }
  };

  export const changePassword = async (email, newPassword) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/change-password`, {
        email,
        newPassword,
      });
      return response.data;
    } catch (error) {
      console.error('API error:', error);
      throw error.response ? error.response.data.error : 'An error occurred';
    }
  };
  export const updateTarifRestaurant = async (userId, newTarif) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/users/update-tarif-restaurant/${userId}`, {
        newTarif,
      });
      console.log('Tarif du restaurant mis à jour avec succès:', response.data);
      return response.data;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du tarif du restaurant:', error);
      throw error.response ? error.response.data.error : 'An error occurred';
    }
  };

  export const sendVerificationCode = async (email) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/users/send-code`, { email });
      return response.data || {}; // fallback to empty object if response is empty
    } catch (error) {
      console.error('Error sending verification code:', error);

      // Extract server error message if available
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.message || 'Échec de l\'envoi du code';
        throw new Error(serverMessage);
      }

      throw new Error('Une erreur est survenue lors de l\'envoi du code de vérification');
    }
  };
  // Add this function to your userService.js file

  export const verifyEmailCode = async (email, verificationCode) => {
    try {
      console.log('Sending verification request:', { email, code: verificationCode });
      
      const response = await axios.post(`${API_BASE_URL}/users/verify-email`, {
        email,
        verificationCode,
      });
      
      console.log('Verification response received:', response.data);
      
      if (!response.data || !response.data.user) {
        console.error('Invalid response format:', response.data);
        throw new Error('Format de réponse invalide');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error verifying email code:', error);
      
      // Extract server error message if available
      if (error.response && error.response.data) {
        const serverMessage = error.response.data.error || 'Échec de la vérification du code';
        throw new Error(serverMessage);
      }
      
      // Network or other errors
      throw new Error(error.message || 'Une erreur est survenue lors de la vérification du code');
    }
  };