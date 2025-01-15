import api from './api';

export async function fetchRecipes(token) {
    try {
        const response = await api.get('api/recipes', {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
    } catch (err) {
        throw new Error('Error loading recipes');
    }
}

// Função para deletar uma receita
export async function deleteRecipe(itemId, token) {
    try {
        await api.delete(`api/recipes/${itemId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
    } catch (err) {
        throw new Error('Error deleting recipe');
    }
}