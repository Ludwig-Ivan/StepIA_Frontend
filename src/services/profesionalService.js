import api from "../api/api.js";
import { Profesional } from "../models/profesionales/profesional.js";

const BASE_URL = "/core-service/profesionales";
export const obtenerByEmail = async (email) => {
  const response = await api.get(`${BASE_URL}/email/${email}`);
  return Profesional(response.data);
};
