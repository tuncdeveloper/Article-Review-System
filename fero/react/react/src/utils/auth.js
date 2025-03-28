import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

export const setAuthHeader = (username, password) => {
    const basicAuth = 'Basic ' + btoa(`${username}:${password}`);
    axios.defaults.headers.common['Authorization'] = basicAuth;
};

export const removeAuthHeader = () => {
    delete axios.defaults.headers.common['Authorization'];
};