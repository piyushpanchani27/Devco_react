import axios from 'axios';
import {getDefaultStore} from 'jotai';
import {tokenAtom} from '../atoms/authAtoms';

const BASE_URL = 'https://devco.elulastage.space/api';

const apiClient = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Jotai store for accessing token atom
const store = getDefaultStore();

// Add request interceptor to inject the token
apiClient.interceptors.request.use(
    (config) => {
        const token = store.get(tokenAtom); // Get token from Jotai
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;
