import apiClient from './axiosConfig';

export const login = async (username: string, password: string, deviceName: string) => {
    const response = await apiClient.post('/login', {
        username,
        password,
        device_name: deviceName,
    });
    return response.data.token;
};
