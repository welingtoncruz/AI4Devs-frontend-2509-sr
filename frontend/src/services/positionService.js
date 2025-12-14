import axios from 'axios';

const API_BASE_URL = 'http://localhost:3010';

export const getPositionInterviewFlow = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/position/${positionId}/interviewflow`);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener el flujo de entrevistas:', error.response?.data);
    }
};

export const getPositionCandidates = async (positionId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/position/${positionId}/candidates`);
        return response.data;
    } catch (error) {
        throw new Error('Error al obtener los candidatos:', error.response?.data);
    }
};

