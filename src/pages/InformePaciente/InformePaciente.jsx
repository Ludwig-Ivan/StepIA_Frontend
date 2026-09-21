import { Controller } from "react-hook-form";
import { Alert, Collapse } from "@mui/material";
import "./InformePaciente.css";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import useInformePaciente from "./useInformePaciente";
import CampoTextareaInforme from "./components/CampoTextareaInforme.jsx";
import PanelAnalisisIA from "./components/PanelAnalisisIA.jsx";
import OtrosEstudiosInforme from "./components/OtrosEstudiosInforme.jsx";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import { useCallback, useEffect, useState } from "react";
import { obtenerByEmail } from "../../services/profesionalService.js";

const CAMPOS_TEXTO = [
  {
    name: "estadoGeneral",
    id: "informe-estado-general",
    label: "Estado General",
    rows: 3,
  },
  {
    name: "observaciones",
    id: "informe-observaciones",
    label: "Observaciones Manuales",
    rows: 4,
  },
  {
    name: "diagnostico",
    id: "informe-diagnostico",
    label: "Diagnóstico",
    rows: 4,
  },
  { name: "sintomas", id: "informe-sintomas", label: "Síntomas", rows: 4 },
  {
    name: "tratamiento",
    id: "informe-tratamiento",
    label: "Tratamiento",
    rows: 4,
  },
  {
    name: "evolucion",
    id: "informe-evolucion",
    label: "Evoluciones",
    rows: 4,
  },
];

function InformePaciente() {
  const {
    navigate,
    informeRef,
    paciente,
    analisisPieIzq,
    analisisPieDer,
    imgPieIzq64,
    imgPieDer64,
    estudios,
    cargando,
    carga,
    errorGeneral,
    mensajeIA,
    mensajeEstudios,
    confirmaEliminarId,
    setConfirmaEliminarId,
    descargando,
    control,
    errors,
    isSubmitting,
    cargarImagen,
    analizarDesdeInforme,
    subirOtroEstudio,
    eliminarEstudio,
    verEstudio,
    manejarSubmit,
    descargarPDF,
  } = useInformePaciente();

  const emailUsuario = localStorage.getItem("UsuarioActivo");
  const [cargandoUser, setCargandoUser] = useState(true);
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
      setCargandoUser(false);
    }
  }, [emailUsuario, navigate]);

  const reintentar = () => {
    setError("");
    setCargandoUser(true);
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
        if (activo) setCargandoUser(false);
      });

    return () => {
      activo = false;
    };
  }, [emailUsuario, navigate]);

  if (carga)
    return (
      <div className="loading-screen" role="status" aria-live="polite">
        <div className="loading-spinner" aria-hidden="true" />
        <h2>Cargando…</h2>
        <p>Obteniendo información del paciente</p>
      </div>
    );

  if (cargandoUser) {
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
    <div className="informe-page" ref={informeRef}>
      <HeaderComponent data={{ usuario }} />

      <main className="informe-main">
        <div className="informe-top">
          <div className="informe-titulo">
            <h3>Informe de paciente</h3>
            {paciente && (
              <p>
                {paciente.nombre} {paciente.apellidoPaterno}{" "}
                {paciente.apellidoMaterno}
              </p>
            )}
          </div>

          <input
            className="fecha-input"
            type="text"
            name="fecha"
            placeholder="Fecha"
            disabled
            aria-label="Fecha de generación del informe"
            defaultValue={new Date().toDateString()}
          />
        </div>

        <form
          id="formInforme"
          className="informe-card"
          noValidate
          onSubmit={manejarSubmit}
        >
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

          <div className="datos-basicos">
            <Controller
              name="nombre"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "informe-nombre",
                    name: "nombre",
                    label: "Nombre del Paciente",
                    placeholder: "Nombre del Paciente",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    type: "text",
                    error: errors.nombre?.message,
                  }}
                  containerStyle={{ maxWidth: "400px" }}
                />
              )}
            />

            <Controller
              name="peso"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "informe-peso",
                    name: "pesoKg",
                    label: "Peso",
                    placeholder: "Peso",
                    type: "number",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    error: errors.peso?.message,
                    inputProps: { min: 0, max: 500, step: 0.1 },
                  }}
                  containerStyle={{ maxWidth: "150px" }}
                />
              )}
            />
          </div>

          {CAMPOS_TEXTO.map((campo) => (
            <CampoTextareaInforme
              key={campo.name}
              control={control}
              name={campo.name}
              id={campo.id}
              label={campo.label}
              rows={campo.rows}
              error={errors[campo.name]?.message}
            />
          ))}

          <PanelAnalisisIA
            control={control}
            imgPieIzq64={imgPieIzq64}
            imgPieDer64={imgPieDer64}
            analisisPieIzq={analisisPieIzq}
            analisisPieDer={analisisPieDer}
            mensajeIA={mensajeIA}
            cargando={cargando}
            onCargarImagen={cargarImagen}
            onAnalizar={analizarDesdeInforme}
          />

          <OtrosEstudiosInforme
            estudios={estudios}
            mensajeEstudios={mensajeEstudios}
            confirmaEliminarId={confirmaEliminarId}
            onSubir={subirOtroEstudio}
            onVer={verEstudio}
            onEliminar={eliminarEstudio}
            onSolicitarEliminar={setConfirmaEliminarId}
          />

          <div className="proxima-consulta">
            <h4>Próxima consulta</h4>
            <p>Selecciona la fecha y hora de la siguiente cita del paciente.</p>

            <div className="proxima-consulta-grid">
              <Controller
                name="proximaFechaConsulta"
                control={control}
                render={({ field }) => (
                  <InputComponent
                    config={{
                      id: "informe-proxima-fecha",
                      name: "proximaFechaConsulta",
                      label: "Fecha de la próxima consulta",
                      type: "date",
                      value: field.value,
                      func: field.onChange,
                      onBlur: field.onBlur,
                    }}
                    containerStyle={{ maxWidth: "none" }}
                  />
                )}
              />
              <Controller
                name="proximaHoraConsulta"
                control={control}
                render={({ field }) => (
                  <InputComponent
                    config={{
                      id: "informe-proxima-hora",
                      name: "proximaHoraConsulta",
                      label: "Hora de la próxima consulta",
                      type: "time",
                      value: field.value,
                      func: field.onChange,
                      onBlur: field.onBlur,
                    }}
                    containerStyle={{ maxWidth: "none" }}
                  />
                )}
              />
            </div>
          </div>
        </form>

        <div className="informe-buttons">
          <ButtonComponent
            config={{
              name: "cerrar",
              text: "Cerrar",
              type: "button",
              variant: "blue",
              disabled: isSubmitting || descargando,
            }}
            onClick={() => navigate("/menu")}
          />
          <div>
            <ButtonComponent
              config={{
                name: "guardar",
                text: "Guardar",
                type: "submit",
                variant: "green",
                loading: isSubmitting,
                loadingText: "Guardando…",
                disabled: descargando,
              }}
              form="formInforme"
            />
            <ButtonComponent
              config={{
                name: "pdf",
                text: "PDF",
                type: "button",
                variant: "purple",
                loading: descargando,
                loadingText: "Generando…",
                disabled: isSubmitting,
              }}
              onClick={descargarPDF}
            />
          </div>
        </div>

        <span className="sr-only" aria-live="polite">
          {isSubmitting ? "Guardando informe" : ""}
        </span>
      </main>
    </div>
  );
}

export default InformePaciente;
