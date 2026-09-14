import api from "../api/api.js";

const BASE_URL = "/document-service/documents";

export const GenerateUploadUrl = async (documentId, filename, contentType) => {
  const response = await api.post(`${BASE_URL}/upload-url`, {
    documentId,
    filename,
    contentType,
  });
  return response.data;
};

export const CompleteUpload = async (idDocument, storageKey) => {
  const response = await api.post(`${BASE_URL}/${idDocument}/complete`, null, {
    params: { storageKey },
  });
  return response.data;
};

export const GeneratedDownloadUrl = async (storageKey) => {
  const response = await api.post(`${BASE_URL}/download-url`, { storageKey });
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
