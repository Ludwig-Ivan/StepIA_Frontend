import { useEffect, useRef, useState } from "react";
import {
  LuChevronDown,
  LuChevronUp,
  LuLogOut,
  LuPencil,
  LuUser,
  LuX,
} from "react-icons/lu";
import { obtenerFechaInicioSesion } from "../../utils/session";
import "./HeaderComponentStyle.css";

const formatearFecha = (iso) => {
  const fecha = new Date(iso);

  return `${fecha.toLocaleDateString("es-MX")} ${fecha.toLocaleTimeString(
    "es-MX",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
};

const inicialAvatar = (iniciales) => (iniciales ? iniciales : <LuUser />);

function PerfilMenu({ usuario, onEditar, onSalir }) {
  const [mostrarPerfil, setMostrarPerfil] = useState(false);
  const [confirmando, setConfirmando] = useState(false);
  const [inicioSesion] = useState(() =>
    formatearFecha(obtenerFechaInicioSesion()),
  );
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (!mostrarPerfil) {
      return undefined;
    }

    const alHacerClicFuera = (evento) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(evento.target)
      ) {
        setMostrarPerfil(false);
        setConfirmando(false);
      }
    };

    const alPresionarEscape = (evento) => {
      if (evento.key === "Escape") {
        setMostrarPerfil(false);
        setConfirmando(false);
      }
    };

    document.addEventListener("mousedown", alHacerClicFuera);
    document.addEventListener("keydown", alPresionarEscape);

    return () => {
      document.removeEventListener("mousedown", alHacerClicFuera);
      document.removeEventListener("keydown", alPresionarEscape);
    };
  }, [mostrarPerfil]);

  const iniciales =
    ((usuario.nombre || "D").charAt(0) +
      (usuario.apellidoPaterno || "").charAt(0)) || "D";

  const cerrarMenu = () => {
    setMostrarPerfil(false);
    setConfirmando(false);
  };

  return (
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
          {inicialAvatar(iniciales)}
        </span>
        <span className="doctor-datos">
          <span className="doctor-nombre">{usuario.nombre || "Doctor"}</span>
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
              {inicialAvatar(iniciales)}
            </div>
            <div className="perfil-identidad">
              <h3>{`${usuario.nombre} ${usuario.apellidoPaterno} ${usuario.apellidoMaterno}`}</h3>
              <p>{usuario.especialidad}</p>
            </div>
            <button
              type="button"
              className="perfil-cerrar"
              aria-label="Cerrar menú de perfil"
              onClick={cerrarMenu}
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
              <strong>{usuario.cedulaEspecializada || "No registrada"}</strong>
            </div>
            <div className="perfil-campo">
              <span>Teléfono</span>
              <strong>{usuario.telefono || "No registrado"}</strong>
            </div>
            <div className="perfil-campo">
              <span>Inicio de sesión</span>
              <strong>{inicioSesion}</strong>
            </div>
          </div>

          <div className="perfil-dropdown-footer">
            <button
              type="button"
              className="perfil-editar"
              onClick={() => {
                cerrarMenu();
                onEditar();
              }}
            >
              <LuPencil aria-hidden="true" />
              Editar perfil
            </button>

            {confirmando ? (
              <div
                className="perfil-confirma"
                role="group"
                aria-label="Confirmar cierre de sesión"
              >
                <span>¿Cerrar sesión?</span>
                <button
                  type="button"
                  className="perfil-confirma-si"
                  onClick={onSalir}
                >
                  Sí
                </button>
                <button
                  type="button"
                  className="perfil-confirma-no"
                  onClick={() => setConfirmando(false)}
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="perfil-salir"
                onClick={() => setConfirmando(true)}
              >
                <LuLogOut aria-hidden="true" />
                Cerrar sesión
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default PerfilMenu;
