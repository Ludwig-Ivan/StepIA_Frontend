import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import "./Menu.css";
import { obtenerByEmail } from "../../services/profesionalService.js";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import ButtonHeader from "../../components/buttons/ButtonHeader.jsx";

function Menu() {
  const navigate = useNavigate();
  const emailUsuario = localStorage.getItem("UsuarioActivo");
  const [cargando, setCargando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const obtenerDoctor = async () => {
      try {
        const doctor = await obtenerByEmail(emailUsuario);
        setUsuario(doctor);
      } catch (error) {
        console.error("Error obtenido al cargar usuario", error);
        navigate("/");
      } finally {
        setCargando(false);
      }
    };

    obtenerDoctor();
  }, [emailUsuario]);

  if (cargando)
    return (
      <div className="loading-screen">
        <h2>Cargando...</h2>
        <p>Obteniendo información del perfil</p>
      </div>
    );

  return (
    <div className="menu-page">
      <HeaderComponent
        data={{ usuario: usuario }}
        childrenLeft={[
          <ButtonHeader
            config={{
              name: "historial-actividades",
              text: "Historial de \n actividades",
            }}
            onClick={() => navigate("/historial")}
          >
            <span className="option-icon"> 🕘 </span>
          </ButtonHeader>,
          <ButtonHeader
            config={{
              name: "agenda-consultas",
              text: "Agenda de \n consultas",
            }}
            onClick={() => navigate("/agenda-consultas")}
          >
            <span className="option-icon"> 📅 </span>
          </ButtonHeader>,
        ]}
        childrenRigth={[
          <ButtonHeader
            config={{
              name: "ajustes",
              text: "Ajustes",
            }}
            onClick={() => navigate("/ajustes")}
          >
            <span className="option-icon"> ⚙️ </span>
          </ButtonHeader>,
          <ButtonHeader
            config={{
              name: "soporte",
              text: "Soporte",
            }}
            onClick={() => navigate("/soporte")}
          >
            <span className="option-icon"> 🔧 </span>
          </ButtonHeader>,
        ]}
      />
      {/* =========================================
          CONTENIDO PRINCIPAL
      ========================================= */}

      <div className="menu-overlay">
        <div className="menu-card">
          <div className="menu-stepai">StepAI</div>

          <h1 className="menu-title">Panel Principal</h1>

          <p className="menu-subtitle">
            Gestiona pacientes, consulta historiales y crea nuevos análisis
            plantares.
          </p>

          <div className="menu-options">
            {/* NUEVO PACIENTE */}

            <button
              type="button"
              id="nuevo-paciente"
              className="menu-option"
              onClick={() => navigate("/registro-paciente")}
            >
              <div className="menu-option-left">
                <div className="menu-icon-box">👤</div>

                <div className="menu-texts">
                  <h3>Nuevo Paciente</h3>

                  <p>Registrar datos generales del paciente</p>
                </div>
              </div>

              <div className="menu-arrow">➜</div>
            </button>

            {/* BUSCAR PACIENTE */}

            <button
              type="button"
              id="buscar-paciente"
              className="menu-option"
              onClick={() => navigate("/lista-pacientes")}
            >
              <div className="menu-option-left">
                <div className="menu-icon-box">🔍</div>

                <div className="menu-texts">
                  <h3>Buscar Paciente</h3>

                  <p>Consultar historial y datos registrados</p>
                </div>
              </div>

              <div className="menu-arrow">➜</div>
            </button>

            {/* NUEVO ANÁLISIS */}

            <button
              type="button"
              id="nuevo-analisis"
              className="menu-option"
              onClick={() => navigate("/analisis-plantar")}
            >
              <div className="menu-option-left">
                <div className="menu-icon-box">📊</div>

                <div className="menu-texts">
                  <h3>Nuevo Análisis</h3>

                  <p>Registrar análisis plantar con IA</p>
                </div>
              </div>

              <div className="menu-arrow">➜</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Menu;
