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
      helperText: "18 caracteres, se captura en mayúsculas",
      autoComplete: "off",
    },
  },
  {
    key: "fechaNacimiento",
    config: {
      label: "Fecha Nacimiento",
      name: "fechaNacimiento",
      type: "date",
      placeholder: "Fecha Nacimiento",
      autoComplete: "bday",
    },
  },
  {
    key: "sexo",
    config: {
      label: "Sexo",
      name: "sexo",
      type: "select",
      placeholder: "Selecciona una opción",
      options: [
        { value: "MASCULINO", label: "Masculino" },
        { value: "FEMENINO", label: "Femenino" },
        { value: "INTERSEXUAL", label: "Intersexual" },
        { value: "NO_ESPECIFICADO", label: "No especificado" },
      ],
      autoComplete: "sex",
    },
  },
  {
    key: "telefono",
    config: {
      label: "Teléfono",
      name: "telefono",
      type: "tel",
      placeholder: "Teléfono",
      helperText: "Formato internacional, ej. +52 987 654 15 53",
      autoComplete: "tel",
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
