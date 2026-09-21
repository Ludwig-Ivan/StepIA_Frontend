import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./RegistroPaciente.css";
import { PacienteCreateModel } from "../../models/pacientes/pacienteCreateModel.js";
import { registrarActividad } from "../../utils/historial";
import { createPaciente } from "../../services/pacienteService.js";
import { PacienteSchema } from "../../schema/PacienteSchema.js";
import { obtenerByEmail } from "../../services/profesionalService.js";
import CURP_REGEX from "../../schema/ExpReg.js";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import CAMPOS_REGISTRO_PACIENTES from "../../data/Campos.js";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";

const formularioPacienteSchema = PacienteSchema.extend({
  curp: z
    .string()
    .trim()
    .toUpperCase()
    .max(20, "La CURP no puede superar los 20 caracteres")
    .regex(CURP_REGEX, "La CURP no es válida"),
  nombre: z
    .string()
    .trim()
    .min(1, "El nombre es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  apellidoPaterno: z
    .string()
    .trim()
    .min(1, "El apellido paterno es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  apellidoMaterno: z
    .string()
    .trim()
    .min(1, "El apellido materno es obligatorio")
    .max(100, "Máximo 100 caracteres"),
  sexo: z.enum(["MASCULINO", "FEMENINO", "INTERSEXUAL", "NO_ESPECIFICADO"], {
    error: "Selecciona una opción",
  }),
  fechaNacimiento: z.iso.date({
    error: "Ingresa una fecha de nacimiento válida",
  }),
  telefono: z.e164({
    error: "Formato internacional, ej. +529876541553",
  }),
});

const SECCIONES_FORMULARIO = [
  {
    titulo: "Datos generales",
    descripcion: "Identidad y datos demográficos del paciente.",
    campos: [
      "nombre",
      "apellidoPaterno",
      "apellidoMaterno",
      "sexo",
      "fechaNacimiento",
      "curp",
    ],
  },
  {
    titulo: "Contacto",
    descripcion: "Medios para contactar al paciente.",
    campos: ["telefono", "domicilio"],
  },
];

function RegistroPaciente() {
  const navigate = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState("");
  const emailUsuario = localStorage.getItem("UsuarioActivo");
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [usuario, setUsuario] = useState(null);

  const cargarDoctor = useCallback(async () => {
    if (!emailUsuario) {
      navigate("/");
      return;
    }

    try {
      const doctor = await obtenerByEmail(emailUsuario);
      setUsuario(doctor);
    } catch {
      setError(
        "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
      );
    } finally {
      setCargando(false);
    }
  }, [emailUsuario, navigate]);

  const reintentar = () => {
    setError("");
    setCargando(true);
    cargarDoctor();
  };

  useEffect(() => {
    if (!emailUsuario) {
      navigate("/");
      return;
    }

    let activo = true;

    obtenerByEmail(emailUsuario)
      .then((doctor) => {
        if (activo) setUsuario(doctor);
      })
      .catch(() => {
        if (activo)
          setError(
            "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
          );
      })
      .finally(() => {
        if (activo) setCargando(false);
      });

    return () => {
      activo = false;
    };
  }, [emailUsuario, navigate]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(formularioPacienteSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: PacienteCreateModel(),
  });

  const registrarPaciente = async (data) => {
    setErrorGeneral("");
    try {
      await createPaciente(data);
      localStorage.setItem("idPaciente", data.curp);

      registrarActividad({
        tipo: "Registro de paciente",
        descripcion: "Se capturaron los datos generales del paciente",
        paciente: `${data.nombre} ${data.apellidoPaterno} ${data.apellidoMaterno}`,
        detalles: `CURP: ${data.curp}`,
      });

      navigate("/expediente");
    } catch (error) {
      setErrorGeneral(
        error?.message ||
          "No se pudo crear el paciente. Verifica tu conexión e inténtalo de nuevo.",
      );
    }
  };

  const limpiarFormulario = () => {
    reset(PacienteCreateModel());
    setErrorGeneral("");
  };

  if (cargando) {
    return (
      <div className="menu-page">
        <header className="top-menu" aria-hidden="true">
          <div className="top-menu-left">
            <div className="skeleton skeleton-logo" />
            <div className="skeleton skeleton-chip" />
          </div>
          <div className="top-menu-right">
            <div className="skeleton skeleton-chip" />
            <div className="skeleton skeleton-avatar" />
          </div>
        </header>

        <main className="menu-overlay" role="status">
          <div className="menu-skeleton-card">
            <div className="skeleton skeleton-stepai" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line skeleton-line--short" />
            <div className="skeleton skeleton-option" />
            <div className="skeleton skeleton-option" />
            <div className="skeleton skeleton-option" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="menu-page">
        <main className="menu-overlay" role="alert">
          <div className="menu-error-card">
            <h1>No se pudo cargar el panel</h1>
            <p>{error}</p>
            <button
              type="button"
              className="btn btn-green"
              onClick={reintentar}
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="registro-page">
      <HeaderComponent data={{ usuario }} />

      <main className="registro-main">
        <form
          className="registro-card"
          noValidate
          onSubmit={handleSubmit(registrarPaciente)}
        >
          <div className="registro-progress" aria-hidden="true">
            <span>Paso 1 de 3 · Datos generales</span>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
          </div>

          <div className="registro-heading">
            <h1>Registrar paciente</h1>
            <p>
              Captura los datos generales para iniciar el expediente clínico.
            </p>
          </div>

          <Collapse in={Boolean(errorGeneral)}>
            <Alert
              variant="filled"
              severity="error"
              role="alert"
              sx={{ my: 2, fontWeight: 600, borderRadius: 1.5 }}
            >
              {errorGeneral}
            </Alert>
          </Collapse>

          {SECCIONES_FORMULARIO.map((seccion) => (
            <section
              className="registro-seccion"
              key={seccion.titulo}
              aria-label={seccion.titulo}
            >
              <h2 className="registro-seccion-titulo">{seccion.titulo}</h2>
              <p className="registro-seccion-descripcion">
                {seccion.descripcion}
              </p>

              <div className="registro-grid">
                {seccion.campos.map((key) => {
                  const campo = CAMPOS_REGISTRO_PACIENTES.find(
                    (c) => c.key === key,
                  );
                  return (
                    <Controller
                      key={key}
                      name={key}
                      control={control}
                      render={({ field }) => (
                        <div
                          className={`registro-campo${
                            key === "domicilio" ? " registro-campo--ancho" : ""
                          }`}
                        >
                          <InputComponent
                            config={{
                              id: `registro-${key}`,
                              ...campo.config,
                              value: field.value,
                              func: (event) => {
                                const valor =
                                  key === "curp"
                                    ? event.target.value.toUpperCase()
                                    : event.target.value;
                                field.onChange(valor);
                              },
                              onBlur: field.onBlur,
                              error: errors[key]?.message,
                              inputProps:
                                key === "curp" ? { maxLength: 18 } : undefined,
                            }}
                          />
                        </div>
                      )}
                    />
                  );
                })}
              </div>
            </section>
          ))}

          <div className="registro-buttons">
            <ButtonComponent
              config={{
                name: "volver",
                text: "Volver",
                variant: "white",
                type: "button",
                disabled: isSubmitting,
              }}
              onClick={() => navigate("/menu")}
            />

            <ButtonComponent
              config={{
                name: "limpiar",
                text: "Limpiar",
                variant: "blue",
                type: "button",
                disabled: isSubmitting,
              }}
              onClick={limpiarFormulario}
            />

            <ButtonComponent
              config={{
                name: "siguiente",
                text: "Registrar paciente",
                variant: "green",
                type: "submit",
                loading: isSubmitting,
                loadingText: "Registrando…",
              }}
            />
          </div>

          <span className="sr-only" aria-live="polite">
            {isSubmitting ? "Registrando paciente" : ""}
          </span>
        </form>
      </main>
    </div>
  );
}

export default RegistroPaciente;
