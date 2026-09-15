import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Profesional } from "../models/profesionales/profesional.js";

export const obtenerByEmail = async (email) => {
  const response = await api.get(ENDPOINTS.PROFESIONALES.GET_BY_ID(email));
  return Profesional(response.data);
};
