import apiClient from './axiosConfig';

export const fetchLotsForAuction = async (auctionId: number) => {
    const response = await apiClient.get(`/Auction/Lots/${auctionId}`);
    return response.data.data.lots;
};

export const fetchLotById = async (lotId: number) => {
    const response = await apiClient.get(`/Auction/lot/${lotId}`);
    return response.data.data;
};
