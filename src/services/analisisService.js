import api from "../api/api.js";
import { Analisis } from "../models/analisis/analisis.js";

const BASE_URL = "/core-service/analisis";

export const createAnalisis = async (analisis) => {
  const response = await api.post(BASE_URL, analisis);
  return Analisis(response.data);
};

export const getAnalisisByInforme = async (idInforme) => {
  const response = await api.get(`${BASE_URL}/informe/${idInforme}`);
  return response.data.map((analisis) => Analisis(analisis));
};
