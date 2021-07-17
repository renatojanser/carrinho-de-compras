import axios from 'axios';

export const api = axios.create({
  // baseURL: 'http://localhost:8000',
  baseURL: 'https://5d6da1df777f670014036125.mockapi.io/api/v1',
});
