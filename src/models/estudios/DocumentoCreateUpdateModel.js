export const DocumentoCreateUpdateModel = (data = {}) => ({
  idPaciente: data.idPaciente ?? "",
  idProfesional: data.idProfesional ?? "",
  idInforme: data.idInforme ?? "",
  idAnalisis: data.idAnalisis ?? "",
  storageUri: data.storageUri ?? "",
  storageKey: data.storageKey ?? "",
  nombreDocumento: data.nombreDocumento ?? "",
  mimeType: data.mimeType ?? "",
  tamanoBytes: data.tamanoBytes ?? "",
  hashSha256: data.hashSha256 ?? "",
  version: data.version ?? "",
  fechaDocumento: data.fechaDocumento ?? "",
});
