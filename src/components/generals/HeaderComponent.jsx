import { useNavigate } from "react-router-dom";
import { useState } from "react";
import "./HeaderComponentStyle.css";
/**
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object} props.data.usuario
 * @param {React.ReactNode} [props.childrenLeft]
 * @param {React.ReactNode} [props.childrenRigth]
 */
function HeaderComponent({ childrenLeft, childrenRigth, data }) {
  const { usuario } = data;
  const navigate = useNavigate();
  const [mostrarPerfil, setMostrarPerfil] = useState(false);

  const cerrarSesion = () => {
    const confirmar = window.confirm("¿Deseas cerrar sesión?");

    if (!confirmar) {
      return;
    }

    localStorage.removeItem("UsuarioActivo");

    navigate("/");
  };

  return (
    <header className="top-menu">
      <div className="top-menu-left">
        <button
          type="button"
          className="top-logo"
          onClick={() => navigate("/menu")}
        >
          StepAI
        </button>

        <div className="connection-status">
          <span className="connection-dot"></span>
          <span>Conectado</span>
        </div>

        {childrenLeft}
      </div>

      <div className="top-menu-right">
        {childrenRigth}

        <div className="perfil-menu-container">
          <button
            type="button"
            className="doctor-info"
            onClick={() => setMostrarPerfil(!mostrarPerfil)}
          >
            <div className="doctor-avatar"></div>
            <div className="doctor-datos">
              <span className="doctor-nombre">
                {usuario.nombre || "Doctor"}
              </span>
              <span className="doctor-rol">
                {usuario.especialidad || "Médico"}
              </span>
            </div>
            <span className="perfil-flecha">{mostrarPerfil ? "▲" : "▼"}</span>
          </button>

          {mostrarPerfil && (
            <div className="perfil-dropdown">
              <div className="perfil-dropdown-header">
                <div className="perfil-avatar-grande"></div>
                <div>
                  <h3>{`${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`}</h3>
                  <p>{usuario.especialidad}</p>
                </div>
                <button
                  type="button"
                  className="perfil-cerrar"
                  onClick={() => setMostrarPerfil(false)}
                >
                  ✕
                </button>
              </div>

              <div className="perfil-dropdown-body">
                <div className="perfil-campo">
                  <span>Correo</span>
                  <strong>{usuario.email || "No registrado"}</strong>
                </div>
                <div className="perfil-campo">
                  <span>Cedula Profesional</span>
                  <strong>{usuario.cedulaProfesional || "Médico"}</strong>
                </div>
                <div className="perfil-campo">
                  <span>Especialidad</span>
                  <strong>{usuario.especialidad || "No registrada"}</strong>
                </div>
                <div className="perfil-campo">
                  <span>Cédula Especializada</span>
                  <strong>
                    {usuario.cedulaEspecializada || "No registrada"}
                  </strong>
                </div>
                <div className="perfil-campo">
                  <span>Teléfono</span>
                  <strong>{usuario.telefono || "No registrado"}</strong>
                </div>
                <div className="perfil-campo">
                  <span>Inicio de sesión</span>
                  <strong>
                    {`${new Date().toLocaleDateString("es-MX")} 
                            ${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}`}
                  </strong>
                </div>
              </div>

              <div className="perfil-dropdown-footer">
                <button
                  type="button"
                  className="perfil-editar"
                  onClick={() => {
                    setMostrarPerfil(false);
                    navigate("/ajustes");
                  }}
                >
                  ⚙️ Editar perfil
                </button>
                <button
                  type="button"
                  className="perfil-salir"
                  onClick={cerrarSesion}
                >
                  🚪 Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default HeaderComponent;
