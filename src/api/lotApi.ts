import apiClient from './axiosConfig';

export const fetchLotsForAuction = async (auctionId: number, page?: number, perPage?: number) => {
    const top = perPage ?? 10;
    const skip = ((page ?? 1) - 1) * top;
    const response = await apiClient.get(`/Auction/Lots/${auctionId}?top=${top}&skip=${(skip)}`);
    return response.data.data.lots;
};

export const fetchLotById = async (lotId: number) => {
    const response = await apiClient.get(`/Auction/lot/${lotId}`);
    return response.data.data;
};
