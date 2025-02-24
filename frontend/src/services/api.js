import axios from 'axios';

const api = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'  // Usa a variável de ambiente ou o valor padrão
});

export default api;
