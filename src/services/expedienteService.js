import api from "../api/api.js";
import { Expediente } from "../models/expedientes/expediente.js";

const BASE_URL = "/core-service/expedientes";

export const createExpediente = async (expediente) => {
  const response = await api.post(BASE_URL, expediente);
  return Expediente(response.data);
};
