import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

export const generateProposal = (formData) => API.post("/generate", formData);

export const downloadProposal = (id) =>
  API.get(`/proposal/${id}/pdf`, { responseType: "blob" });