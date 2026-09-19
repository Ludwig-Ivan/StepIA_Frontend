const CAMPOS_REGISTRO_PACIENTE = [
  {
    key: "nombre",
    config: {
      label: "Nombre Paciente",
      name: "nombre",
      type: "text",
      placeholder: "Nombre Paciente",
    },
  },
  {
    key: "apellidoPaterno",
    config: {
      label: "Apellido Paterno",
      name: "apellidoPaterno",
      type: "text",
      placeholder: "Apellido Paterno",
    },
  },
  {
    key: "apellidoMaterno",
    config: {
      label: "Apellido Materno",
      name: "apellidoMaterno",
      type: "text",
      placeholder: "Apellido Materno",
    },
  },
  {
    key: "curp",
    config: {
      label: "CURP",
      name: "curp",
      type: "text",
      placeholder: "CURP",
    },
  },
  {
    key: "fechaNacimiento",
    config: {
      label: "Fecha Nacimiento",
      name: "fechaNacimiento",
      type: "date",
      placeholder: "Fecha Nacimiento",
    },
  },
  {
    key: "sexo",
    config: {
      label: "Sexo",
      name: "sexo",
      type: "text",
      placeholder: "Sexo",
    },
  },
  {
    key: "telefono",
    config: {
      label: "Teléfono",
      name: "telefono",
      type: "text",
      placeholder: "Teléfono",
    },
  },
  {
    key: "domicilio",
    config: {
      label: "Domicilio",
      name: "domicilio",
      type: "text",
      placeholder: "Domicilio",
    },
  },
];

export default CAMPOS_REGISTRO_PACIENTE;
