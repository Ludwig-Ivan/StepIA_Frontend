import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Analisis } from "../models/analisis/analisis.js";

export const createAnalisis = async (analisis) => {
  const response = await api.post(ENDPOINTS.ANALISIS.CREATE, analisis);
  return Analisis(response.data);
};

export const getAnalisisByInforme = async (idInforme) => {
  const response = await api.get(ENDPOINTS.ANALISIS.GET_BY_INFORME(idInforme));
  return response.data.map((analisis) => Analisis(analisis));
};
