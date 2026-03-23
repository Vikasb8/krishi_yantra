import axios from 'axios';
import store from '../store';
import { USER_LOGIN_SUCCESS, USER_LOGOUT } from '../constants/userConstants';

const apiClient = axios.create();

function readStoredUser() {
  try {
    const raw = localStorage.getItem('userInfo');
    if (!raw) return null;
    const u = JSON.parse(raw);
    if (u && typeof u.access === 'string' && u.access.length > 0) return u;
    return null;
  } catch {
    return null;
  }
}

function shouldSkipBearer(config) {
  const method = (config.method || 'get').toLowerCase();
  const path = (config.url || '').split('?')[0];
  if (method === 'post' && path.includes('/api/users/register')) return true;
  if (method === 'post' && path.includes('/api/users/token/refresh')) return true;
  if (method === 'post' && /\/api\/users\/token\/?$/.test(path)) return true;
  return false;
}

apiClient.interceptors.request.use((config) => {
  if (shouldSkipBearer(config)) return config;
  const user = readStoredUser();
  if (user?.access) {
    config.headers = config.headers || {};
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${user.access}`;
    }
  }
  return config;
});

let isRefreshing = false;
const failQueue = [];

function flushQueue(error) {
  const pending = failQueue.splice(0, failQueue.length);
  pending.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error);
      return;
    }
    delete config.headers.Authorization;
    resolve(apiClient(config));
  });
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (
      !error.response ||
      error.response.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    const path = (originalRequest.url || '').split('?')[0];

    if (path.includes('/api/users/token/refresh')) {
      localStorage.removeItem('userInfo');
      store.dispatch({ type: USER_LOGOUT });
      return Promise.reject(error);
    }

    if (/\/api\/users\/token\/?$/.test(path)) {
      return Promise.reject(error);
    }

    const user = (() => {
      try {
        const raw = localStorage.getItem('userInfo');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (!user?.refresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failQueue.push({ resolve, reject, config: originalRequest });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await axios.post(
        '/api/users/token/refresh/',
        { refresh: user.refresh },
        { headers: { 'Content-Type': 'application/json' } }
      );
      const next = {
        ...user,
        access: data.access,
        ...(data.refresh ? { refresh: data.refresh } : {}),
      };
      localStorage.setItem('userInfo', JSON.stringify(next));
      store.dispatch({ type: USER_LOGIN_SUCCESS, payload: next });
      isRefreshing = false;
      flushQueue(null);
      delete originalRequest.headers.Authorization;
      return apiClient(originalRequest);
    } catch (refreshError) {
      isRefreshing = false;
      flushQueue(refreshError);
      localStorage.removeItem('userInfo');
      store.dispatch({ type: USER_LOGOUT });
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
