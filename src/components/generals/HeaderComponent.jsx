import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuLogOut,
  LuPencil,
  LuX,
  LuUser,
} from "react-icons/lu";
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
  const [enLinea, setEnLinea] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!mostrarPerfil) {
      return;
    }

    const alHacerClicFuera = (evento) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(evento.target)
      ) {
        setMostrarPerfil(false);
      }
    };

    const alPresionarEscape = (evento) => {
      if (evento.key === "Escape") {
        setMostrarPerfil(false);
      }
    };

    document.addEventListener("mousedown", alHacerClicFuera);
    document.addEventListener("keydown", alPresionarEscape);

    return () => {
      document.removeEventListener("mousedown", alHacerClicFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [mostrarPerfil]);

  useEffect(() => {
    const alConectar = () => setEnLinea(true);
    const alDesconectar = () => setEnLinea(false);

    window.addEventListener("online", alConectar);
    window.addEventListener("offline", alDesconectar);

    return () => {
      window.removeEventListener("online", alConectar);
      window.removeEventListener("offline", alDesconectar);
    };
  }, []);

  const iniciales =
    ((usuario.nombre || "D").charAt(0) +
      (usuario.apellidoPaterno || "").charAt(0)) || "D";

  return (
    <header className="top-menu">
      <div className="top-menu-left">
        <button
          type="button"
          className="top-logo"
          onClick={() => navigate("/menu")}
        >
          StepIA
        </button>

        <div className="connection-status" role="status" aria-live="polite">
          <span
            className={`connection-dot${enLinea ? "" : " connection-dot--offline"}`}
            aria-hidden="true"
          />
          <span>{enLinea ? "Conectado" : "Sin conexión"}</span>
        </div>

        {childrenLeft}
      </div>

      <div className="top-menu-right">
        {childrenRigth}

        <div className="perfil-menu-container" ref={dropdownRef}>
          <button
            type="button"
            className="doctor-info"
            aria-expanded={mostrarPerfil}
            aria-haspopup="true"
            aria-controls="perfil-dropdown"
            onClick={() => setMostrarPerfil((previo) => !previo)}
          >
            <span className="doctor-avatar" aria-hidden="true">
              {initialAvatar(iniciales)}
            </span>
            <span className="doctor-datos">
              <span className="doctor-nombre">
                {usuario.nombre || "Doctor"}
              </span>
              <span className="doctor-rol">
                {usuario.especialidad || "Médico"}
              </span>
            </span>
            <span className="perfil-flecha" aria-hidden="true">
              {mostrarPerfil ? <LuChevronUp /> : <LuChevronDown />}
            </span>
          </button>

          {mostrarPerfil && (
            <div
              className="perfil-dropdown"
              id="perfil-dropdown"
              role="menu"
              aria-label="Menú de perfil"
            >
              <div className="perfil-dropdown-header">
                <div className="perfil-avatar-grande" aria-hidden="true">
                  {initialAvatar(iniciales)}
                </div>
                <div className="perfil-identidad">
                  <h3>{`${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`}</h3>
                  <p>{usuario.especialidad}</p>
                </div>
                <button
                  type="button"
                  className="perfil-cerrar"
                  aria-label="Cerrar menú de perfil"
                  onClick={() => setMostrarPerfil(false)}
                >
                  <LuX />
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
                  <LuPencil aria-hidden="true" />
                  Editar perfil
                </button>
                <button
                  type="button"
                  className="perfil-salir"
                  onClick={() => {
                    // Confirmación manejada por el usuario vía botón nativo
                    if (window.confirm("¿Deseas cerrar sesión?")) {
                      localStorage.removeItem("UsuarioActivo");
                      navigate("/");
                    }
                  }}
                >
                  <LuLogOut aria-hidden="true" />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function initialAvatar(iniciales) {
  return iniciales ? iniciales : <LuUser />;
}

export default HeaderComponent;