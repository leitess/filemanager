import axios from 'axios';

const envType = import.meta.env.APP_MODE === 'test';
console.log(envType);
const apiUrl = envType ? '' : import.meta.env.APP_API_URL!;
const api = axios.create({
  baseURL: apiUrl,
});

export { api };
