// const HOST = "https://api-gateway-255553194796.northamerica-south1.run.app";
const HOST = "http://localhost:8080";

const BASE_URL = {
  PROFESIONALES: `${HOST}/api/core-service/profesionales`,
  PACIENTES: `${HOST}/api/core-service/pacientes`,
  EXPEDIENTE: `${HOST}/api/core-service/expedientes`,
  INFORME: `${HOST}/api/core-service/informes`,
  ANALISIS: `${HOST}/api/core-service/analisis`,
  DOCUMENTS: `${HOST}/api/core-service/documentos`,
  R2: `${HOST}/api/document-service/documents`,
  IA: `${HOST}/api/ia-service`,
};

export const ENDPOINTS = {
  PROFESIONALES: {
    GET_BY_ID: (email) => `${BASE_URL.PROFESIONALES}/email/${email}`,
  },
  PACIENTES: {
    CREATE: BASE_URL.PACIENTES,
    GET_BY_ID: (id) => `${BASE_URL.PACIENTES}/${id}`,
    GET_ALL: (searchTerm, page, limit) =>
      `${BASE_URL.PACIENTES}?search=${searchTerm}&page=${page}&limit=${limit}`,
  },
  EXPEDIENTE: {
    CREATE: BASE_URL.EXPEDIENTE,
  },
  INFORME: {
    CREATE: BASE_URL.INFORME,
    GET_BY_PACIENTE: (idPaciente, page, size) =>
      `${BASE_URL.INFORME}/paciente?idPaciente=${idPaciente}&page=${page}&size=${size}`,
  },
  ANALISIS: {
    CREATE: BASE_URL.ANALISIS,
    GET_BY_INFORME: (idInforme) => `${BASE_URL.ANALISIS}/informe/${idInforme}`,
  },
  DOCUMENTS: {
    CREATE: BASE_URL.DOCUMENTS,
    GET_BY_INFORME: (idInforme) => `${BASE_URL.DOCUMENTS}/informe/${idInforme}`,
  },
  R2: {
    GENERATE_UPLOAD_URL: `${BASE_URL.R2}/upload-url`,
    COMPLETE_UPLOAD: (idDocument) => `${BASE_URL.R2}/${idDocument}/complete`,
    GENERATE_DOWNLOAD_URL: `${BASE_URL.R2}/download-url`,
  },
  IA: {
    CREATE_PREDICT: `${BASE_URL.IA}/predict`,
  },
};
