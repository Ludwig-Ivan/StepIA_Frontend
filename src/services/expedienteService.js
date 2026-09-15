import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Expediente } from "../models/expedientes/expediente.js";

export const createExpediente = async (expediente) => {
  const response = await api.post(ENDPOINTS.EXPEDIENTE.CREATE, expediente);
  return Expediente(response.data);
};
