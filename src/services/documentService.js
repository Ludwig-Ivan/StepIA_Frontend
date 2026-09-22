import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { Documento } from "../models/estudios/documento.js";
import { ejecutarServicio } from "../utils/errores.js";

export const createDocumento = (documento) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.DOCUMENTS.CREATE, documento);
      return Documento(response.data);
    },
    "No se pudo crear el documento",
  );

export const getDocumentosByInforme = (idInforme) =>
  ejecutarServicio(
    async () => {
      const response = await api.get(
        ENDPOINTS.DOCUMENTS.GET_BY_INFORME(idInforme),
      );
      return response.data.map((doc) => Documento(doc));
    },
    "No se pudieron obtener los documentos del informe",
  );
