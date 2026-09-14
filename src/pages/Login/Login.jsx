import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Login.css";
import { obtenerByEmail } from "../../services/profesionalService";
import InputComponent from "../../components/inputs/InputComponent";
import ButtonComponent from "../../components/buttons/ButtonComponent";

function Login() {
  const navigate = useNavigate();

  const [datos, setDatos] = useState({
    correo: "",
    password: "",
  });

  const manejarCambio = (e) => {
    const { name, value } = e.target;

    setDatos({
      ...datos,
      [name]: value,
    });
  };

  const iniciarSesion = async () => {
    if (datos.correo.trim() === "" || datos.password.trim() === "") {
      alert("Por favor completa todos los campos");
      return;
    }

    const profesional = await obtenerByEmail(datos.correo);

    console.log(profesional);

    if (!profesional) return;

    localStorage.setItem("UsuarioActivo", profesional.email);
    localStorage.setItem("idProfesional", profesional.idProfesional);

    navigate("/menu");
  };

  return (
    <div className="login-page">
      <div className="login-overlay">
        <form className="login-card">
          <div className="login-badge">StepIA</div>

          <h1>Iniciar Sesión</h1>

          <p className="login-subtitle">
            Accede al sistema de análisis plantar
          </p>
          <InputComponent
            config={{
              label: "Correo Electrónico",
              name: "correo",
              type: "email",
              placeholder: "Ingresa tu correo",
              value: datos.correo,
              func: manejarCambio,
            }}
          />

          <InputComponent
            config={{
              label: "Contraseña",
              name: "password",
              type: "password",
              placeholder: "Ingresa tu contraseña",
              value: datos.password,
              func: manejarCambio,
            }}
          />
          <ButtonComponent
            config={{
              name: "ingresar",
              text: "Ingresar",
              variant: "green",
            }}
            onClick={iniciarSesion}
          />
        </form>
      </div>
    </div>
  );
}

export default Login;
