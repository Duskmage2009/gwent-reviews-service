import axios from 'axios';
import { CardResponse } from '../types';

const SPRING_BOOT_API_URL = process.env.SPRING_BOOT_API_URL || 'http://localhost:8080/api';

class CardService {
    async validateCardExists(cardId: number): Promise<boolean> {
        try {
            const response = await axios.get<CardResponse>(
                `${SPRING_BOOT_API_URL}/cards/${cardId}`,
                { timeout: 5000 }
            );
            return response.status === 200 && response.data.id === cardId;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response?.status === 404) {
                    return false;
                }
                throw new Error(`Failed to validate card: ${error.message}`);
            }
            throw error;
        }
    }

    async getCard(cardId: number): Promise<CardResponse | null> {
        try {
            const response = await axios.get<CardResponse>(
                `${SPRING_BOOT_API_URL}/cards/${cardId}`,
                { timeout: 5000 }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error) && error.response?.status === 404) {
                return null;
            }
            throw error;
        }
    }
}

export default new CardService();