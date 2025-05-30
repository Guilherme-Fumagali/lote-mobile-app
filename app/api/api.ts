import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://192.168.31.2:6933',
});

export const getAllLotes = async () => {
    const response = await api.get('/lotes');
    return response.data;
};

export const deleteLote = async (codigo: string): Promise<void> => {
    await api.delete(`/lotes/${codigo}`);
};
