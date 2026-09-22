import { useCallback, useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Menu.css";
import { obtenerByEmail } from "../../services/profesionalService.js";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import ButtonHeader from "../../components/buttons/ButtonHeader.jsx";
import {
  LuCalendarDays,
  LuChevronRight,
  LuFootprints,
  LuHistory,
  LuSearch,
  LuSettings,
  LuUserPlus,
  LuWrench,
} from "react-icons/lu";

function Menu() {
  const navigate = useNavigate();
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
    <div className="menu-page">
      <HeaderComponent
        data={{ usuario }}
        childrenLeft={[
          <ButtonHeader
            key="historial-actividades"
            config={{
              name: "historial-actividades",
              text: "Historial de \n actividades",
            }}
            onClick={() => navigate("/historial")}
          >
            <LuHistory size={20} className="option-icon" aria-hidden="true" />
          </ButtonHeader>,
          <ButtonHeader
            key="agenda-consultas"
            config={{
              name: "agenda-consultas",
              text: "Agenda de \n consultas",
            }}
            onClick={() => navigate("/agenda-consultas")}
          >
            <LuCalendarDays
              size={20}
              className="option-icon"
              aria-hidden="true"
            />
          </ButtonHeader>,
        ]}
        childrenRigth={[
          <ButtonHeader
            key="ajustes"
            config={{
              name: "ajustes",
              text: "Ajustes",
            }}
            onClick={() => navigate("/ajustes")}
          >
            <LuSettings size={20} className="option-icon" aria-hidden="true" />
          </ButtonHeader>,
          <ButtonHeader
            key="soporte"
            config={{
              name: "soporte",
              text: "Soporte",
            }}
            onClick={() => navigate("/soporte")}
          >
            <LuWrench size={20} className="option-icon" aria-hidden="true" />
          </ButtonHeader>,
        ]}
      />

      <main className="menu-overlay">
        <div className="menu-card">
          <div className="menu-stepai">StepIA</div>

          <h1 className="menu-title">Panel Principal</h1>

          <p className="menu-subtitle">
            Gestiona pacientes, consulta historiales y crea nuevos análisis
            plantares.
          </p>

          <nav className="menu-options" aria-label="Módulos del sistema">
            <button
              type="button"
              id="nuevo-paciente"
              className="menu-option"
              onClick={() => navigate("/registro-paciente")}
            >
              <span className="menu-option-left">
                <span className="menu-icon-box" aria-hidden="true">
                  <LuUserPlus size={22} />
                </span>

                <span className="menu-texts">
                  <strong>Nuevo Paciente</strong>
                  <span>Registrar datos generales del paciente</span>
                </span>
              </span>

              <LuChevronRight
                className="menu-arrow"
                aria-hidden="true"
                size={18}
              />
            </button>

            <button
              type="button"
              id="buscar-paciente"
              className="menu-option"
              onClick={() => navigate("/lista-pacientes")}
            >
              <span className="menu-option-left">
                <span className="menu-icon-box" aria-hidden="true">
                  <LuSearch size={22} />
                </span>

                <span className="menu-texts">
                  <strong>Buscar Paciente</strong>
                  <span>Consultar historial y datos registrados</span>
                </span>
              </span>

              <LuChevronRight
                className="menu-arrow"
                aria-hidden="true"
                size={18}
              />
            </button>

            <button
              type="button"
              id="nuevo-analisis"
              className="menu-option"
              onClick={() => navigate("/analisis-plantar")}
            >
              <span className="menu-option-left">
                <span
                  className="menu-icon-box menu-icon-box--accent"
                  aria-hidden="true"
                >
                  <LuFootprints size={22} />
                </span>

                <span className="menu-texts">
                  <strong>Nuevo Análisis</strong>
                  <span>Registrar análisis plantar con IA</span>
                </span>
              </span>

              <LuChevronRight
                className="menu-arrow"
                aria-hidden="true"
                size={18}
              />
            </button>
          </nav>
        </div>
      </main>
    </div>
  );
}

export default Menu;
