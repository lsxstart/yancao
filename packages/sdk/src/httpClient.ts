import axios from "axios";

export const httpClient = axios.create({
  baseURL: "/api",
  timeout: 10000
});

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("YANCAO_TOKEN");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
