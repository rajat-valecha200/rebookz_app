import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

export const SERVER_URL = 'http://192.168.29.86:5001';
export const API_URL = `${SERVER_URL}/api`;

// Legacy support if BASE_URL implied API
export const BASE_URL = API_URL;

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to add the auth token
api.interceptors.request.use(
    async (config: any) => {
        try {
            const userInfo = await SecureStore.getItemAsync('userInfo');
            if (userInfo) {
                const { token } = JSON.parse(userInfo);
                if (token && config.headers) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
        } catch (error) {
            console.error('Error reading token', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
