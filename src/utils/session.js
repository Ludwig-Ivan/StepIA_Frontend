const CLAVES = {
  USUARIO: "UsuarioActivo",
  PROFESIONAL: "idProfesional",
  PACIENTE: "idPaciente",
};

const CLAVES_PII = [
  "pacienteSeleccionado",
  "pacienteActual",
  "datosMedicosActual",
  "resultadoAnalisisPlantar",
];

export const guardarSesion = (profesional) => {
  if (!profesional) {
    return;
  }

  localStorage.setItem(CLAVES.USUARIO, profesional.email || "");
  localStorage.setItem(
    CLAVES.PROFESIONAL,
    String(profesional.idProfesional ?? ""),
  );
};

export const obtenerUsuarioActivo = () => {
  const usuario = localStorage.getItem(CLAVES.USUARIO);
  return usuario || "";
};

export const obtenerIdProfesional = () => {
  const id = localStorage.getItem(CLAVES.PROFESIONAL);
  return id || "";
};

export const obtenerIdPaciente = () => {
  const id = localStorage.getItem(CLAVES.PACIENTE);
  return id || "";
};

export const guardarIdPaciente = (idPaciente) => {
  if (idPaciente === null || idPaciente === undefined) {
    return;
  }

  localStorage.setItem(CLAVES.PACIENTE, idPaciente);
};

export const haySesionActiva = () =>
  Boolean(localStorage.getItem(CLAVES.USUARIO));

export const cerrarSesion = () => {
  [...Object.values(CLAVES), ...CLAVES_PII].forEach((clave) => {
    localStorage.removeItem(clave);
  });
};
