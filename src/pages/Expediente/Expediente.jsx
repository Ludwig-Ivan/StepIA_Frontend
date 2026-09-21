import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Expediente.css";

import { createExpediente } from "../../services/expedienteService.js";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import InputComponent from "../../components/inputs/InputComponent.jsx";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import { obtenerByEmail } from "../../services/profesionalService.js";

const expedienteFormSchema = z.object({
  antecedentes: z.string().trim().max(255, "Máximo 255 caracteres"),
});

function Expediente() {
  const navigate = useNavigate();
  const idPaciente = localStorage.getItem("idPaciente");
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
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(expedienteFormSchema),
    mode: "onTouched",
    reValidateMode: "onChange",
    defaultValues: { antecedentes: "" },
  });

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

  if (!idPaciente) {
    return (
      <div className="expediente-page">
        <HeaderComponent data={{ usuario }} />

        <main className="expediente-main">
          <section className="expediente-card expediente-card--vacio">
            <div className="expediente-heading">
              <h1>No hay paciente seleccionado</h1>
              <p>
                Primero registra al paciente para poder capturar su expediente
                clínico.
              </p>
            </div>

            <ButtonComponent
              config={{
                name: "ir-registro",
                text: "Registrar paciente",
                variant: "green",
                type: "button",
              }}
              onClick={() => navigate("/registro-paciente", { replace: true })}
            />
          </section>
        </main>
      </div>
    );
  }

  const guardarExpediente = async (data) => {
    setErrorGeneral("");
    try {
      await createExpediente({
        antecedentes: data.antecedentes,
        idPaciente: idPaciente,
        numeroExpediente: "EXP-" + idPaciente,
        estado: "ACTIVO",
      });

      navigate("/informe-paciente");
    } catch (error) {
      setErrorGeneral(
        error?.message ||
          "No se pudo guardar el expediente. Verifica tu conexión e inténtalo de nuevo.",
      );
    }
  };

  return (
    <div className="expediente-page">
      <HeaderComponent data={{ usuario }} />
      <main className="expediente-main">
        <form
          className="expediente-card"
          noValidate
          onSubmit={handleSubmit(guardarExpediente)}
        >
          <div className="expediente-progress" aria-hidden="true">
            <span>Paso 2 de 3 · Antecedentes</span>
            <div className="progress-track">
              <div className="progress-fill" />
            </div>
          </div>

          <div className="expediente-heading">
            <h1>Expediente clínico</h1>
            <p>
              Captura los antecedentes del paciente antes de continuar con el
              informe.
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

          <div className="expediente-form">
            <Controller
              name="antecedentes"
              control={control}
              render={({ field }) => (
                <div className="expediente-campo">
                  <InputComponent
                    config={{
                      id: "expediente-antecedentes",
                      label: "Antecedentes",
                      name: "antecedentes",
                      placeholder: "Antecedentes del paciente",
                      type: "text",
                      value: field.value,
                      func: field.onChange,
                      onBlur: field.onBlur,
                      error: errors.antecedentes?.message,
                      helperText: "Máximo 255 caracteres",
                      autoComplete: "off",
                      inputProps: { maxLength: 255 },
                    }}
                    containerStyle={{
                      maxWidth: "none",
                      width: "100%",
                      height: "fit-content",
                    }}
                    multiline
                    rows={9}
                  />
                </div>
              )}
            />
          </div>

          <div className="expediente-buttons">
            <ButtonComponent
              config={{
                name: "volver",
                text: "Volver",
                type: "button",
                variant: "white",
                disabled: isSubmitting,
              }}
              onClick={() => navigate("/menu")}
            />

            <ButtonComponent
              config={{
                name: "anterior",
                text: "Anterior",
                type: "button",
                variant: "blue",
                disabled: isSubmitting,
              }}
              onClick={() => navigate("/registro-paciente")}
            />

            <ButtonComponent
              config={{
                name: "siguiente",
                text: "Siguiente",
                type: "submit",
                variant: "green",
                loading: isSubmitting,
                loadingText: "Guardando…",
              }}
            />
          </div>

          <span className="sr-only" aria-live="polite">
            {isSubmitting ? "Guardando expediente" : ""}
          </span>
        </form>
      </main>
    </div>
  );
}

export default Expediente;
