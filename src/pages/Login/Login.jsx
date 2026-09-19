import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { obtenerByEmail } from "../../services/profesionalService";
import InputComponent from "../../components/inputs/InputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";
import Alert from "@mui/material/Alert";
import Collapse from "@mui/material/Collapse";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import loginSchema from "../../schema/LoginSchema";

function Login() {
  const navigate = useNavigate();
  const [errorGeneral, setErrorGeneral] = useState("");

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const iniciarSesion = async (datos) => {
    setErrorGeneral("");
    try {
      const profesional = await obtenerByEmail(datos.email);

      if (!profesional) {
        setErrorGeneral(
          "No se encontró un profesional con ese correo electrónico.",
        );
        return;
      }

      localStorage.setItem("UsuarioActivo", profesional.email);
      localStorage.setItem("idProfesional", profesional.idProfesional);

      navigate("/menu");
    } catch (error) {
      setErrorGeneral(
        error?.message ||
          "No se pudo iniciar sesión. Verifica tu conexión e inténtalo de nuevo.",
      );
    }
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <form
          className="login-card"
          noValidate
          onSubmit={handleSubmit(iniciarSesion)}
        >
          <header className="login-header">
            <div className="login-badge" aria-hidden="true">
              StepIA
            </div>

            <h1 id="login-title">Iniciar Sesión</h1>

            <p className="login-subtitle">
              Accede al sistema de análisis plantar para gestionar pacientes y
              estudios.
            </p>
          </header>

          <div className="login-fields" role="group" aria-label="Datos de acceso">
            <Controller
              name="email"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "login-email",
                    label: "Correo Electrónico",
                    name: "email",
                    type: "text",
                    placeholder: "Ingresa tu correo",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    autoComplete: "email",
                    autoFocus: true,
                    error: errors.email?.message,
                  }}
                />
              )}
            />

            <Controller
              name="password"
              control={control}
              render={({ field }) => (
                <InputComponent
                  config={{
                    id: "login-password",
                    label: "Contraseña",
                    name: "password",
                    type: "password",
                    placeholder: "Ingresa tu contraseña",
                    value: field.value,
                    func: field.onChange,
                    onBlur: field.onBlur,
                    autoComplete: "current-password",
                    showToggle: true,
                    error: errors.password?.message,
                  }}
                />
              )}
            />
          </div>

          <Collapse in={Boolean(errorGeneral)}>
            <Alert
              variant="filled"
              severity="error"
              role="alert"
              sx={{ boxShadow: 3, my: 1, width: "100%" }}
            >
              {errorGeneral}
            </Alert>
          </Collapse>

          <ButtonComponent
            config={{
              name: "ingresar",
              text: "Ingresar",
              variant: "green",
              type: "submit",
              loading: isSubmitting,
              loadingText: "Ingresando…",
            }}
          />
        </form>
      </div>
      <div className="sr-only" aria-live="polite">
        {isSubmitting ? "Ingresando al sistema" : ""}
      </div>
    </div>
  );
}

export default Login;