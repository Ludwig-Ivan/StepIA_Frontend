import api from "../api/api.js";
import { ENDPOINTS } from "../config/endpoints.js";

export const GenerateUploadUrl = async (documentId, filename, contentType) => {
  const response = await api.post(ENDPOINTS.R2.GENERATE_UPLOAD_URL, {
    documentId,
    filename,
    contentType,
  });
  return response.data;
};

export const CompleteUpload = async (idDocument, storageKey) => {
  const response = await api.post(
    ENDPOINTS.R2.COMPLETE_UPLOAD(idDocument),
    null,
    {
      params: { storageKey },
    },
  );
  return response.data;
};

export const GeneratedDownloadUrl = async (storageKey) => {
  const response = await api.post(ENDPOINTS.R2.GENERATE_DOWNLOAD_URL, {
    storageKey,
  });
  return response.data;
};

export const UploadFile = async (uploadUrl, archivo) => {
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
};
