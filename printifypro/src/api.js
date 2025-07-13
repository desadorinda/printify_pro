// api.js
import axios from 'axios'
import { API_BASE_URL } from './config';

const API_BASE = API_BASE_URL;
const ADMIN_BASE = API_BASE + '/admin';

export const login = async ({ email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/auth/login`, {
      email,
      password,
    })
    // Expect { success, user, token }
    if (response.data && response.data.success && response.data.token && response.data.user) {
      // Ensure role is present in user object
      return { success: true, user: { ...response.data.user, role: response.data.user.role }, token: response.data.token }
    } else {
      return { success: false, error: response.data?.error || 'Invalid response from server' }
    }
  } catch (err) {
    return { success: false, error: err.response?.data?.error || err.message }
  }
}

export const register = async ({ email, password }) => {
  const response = await axios.post(`${API_BASE}/auth/register`, {
    email,
    password,
  })
  return response.data
}

export const getCurrentUser = async () => {
  const response = await axios.get(`${API_BASE}/auth/me`);
  // If backend returns { user: {...} }, return just the user object
  if (response.data && response.data.user) {
    return response.data.user;
  }
  return response.data;
}

export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    console.log("Set Axios Authorization header:", axios.defaults.headers.common['Authorization']); // DEBUG
  } else {
    delete axios.defaults.headers.common['Authorization'];
    console.log("Cleared Axios Authorization header"); // DEBUG
  }
}

export const likeProduct = async (productId, token) => {
  return axios.post(`${ADMIN_BASE}/products/${productId}/like`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const unlikeProduct = async (productId, token) => {
  return axios.delete(`${ADMIN_BASE}/products/${productId}/like`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const addToCart = async (productId, token, quantity = 1, description = null) => {
  // Use product_id to match backend expectation
  return axios.post(`${ADMIN_BASE}/cart/add`, { product_id: productId, quantity, description }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const addDesignToCart = async (designId, token, quantity = 1, description = null) => {
  // Ensure backend expects 'design_id' not 'designId' (snake_case)
  return axios.post(`${ADMIN_BASE}/cart/add`, { design_id: designId, quantity, description }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const addReview = async (productId, rating, comment, token) => {
  return axios.post(`${API_BASE}/users/reviews`, { product_id: productId, rating, comment }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getProductReviews = async (productId) => {
  return axios.get(`${API_BASE}/users/reviews/${productId}`);
};

export const getProductLikes = async (productId, token) => {
  return axios.get(`${ADMIN_BASE}/products/${productId}/likes`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getUserCart = async (token) => {
  if (!token) {
    console.error('getUserCart called with no token!');
    return { data: { cartItems: [] } };
  }
  return axios.get(`${ADMIN_BASE}/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  });
};

export const updateCartQuantity = async (cartItemId, quantity, token, description = null) => {
  console.log('[api.js] updateCartQuantity called', cartItemId, quantity, token, description);
  return axios.put(`${ADMIN_BASE}/cart/item/${cartItemId}`, { quantity, description }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const removeFromCart = async (cartItemId, token) => {
  console.log('[api.js] removeFromCart called', cartItemId, token);
  return axios.delete(`${ADMIN_BASE}/cart/item/${cartItemId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const checkoutOrder = async (orderData, token) => {
  return axios.post(`${ADMIN_BASE}/checkout`, orderData, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getAllOrders = async (token) => {
  return axios.get(`${ADMIN_BASE}/orders`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};

export const getOrderById = async (orderId, token) => {
  return axios.get(`${ADMIN_BASE}/orders/${orderId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {}
  });
};
