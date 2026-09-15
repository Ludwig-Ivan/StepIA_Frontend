import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Documento } from "../models/estudios/documento.js";

export const createDocumento = async (documento) => {
  const response = await api.post(ENDPOINTS.DOCUMENTS.CREATE, documento);
  return Documento(response.data);
};

export const getDocumentosByInforme = async (idInforme) => {
  const response = await api.get(ENDPOINTS.DOCUMENTS.GET_BY_INFORME(idInforme));
  return response.data.map((doc) => Documento(doc));
};
