import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import "./AgendaConsultas.css";
import { FaUserAlt } from "react-icons/fa";
import {
  FaCalendarCheck,
  FaCalendarDays,
  FaChevronLeft,
  FaChevronRight,
  FaClock,
  FaMagnifyingGlass,
  FaUser,
  FaXmark,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Alert from "@mui/material/Alert";

const TAMANO_PAGINA_CITAS = 6;

const NOMBRES_MESES = [
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

const DIAS_SEMANA = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

/** @param {unknown} valor @returns {string} */
const convertirTexto = (valor) => `${valor || ""}`.toLowerCase().trim();

const formatearFechaLocal = (fecha) => {
  const year = fecha.getFullYear();
  const month = String(fecha.getMonth() + 1).padStart(2, "0");
  const day = String(fecha.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const obtenerFechaDia = (anio, mes, dia) =>
  `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

const leerPacientesLocal = () => {
  try {
    const guardados = JSON.parse(localStorage.getItem("pacientes"));
    return Array.isArray(guardados) ? guardados : [];
  } catch {
    return null;
  }
};

const crearPaginas = (paginaActual, total) => {
  const paginas = [];
  const incluidas = new Set();

  const incluir = (valor) => {
    if (valor < 0 || valor > total - 1 || incluidas.has(valor)) return;

    const ultima = paginas[paginas.length - 1];

    if (ultima && valor - ultima.valor > 1) {
      paginas.push({ valor: null, elipsis: true });
    }

    incluidas.add(valor);
    paginas.push({ valor, elipsis: false });
  };

  incluir(0);
  if (total > 3) {
    incluir(paginaActual - 1);
    incluir(paginaActual);
    incluir(paginaActual + 1);
  }
  incluir(total - 1);

  return paginas;
};

function HeaderAgenda({ onMenu }) {
  return (
    <header className="agenda-header">
      <button type="button" className="agenda-logo" onClick={onMenu}>
        StepIA
      </button>

      <div className="agenda-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="agenda-user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

function DiaCalendario({
  dia,
  tituloMes,
  esHoy,
  esSeleccionado,
  citasDia,
  onSeleccionar,
}) {
  const tieneCitas = citasDia.length > 0;
  const etiqueta = `${dia} ${tituloMes}${
    tieneCitas
      ? `, ${citasDia.length} ${citasDia.length === 1 ? "consulta" : "consultas"}`
      : ""
  }${esHoy ? ", hoy" : ""}`;

  return (
    <button
      type="button"
      className={`calendario-dia${tieneCitas ? " calendario-dia--cita" : ""}${
        esSeleccionado ? " calendario-dia--seleccionado" : ""
      }${esHoy ? " calendario-dia--hoy" : ""}`}
      onClick={() => onSeleccionar(dia)}
      aria-pressed={esSeleccionado}
      aria-current={esHoy ? "date" : undefined}
      aria-label={etiqueta}
    >
      <div className="numero-dia">{dia}</div>

      <div className="mini-citas">
        {citasDia.slice(0, 3).map((cita) => (
          <div key={`${cita.id}-${cita.hora}`} className="mini-cita">
            <span className="mini-hora">{cita.hora}</span>
            <span className="mini-nombre">{cita.nombre}</span>
          </div>
        ))}

        {citasDia.length > 3 && (
          <div className="mas-citas">+{citasDia.length - 3} más</div>
        )}
      </div>
    </button>
  );
}

function CitaAgenda({ cita, onAbrir }) {
  return (
    <button
      type="button"
      className="cita-card"
      onClick={() => onAbrir(cita)}
      aria-label={`Abrir informe de ${cita.nombre}, consulta de las ${cita.hora}`}
    >
      <div className="cita-hora">
        <FaClock aria-hidden="true" />
        <strong>{cita.hora}</strong>
      </div>

      <div className="cita-paciente">
        <div className="cita-avatar" aria-hidden="true">
          <FaUser />
        </div>

        <div className="cita-datos">
          <h3>{cita.nombre}</h3>
          {cita.nss && <p>NSS: {cita.nss}</p>}
        </div>
      </div>

      <FaChevronRight className="cita-flecha" aria-hidden="true" />
    </button>
  );
}

function PaginacionCitas({ pagina, totalPaginas, onIrAPagina }) {
  return (
    <nav className="citas-paginacion" aria-label="Paginación de consultas">
      <button
        type="button"
        className="citas-pagina-boton"
        aria-label="Página anterior"
        onClick={() => onIrAPagina(pagina - 1)}
        disabled={pagina <= 0}
      >
        <FaChevronLeft aria-hidden="true" />
      </button>

      {crearPaginas(pagina, totalPaginas).map((item, indice) =>
        item.elipsis ? (
          <span
            key={`elipsis-${indice}`}
            className="citas-pagina-elipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={item.valor}
            type="button"
            className={`citas-pagina-boton${item.valor === pagina ? " citas-pagina-boton--activa" : ""}`}
            aria-label={`Página ${item.valor + 1}`}
            aria-current={item.valor === pagina ? "page" : undefined}
            onClick={() => onIrAPagina(item.valor)}
          >
            {item.valor + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className="citas-pagina-boton"
        aria-label="Página siguiente"
        onClick={() => onIrAPagina(pagina + 1)}
        disabled={pagina >= totalPaginas - 1}
      >
        <FaChevronRight aria-hidden="true" />
      </button>
    </nav>
  );
}

function PanelCitasAgenda({
  fechaLegible,
  error,
  hayPacientes,
  citasDelDia,
  citasPagina,
  busqueda,
  onCambioBusqueda,
  onLimpiarBusqueda,
  pagina,
  totalPaginas,
  onIrAPagina,
  onAbrirCita,
  onReintentar,
  onRegistrarPaciente,
}) {
  const mostrarBuscador = hayPacientes && !error;
  const totalDelDia = citasDelDia.length;
  const sinCoincidencias =
    mostrarBuscador && busqueda !== "" && citasPagina.length === 0;

  let contenido;

  if (error) {
    contenido = (
      <div className="agenda-aviso" role="alert">
        <Alert
          variant="filled"
          severity="error"
          sx={{ fontWeight: 600, borderRadius: 1.5 }}
        >
          No se pudieron leer los pacientes guardados.
        </Alert>

        <ButtonComponent
          config={{
            name: "reintentar",
            text: "Reintentar",
            type: "button",
            variant: "blue",
          }}
          onClick={onReintentar}
        />
      </div>
    );
  } else if (!hayPacientes) {
    contenido = (
      <div className="agenda-aviso" role="status" aria-live="polite">
        <Alert
          variant="filled"
          severity="warning"
          sx={{ fontWeight: 600, borderRadius: 1.5 }}
        >
          No hay pacientes registrados todavía.
        </Alert>

        <ButtonComponent
          config={{
            name: "registrar-paciente",
            text: "Registrar paciente",
            type: "button",
            variant: "green",
          }}
          onClick={onRegistrarPaciente}
        />
      </div>
    );
  } else if (sinCoincidencias) {
    contenido = (
      <div className="agenda-aviso" role="status" aria-live="polite">
        <Alert
          variant="filled"
          severity="info"
          sx={{ fontWeight: 600, borderRadius: 1.5 }}
        >
          No se encontraron pacientes con esa búsqueda.
        </Alert>

        <ButtonComponent
          config={{
            name: "limpiar-busqueda",
            text: "Limpiar búsqueda",
            type: "button",
            variant: "blue",
          }}
          onClick={onLimpiarBusqueda}
        />
      </div>
    );
  } else if (totalDelDia === 0) {
    contenido = (
      <div className="sin-citas" role="status" aria-live="polite">
        <FaCalendarDays className="sin-citas-icon" aria-hidden="true" />

        <h3>Sin consultas</h3>

        <p>No hay pacientes programados para este día.</p>
      </div>
    );
  } else {
    contenido = (
      <>
        <div className="lista-citas">
          {citasPagina.map((cita) => (
            <CitaAgenda
              key={`${cita.id}-${cita.hora}`}
              cita={cita}
              onAbrir={onAbrirCita}
            />
          ))}
        </div>

        {totalPaginas > 1 && (
          <PaginacionCitas
            pagina={pagina}
            totalPaginas={totalPaginas}
            onIrAPagina={onIrAPagina}
          />
        )}
      </>
    );
  }

  return (
    <aside className="citas-dia-card" aria-label="Consultas del día">
      <div className="citas-dia-header">
        <span>Consultas del día</span>
        <strong>{fechaLegible}</strong>

        {mostrarBuscador && totalDelDia > 0 && (
          <span className="citas-dia-count" role="status" aria-live="polite">
            {totalDelDia} {totalDelDia === 1 ? "consulta" : "consultas"}
          </span>
        )}
      </div>

      {mostrarBuscador && (
        <search className="citas-buscador">
          <label className="sr-only" htmlFor="agenda-busqueda">
            Buscar paciente
          </label>

          <FaMagnifyingGlass
            className="citas-buscador-icono"
            aria-hidden="true"
          />

          <input
            id="agenda-busqueda"
            type="search"
            placeholder="Buscar por nombre o NSS..."
            value={busqueda}
            onChange={(e) => onCambioBusqueda(e.target.value)}
          />

          {busqueda && (
            <button
              type="button"
              className="citas-clear"
              aria-label="Limpiar búsqueda"
              onClick={onLimpiarBusqueda}
            >
              <FaXmark aria-hidden="true" />
            </button>
          )}
        </search>
      )}

      <div className="citas-dia-contenido">{contenido}</div>
    </aside>
  );
}

function ResumenAgenda({ totalCitas, citasDelDia }) {
  return (
    <div className="agenda-resumen">
      <div className="resumen-card">
        <span className="resumen-icono" aria-hidden="true">
          <FaCalendarCheck />
        </span>

        <span className="resumen-etiqueta">Próximas consultas</span>

        <strong>{totalCitas}</strong>
      </div>

      <div className="resumen-card">
        <span className="resumen-icono" aria-hidden="true">
          <FaClock />
        </span>

        <span className="resumen-etiqueta">Consultas este día</span>

        <strong>{citasDelDia}</strong>
      </div>
    </div>
  );
}

function AgendaConsultas() {
  const navigate = useNavigate();

  const [hoy] = useState(() => formatearFechaLocal(new Date()));
  const [pacientes, setPacientes] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(false);

  const [mesActual, setMesActual] = useState(() => new Date().getMonth());
  const [anioActual, setAnioActual] = useState(() => new Date().getFullYear());
  const [fechaSeleccionada, setFechaSeleccionada] = useState(hoy);

  const [busqueda, setBusqueda] = useState("");
  const [paginaCitas, setPaginaCitas] = useState(0);

  const cargarPacientes = useCallback(() => {
    return Promise.resolve().then(() => {
      const resultado = leerPacientesLocal();

      if (resultado === null) {
        setError(true);
      } else {
        setPacientes(resultado);
      }

      setCargando(false);
    });
  }, []);

  useEffect(() => {
    cargarPacientes();
  }, [cargarPacientes]);

  const reintentar = () => {
    setCargando(true);
    setError(false);
    cargarPacientes();
  };

  const citas = useMemo(() => {
    return pacientes
      .filter((paciente) => Boolean(paciente && paciente.proximaFechaConsulta))
      .map((paciente) => ({
        id: paciente.idPaciente || paciente.nss || paciente.nombre,

        nombre: paciente.nombre || "Paciente",

        fecha: paciente.proximaFechaConsulta,

        hora: paciente.proximaHoraConsulta || "Sin hora",

        nss: paciente.nss || "",

        pacienteCompleto: paciente,
      }));
  }, [pacientes]);

  const citasPorFecha = useMemo(() => {
    const mapa = new Map();

    for (const cita of citas) {
      const lista = mapa.get(cita.fecha);

      if (lista) {
        lista.push(cita);
      } else {
        mapa.set(cita.fecha, [cita]);
      }
    }

    return mapa;
  }, [citas]);

  const citasDiaSeleccionado = useMemo(() => {
    const lista = citasPorFecha.get(fechaSeleccionada) || [];

    return [...lista].sort((a, b) => {
      if (a.hora === "Sin hora" || b.hora === "Sin hora") {
        return 0;
      }

      return a.hora.localeCompare(b.hora);
    });
  }, [citasPorFecha, fechaSeleccionada]);

  const citasBuscadas = useMemo(() => {
    const texto = convertirTexto(busqueda);

    if (texto === "") return citasDiaSeleccionado;

    return citasDiaSeleccionado.filter((cita) => {
      const incluye = (valor) =>
        `${valor || ""}`.toLowerCase().trim().includes(texto);

      return incluye(cita.nombre) || incluye(cita.nss);
    });
  }, [citasDiaSeleccionado, busqueda]);

  const totalPaginas = Math.max(
    1,
    Math.ceil(citasBuscadas.length / TAMANO_PAGINA_CITAS),
  );
  const paginaSegura = Math.min(paginaCitas, totalPaginas - 1);
  const citasPagina = citasBuscadas.slice(
    paginaSegura * TAMANO_PAGINA_CITAS,
    (paginaSegura + 1) * TAMANO_PAGINA_CITAS,
  );

  const cantidadDias = new Date(anioActual, mesActual + 1, 0).getDate();
  const diaInicio = new Date(anioActual, mesActual, 1).getDay();
  const tituloMes = `${NOMBRES_MESES[mesActual]} ${anioActual}`;

  const diasDelMes = useMemo(() => {
    const lista = [];

    for (let dia = 1; dia <= cantidadDias; dia++) {
      const fecha = obtenerFechaDia(anioActual, mesActual, dia);

      lista.push({
        dia,
        fecha,
        esHoy: fecha === hoy,
        esSeleccionado: fecha === fechaSeleccionada,
        citasDia: citasPorFecha.get(fecha) || [],
      });
    }

    return lista;
  }, [
    anioActual,
    mesActual,
    cantidadDias,
    hoy,
    fechaSeleccionada,
    citasPorFecha,
  ]);

  const mesAnterior = () => {
    if (mesActual === 0) {
      setMesActual(11);
      setAnioActual((anio) => anio - 1);
    } else {
      setMesActual((mes) => mes - 1);
    }
  };

  const mesSiguiente = () => {
    if (mesActual === 11) {
      setMesActual(0);
      setAnioActual((anio) => anio + 1);
    } else {
      setMesActual((mes) => mes + 1);
    }
  };

  const seleccionarDia = (dia) => {
    setFechaSeleccionada(obtenerFechaDia(anioActual, mesActual, dia));
    setBusqueda("");
    setPaginaCitas(0);
  };

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPaginaCitas(0);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPaginaCitas(0);
  };

  const irAPagina = (nuevaPagina) => {
    if (
      nuevaPagina === paginaSegura ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setPaginaCitas(nuevaPagina);
  };

  const abrirPaciente = (cita) => {
    localStorage.setItem(
      "pacienteSeleccionado",
      JSON.stringify(cita.pacienteCompleto),
    );

    navigate("/informe-paciente");
  };

  return (
    <div className="agenda-page">
      <HeaderAgenda onMenu={() => navigate("/menu")} />

      <main className="agenda-main">
        {cargando ? (
          <div className="agenda-carga" role="status" aria-live="polite">
            <span className="agenda-spinner" aria-hidden="true" />
            Cargando agenda…
          </div>
        ) : (
          <>
            <div className="agenda-title">
              <h1>Agenda de Consultas</h1>
              <p>Consulta las próximas citas programadas de tus pacientes.</p>
            </div>

            <div className="agenda-layout">
              <section
                className="calendario-card"
                aria-labelledby="agenda-calendario-titulo"
              >
                <div className="calendario-header">
                  <button
                    type="button"
                    className="calendario-nav"
                    aria-label="Mes anterior"
                    onClick={mesAnterior}
                  >
                    <FaChevronLeft aria-hidden="true" />
                  </button>

                  <h2 id="agenda-calendario-titulo">{tituloMes}</h2>

                  <button
                    type="button"
                    className="calendario-nav"
                    aria-label="Mes siguiente"
                    onClick={mesSiguiente}
                  >
                    <FaChevronRight aria-hidden="true" />
                  </button>
                </div>

                <div className="dias-semana" aria-hidden="true">
                  {DIAS_SEMANA.map((dia) => (
                    <div key={dia}>{dia}</div>
                  ))}
                </div>

                <div className="calendario-grid">
                  {Array.from({ length: diaInicio }).map((_, indice) => (
                    <div
                      key={`vacio-${indice}`}
                      className="calendario-dia calendario-dia--vacio"
                      aria-hidden="true"
                    />
                  ))}

                  {diasDelMes.map((item) => (
                    <DiaCalendario
                      key={item.dia}
                      dia={item.dia}
                      tituloMes={tituloMes}
                      esHoy={item.esHoy}
                      esSeleccionado={item.esSeleccionado}
                      citasDia={item.citasDia}
                      onSeleccionar={seleccionarDia}
                    />
                  ))}
                </div>
              </section>

              <PanelCitasAgenda
                fechaLegible={fechaSeleccionada.split("-").reverse().join("/")}
                error={error}
                hayPacientes={pacientes.length > 0}
                citasDelDia={citasDiaSeleccionado}
                citasPagina={citasPagina}
                busqueda={busqueda}
                onCambioBusqueda={cambiarBusqueda}
                onLimpiarBusqueda={limpiarBusqueda}
                pagina={paginaSegura}
                totalPaginas={totalPaginas}
                onIrAPagina={irAPagina}
                onAbrirCita={abrirPaciente}
                onReintentar={reintentar}
                onRegistrarPaciente={() => navigate("/registro-paciente")}
              />
            </div>

            <ResumenAgenda
              totalCitas={citas.length}
              citasDelDia={citasDiaSeleccionado.length}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default AgendaConsultas;