import api from "../api/api.js";
import { Documento } from "../models/estudios/documento.js";

const BASE_URL = "/core-service/documentos";

export const createDocumento = async (documento) => {
  const response = await api.post(`${BASE_URL}`, documento);
  return Documento(response.data);
};

export const getDocumentosByInforme = async (idInforme) => {
  const response = await api.get(`${BASE_URL}/informe/${idInforme}`);
  return response.data.map((doc) => Documento(doc));
};
