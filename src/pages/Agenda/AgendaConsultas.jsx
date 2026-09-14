import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AgendaConsultas.css";

function AgendaConsultas() {
  const navigate = useNavigate();

  const hoy = new Date();

  const [pacientes, setPacientes] = useState([]);

  const [mesActual, setMesActual] = useState(hoy.getMonth());

  const [anioActual, setAnioActual] = useState(hoy.getFullYear());

  const formatearFechaLocal = (fecha) => {
    const year = fecha.getFullYear();

    const month = String(fecha.getMonth() + 1).padStart(2, "0");

    const day = String(fecha.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const [fechaSeleccionada, setFechaSeleccionada] = useState(
    formatearFechaLocal(hoy),
  );

  /* ======================================
     CARGAR PACIENTES
  ====================================== */

  useEffect(() => {
    const pacientesGuardados =
      JSON.parse(localStorage.getItem("pacientes")) || [];

    setPacientes(pacientesGuardados);
  }, []);

  /* ======================================
     CITAS
  ====================================== */

  const citas = useMemo(() => {
    return pacientes
      .filter((paciente) => {
        return paciente.proximaFechaConsulta;
      })
      .map((paciente) => {
        return {
          id: paciente.idPaciente || paciente.nss || paciente.nombre,

          nombre: paciente.nombre || "Paciente",

          fecha: paciente.proximaFechaConsulta,

          hora: paciente.proximaHoraConsulta || "Sin hora",

          nss: paciente.nss || "",

          pacienteCompleto: paciente,
        };
      });
  }, [pacientes]);

  /* ======================================
     CITAS DEL DÍA SELECCIONADO
  ====================================== */

  const citasDiaSeleccionado = useMemo(() => {
    return citas
      .filter((cita) => cita.fecha === fechaSeleccionada)
      .sort((a, b) => {
        if (a.hora === "Sin hora" || b.hora === "Sin hora") {
          return 0;
        }

        return a.hora.localeCompare(b.hora);
      });
  }, [citas, fechaSeleccionada]);

  /* ======================================
     DATOS DEL CALENDARIO
  ====================================== */

  const primerDiaMes = new Date(anioActual, mesActual, 1);

  const ultimoDiaMes = new Date(anioActual, mesActual + 1, 0);

  const cantidadDias = ultimoDiaMes.getDate();

  const diaInicio = primerDiaMes.getDay();

  const nombresMeses = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  /* ======================================
     CAMBIAR MES
  ====================================== */

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);

      setAnioActual(anioActual - 1);
    } else {
      setMesActual(mesActual - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);

      setAnioActual(anioActual + 1);
    } else {
      setMesActual(mesActual + 1);
    }
  };

  /* ======================================
     OBTENER CITAS DE UN DÍA
  ====================================== */

  const obtenerCitasDia = (dia) => {
    const fecha =
      `${anioActual}-` +
      `${String(mesActual + 1).padStart(2, "0")}-` +
      `${String(dia).padStart(2, "0")}`;

    return citas.filter((cita) => cita.fecha === fecha);
  };

  /* ======================================
     SELECCIONAR DÍA
  ====================================== */

  const seleccionarDia = (dia) => {
    const fecha =
      `${anioActual}-` +
      `${String(mesActual + 1).padStart(2, "0")}-` +
      `${String(dia).padStart(2, "0")}`;

    setFechaSeleccionada(fecha);
  };

  /* ======================================
     ABRIR PACIENTE
  ====================================== */

  const abrirPaciente = (cita) => {
    localStorage.setItem(
      "pacienteSeleccionado",
      JSON.stringify(cita.pacienteCompleto),
    );

    navigate("/informe-paciente");
  };

  /* ======================================
     CREAR CALENDARIO
  ====================================== */

  const crearCalendario = () => {
    const dias = [];

    /* espacios antes del día 1 */

    for (let i = 0; i < diaInicio; i++) {
      dias.push(<div key={`vacio-${i}`} className="calendario-dia vacio" />);
    }

    /* días del mes */

    for (let dia = 1; dia <= cantidadDias; dia++) {
      const fecha =
        `${anioActual}-` +
        `${String(mesActual + 1).padStart(2, "0")}-` +
        `${String(dia).padStart(2, "0")}`;

      const citasDia = obtenerCitasDia(dia);

      const esSeleccionado = fecha === fechaSeleccionada;

      const esHoy = fecha === formatearFechaLocal(hoy);

      dias.push(
        <button
          key={dia}
          type="button"
          className={`
            calendario-dia

            ${citasDia.length > 0 ? "tiene-cita" : ""}

            ${esSeleccionado ? "seleccionado" : ""}

            ${esHoy ? "hoy" : ""}
            `}
          onClick={() => seleccionarDia(dia)}
        >
          <div className="numero-dia">{dia}</div>

          {/* CITAS MARCADAS EN CALENDARIO */}

          <div className="mini-citas">
            {citasDia.slice(0, 3).map((cita, index) => (
              <div key={`${cita.id}-${index}`} className="mini-cita">
                <span className="mini-hora">{cita.hora}</span>

                <span className="mini-nombre">{cita.nombre}</span>
              </div>
            ))}

            {citasDia.length > 3 && (
              <div className="mas-citas">+{citasDia.length - 3} más</div>
            )}
          </div>
        </button>,
      );
    }

    return dias;
  };

  /* ======================================
     VISTA
  ====================================== */

  return (
    <div className="agenda-page">
      {/* HEADER */}

      <header className="agenda-header">
        <button
          type="button"
          className="agenda-logo"
          onClick={() => navigate("/menu")}
        >
          StepAI
        </button>

        <div className="agenda-header-right">
          <span className="agenda-conectado">
            <span className="agenda-punto"></span>
            Conectado
          </span>

          <button
            type="button"
            className="agenda-menu-btn"
            onClick={() => navigate("/menu")}
          >
            🏠 Panel Principal
          </button>
        </div>
      </header>

      <main className="agenda-main">
        <div className="agenda-title">
          <div>
            <h1>📅 Agenda de Consultas</h1>

            <p>Consulta las próximas citas programadas de tus pacientes.</p>
          </div>
        </div>

        <div className="agenda-layout">
          {/* ============================
              CALENDARIO
          ============================ */}

          <section className="calendario-card">
            <div className="calendario-header">
              <button type="button" onClick={mesAnterior}>
                ‹
              </button>

              <h2>
                {nombresMeses[mesActual]} {anioActual}
              </h2>

              <button type="button" onClick={mesSiguiente}>
                ›
              </button>
            </div>

            <div className="dias-semana">
              <div>Dom</div>
              <div>Lun</div>
              <div>Mar</div>
              <div>Mié</div>
              <div>Jue</div>
              <div>Vie</div>
              <div>Sáb</div>
            </div>

            <div className="calendario-grid">{crearCalendario()}</div>
          </section>

          {/* ============================
              CITAS DEL DÍA
          ============================ */}

          <aside className="citas-dia-card">
            <div className="citas-dia-header">
              <span>Consultas del día</span>

              <strong>
                {fechaSeleccionada.split("-").reverse().join("/")}
              </strong>
            </div>

            {citasDiaSeleccionado.length === 0 ? (
              <div className="sin-citas">
                <div className="sin-citas-icon">📅</div>

                <h3>Sin consultas</h3>

                <p>No hay pacientes programados para este día.</p>
              </div>
            ) : (
              <div className="lista-citas">
                {citasDiaSeleccionado.map((cita, index) => (
                  <button
                    type="button"
                    key={`${cita.id}-${index}`}
                    className="cita-card"
                    onClick={() => abrirPaciente(cita)}
                  >
                    <div className="cita-hora">
                      🕐
                      <strong>{cita.hora}</strong>
                    </div>

                    <div className="cita-paciente">
                      <div className="cita-avatar">👤</div>

                      <div>
                        <h3>{cita.nombre}</h3>

                        {cita.nss && <p>NSS: {cita.nss}</p>}
                      </div>
                    </div>

                    <span className="cita-flecha">➜</span>
                  </button>
                ))}
              </div>
            )}
          </aside>
        </div>

        {/* RESUMEN */}

        <div className="agenda-resumen">
          <div className="resumen-card">
            <span>Próximas consultas</span>

            <strong>{citas.length}</strong>
          </div>

          <div className="resumen-card">
            <span>Consultas este día</span>

            <strong>{citasDiaSeleccionado.length}</strong>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AgendaConsultas;
