import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";
import { ejecutarServicio } from "../utils/errores.js";

export const GenerateUploadUrl = (documentId, filename, contentType) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.R2.GENERATE_UPLOAD_URL, {
        documentId,
        filename,
        contentType,
      });
      return response.data;
    },
    "No se pudo generar la URL de subida",
  );

export const CompleteUpload = (idDocument, storageKey) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(
        ENDPOINTS.R2.COMPLETE_UPLOAD(idDocument),
        null,
        {
          params: { storageKey },
        },
      );
      return response.data;
    },
    "No se pudo completar la subida",
  );

export const GeneratedDownloadUrl = (storageKey) =>
  ejecutarServicio(
    async () => {
      const response = await api.post(ENDPOINTS.R2.GENERATE_DOWNLOAD_URL, {
        storageKey,
      });
      return response.data;
    },
    "No se pudo generar la URL de descarga",
  );

export const UploadFile = (uploadUrl, archivo) =>
  ejecutarServicio(
    async () => {
      const response = await fetch(uploadUrl, {
        method: "PUT",
        body: archivo,
        headers: {
          "Content-Type": archivo.type,
        },
      });

      if (!response.ok) {
        throw new Error(`Error al subir archivo: ${response.status}`);
      }

      return true;
    },
    "No se pudo subir el archivo",
  );
