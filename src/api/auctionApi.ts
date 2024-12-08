import apiClient from './axiosConfig';

export const fetchLiveAuctions = async () => {
    const response = await apiClient.get('/Auction/Upcomming');
    return response.data.data;
};

export const fetchPastAuctions = async () => {
    const response = await apiClient.get('/Auction/Past');
    return response.data.data;
};
