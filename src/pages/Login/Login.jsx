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

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const iniciarSesion = async (datos) => {
    const profesional = await obtenerByEmail(datos.email);

    localStorage.setItem("UsuarioActivo", profesional.email);
    localStorage.setItem("idProfesional", profesional.idProfesional);

    navigate("/menu");
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <form className="login-card" onSubmit={handleSubmit(iniciarSesion)}>
          <div className="login-badge">StepIA</div>

          <h1>Iniciar Sesión</h1>

          <p className="login-subtitle">
            Accede al sistema de análisis plantar
          </p>

          <Controller
            name="email"
            control={control}
            render={({ field }) => (
              <InputComponent
                config={{
                  label: "Correo Electrónico",
                  name: "email",
                  type: "text",
                  placeholder: "Ingresa tu correo",
                  value: field.value,
                  func: field.onChange,
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
                  label: "Contraseña",
                  name: "password",
                  type: "password",
                  placeholder: "Ingresa tu contraseña",
                  value: field.value,
                  func: field.onChange,
                }}
              />
            )}
          />

          <ButtonComponent
            config={{
              name: "ingresar",
              text: "Ingresar",
              variant: "green",
              type: "submit",
            }}
          />
        </form>
      </div>
      <div
        style={{
          position: "fixed",
          bottom: 24,
          left: "50%",
          transform: "translateX(-50%)",
          width: "min(90%, 420px)",
          zIndex: 1400,
        }}
      >
        {errors.email ? (
          <Collapse in={errors.email}>
            <Alert variant="filled" severity="warning" sx={{ boxShadow: 3 }}>
              {errors.email ? errors.email.message : ""}
            </Alert>
          </Collapse>
        ) : (
          <Collapse in={errors.password}>
            <Alert variant="filled" severity="warning" sx={{ boxShadow: 3 }}>
              {errors.password ? errors.password.message : ""}
            </Alert>
          </Collapse>
        )}
      </div>
    </div>
  );
}

export default Login;
