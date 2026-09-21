import { AnalisisCreateModel } from "../models/analisis/AnalisisCreateModel.js";
import { createAnalisis } from "../services/analisisService.js";
import {
  CompleteUpload,
  GenerateUploadUrl,
  UploadFile,
} from "../services/documentCloudService.js";
import { createDocumento } from "../services/documentService.js";

export const calcularSHA256 = async (archivo) => {
  const buffer = await archivo.arrayBuffer();
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);

  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return hashHex;
};

export const subirDocumentos = async ({
  paciente,
  idProfesional,
  file,
  idInforme,
  idAnalisis = null,
}) => {
  const { storageKey, uploadUrl } = await GenerateUploadUrl(
    paciente.curp,
    file.name,
    file.type,
  );

  await UploadFile(uploadUrl, file);

  await CompleteUpload(paciente.curp, storageKey);

  const hash = await calcularSHA256(file);

  await createDocumento({
    idPaciente: paciente.curp,
    idProfesional,
    idInforme,
    idAnalisis,
    storageUri: uploadUrl,
    storageKey,
    nombreDocumento: file.name,
    mimeType: file.type,
    tamanoBytes: file.size,
    hashSha256: hash,
    version: 1,
    fechaDocumento: new Date(file.lastModified).toISOString(),
  });
};

export const registrarAnalisisConDocumentos = async ({
  idInforme,
  idPaciente,
  idProfesional,
  pieType,
  analisis,
  file,
}) => {
  const { idAnalisis } = await createAnalisis(
    AnalisisCreateModel({
      idInforme: idInforme,
      pieType: pieType,
      className: analisis.className,
      confidence: analisis.confidence,
    }),
  );

  await subirDocumentos({
    paciente: { curp: idPaciente },
    idProfesional,
    file,
    idInforme,
    idAnalisis,
  });

  return idAnalisis;
};