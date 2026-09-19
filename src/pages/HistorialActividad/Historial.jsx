import { createElement, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Historial.css";
import { FaUserAlt } from "react-icons/fa";
import {
  FaCalendarCheck,
  FaChartLine,
  FaClock,
  FaClockRotateLeft,
  FaFileMedical,
  FaFlask,
  FaMagnifyingGlass,
  FaNotesMedical,
  FaRegCalendar,
  FaRegClock,
  FaTrash,
  FaUserPlus,
  FaXmark,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";

const TAMANO_PAGINA = 6;

const TIPOS_ACTIVIDAD = [
  "Registro de paciente",
  "Paciente consultado",
  "Informe médico",
  "Consulta programada",
  "Análisis plantar",
  "Estudio adicional",
  "Datos médicos",
];

const ICONOS_ACTIVIDAD = {
  "Registro de paciente": FaUserPlus,
  "Paciente consultado": FaMagnifyingGlass,
  "Informe médico": FaFileMedical,
  "Consulta programada": FaCalendarCheck,
  "Análisis plantar": FaChartLine,
  "Estudio adicional": FaFlask,
  "Datos médicos": FaNotesMedical,
};

const obtenerIconoActividad = (tipo) => ICONOS_ACTIVIDAD[tipo] || FaClock;

const leerHistorial = () => {
  try {
    const guardado = JSON.parse(localStorage.getItem("historialActividades"));
    return Array.isArray(guardado) ? guardado : [];
  } catch {
    return [];
  }
};

function crearPaginas(paginaActual, total) {
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
}

function HeaderHistorial({ onMenu }) {
  return (
    <header className="ha-header">
      <button type="button" className="ha-logo" onClick={onMenu}>
        StepIA
      </button>

      <div className="ha-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="ha-user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

function ResumenActividades({ total, consultas, informes, analisis }) {
  const tarjetas = [
    { etiqueta: "Total de actividades", valor: total, Icono: FaClockRotateLeft },
    { etiqueta: "Consultas programadas", valor: consultas, Icono: FaCalendarCheck },
    { etiqueta: "Informes médicos", valor: informes, Icono: FaFileMedical },
    { etiqueta: "Análisis plantares", valor: analisis, Icono: FaChartLine },
  ];

  return (
    <section className="ha-resumen" aria-label="Resumen de actividades">
      {tarjetas.map(({ etiqueta, valor, Icono }) => (
        <div className="ha-resumen-card" key={etiqueta}>
          <div className="ha-resumen-texto">
            <span>{etiqueta}</span>
            <strong>{valor}</strong>
          </div>

          <div className="ha-resumen-icono" aria-hidden="true">
            <Icono />
          </div>
        </div>
      ))}
    </section>
  );
}

function FiltrosHistorial({
  busqueda,
  onCambioBusqueda,
  onLimpiarBusqueda,
  filtroTipo,
  onCambioFiltro,
}) {
  return (
    <div className="ha-filtros">
      <search className="ha-buscador">
        <label className="sr-only" htmlFor="ha-input-busqueda">
          Buscar actividad
        </label>

        <FaMagnifyingGlass className="ha-buscador-icono" aria-hidden="true" />

        <input
          id="ha-input-busqueda"
          type="search"
          placeholder="Buscar por paciente o actividad..."
          value={busqueda}
          onChange={(e) => onCambioBusqueda(e.target.value)}
        />

        {busqueda && (
          <button
            type="button"
            className="ha-clear"
            aria-label="Limpiar búsqueda"
            onClick={onLimpiarBusqueda}
          >
            <FaXmark aria-hidden="true" />
          </button>
        )}
      </search>

      <div className="ha-select-contenedor">
        <label className="sr-only" htmlFor="ha-select-tipo">
          Filtrar por tipo de actividad
        </label>

        <select
          id="ha-select-tipo"
          value={filtroTipo}
          onChange={(e) => onCambioFiltro(e.target.value)}
        >
          <option value="Todos">Todas las actividades</option>

          {TIPOS_ACTIVIDAD.map((tipo) => (
            <option key={tipo} value={tipo}>
              {tipo}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ActividadItem({ actividad, icono, onEliminar }) {
  return (
    <article className="ha-actividad">
      <div className="ha-actividad-icono" aria-hidden="true">
        {icono}
      </div>

      <div className="ha-actividad-contenido">
        <div className="ha-actividad-arriba">
          <div className="ha-actividad-cabecera">
            <h3>{actividad.tipo}</h3>

            <span className="ha-fecha">
              <FaRegCalendar aria-hidden="true" />
              {actividad.fecha || "Sin fecha"}
              <FaRegClock aria-hidden="true" />
              {actividad.hora || "Sin hora"}
            </span>
          </div>

          <button
            type="button"
            className="ha-eliminar"
            aria-label={`Eliminar actividad: ${actividad.tipo}`}
            onClick={() => onEliminar(actividad.id)}
          >
            <FaTrash aria-hidden="true" />
          </button>
        </div>

        <p className="ha-descripcion">
          {actividad.descripcion || "Sin descripción"}
        </p>

        {actividad.paciente && (
          <div className="ha-paciente">
            <FaUserAlt className="ha-paciente-icono" aria-hidden="true" />
            Paciente:
            <strong>{actividad.paciente}</strong>
          </div>
        )}

        {actividad.detalles && (
          <div className="ha-detalles">{actividad.detalles}</div>
        )}
      </div>
    </article>
  );
}

function ListaActividades({ actividades, onEliminar }) {
  return (
    <section className="ha-lista" aria-label="Lista de actividades del historial">
      {actividades.map((actividad) => (
        <ActividadItem
          key={actividad.id}
          actividad={actividad}
          icono={createElement(obtenerIconoActividad(actividad.tipo))}
          onEliminar={onEliminar}
        />
      ))}
    </section>
  );
}

function PaginacionActividades({ pagina, totalPaginas, onIrAPagina, deshabilitado }) {
  return (
    <nav className="ha-paginacion" aria-label="Paginación de actividades">
      <button
        type="button"
        className="ha-pagina-boton"
        aria-label="Página anterior"
        onClick={() => onIrAPagina(pagina - 1)}
        disabled={deshabilitado || pagina <= 0}
      >
        ‹
      </button>

      {crearPaginas(pagina, totalPaginas).map((itemPagina, indice) =>
        itemPagina.elipsis ? (
          <span
            key={`elipsis-${indice}`}
            className="ha-pagina-elipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={itemPagina.valor}
            type="button"
            className={`ha-pagina-boton${itemPagina.valor === pagina ? " ha-pagina-boton--activa" : ""}`}
            aria-label={`Página ${itemPagina.valor + 1}`}
            aria-current={itemPagina.valor === pagina ? "page" : undefined}
            onClick={() => onIrAPagina(itemPagina.valor)}
            disabled={deshabilitado}
          >
            {itemPagina.valor + 1}
          </button>
        ),
      )}

      <button
        type="button"
        className="ha-pagina-boton"
        aria-label="Página siguiente"
        onClick={() => onIrAPagina(pagina + 1)}
        disabled={deshabilitado || pagina >= totalPaginas - 1}
      >
        ›
      </button>
    </nav>
  );
}

function EstadoCarga() {
  return (
    <div className="ha-carga" role="status" aria-live="polite">
      <span className="ha-carga-spinner" aria-hidden="true" />
      <p>Cargando historial…</p>
    </div>
  );
}

function VacioHistorial({ conBusqueda, onLimpiarFiltros, onIrAlMenu }) {
  return (
    <section className="ha-vacio">
      <div className="ha-vacio-icono" aria-hidden="true">
        <FaClockRotateLeft />
      </div>

      <h2>{conBusqueda ? "Sin resultados" : "No hay actividades"}</h2>

      <p>
        {conBusqueda
          ? "No se encontraron actividades con los filtros aplicados. Ajusta la búsqueda o el tipo para ver más resultados."
          : "Las actividades realizadas dentro del sistema aparecerán aquí."}
      </p>

      {conBusqueda ? (
        <ButtonComponent
          config={{
            name: "limpiar-filtros",
            text: "Limpiar filtros",
            type: "button",
            variant: "blue",
          }}
          onClick={onLimpiarFiltros}
        />
      ) : (
        <ButtonComponent
          config={{
            name: "ir-menu",
            text: "Ir al panel principal",
            type: "button",
            variant: "green",
          }}
          onClick={onIrAlMenu}
        />
      )}
    </section>
  );
}

function Historial() {
  const navigate = useNavigate();

  const [actividades, setActividades] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("Todos");
  const [pagina, setPagina] = useState(0);
  const [confirmarLimpiar, setConfirmarLimpiar] = useState(false);
  const [mensaje, setMensaje] = useState(null);

  useEffect(() => {
    Promise.resolve().then(() => {
      setActividades(leerHistorial());
      setCargando(false);
    });
  }, []);

  useEffect(() => {
    if (!mensaje) return undefined;

    const temporizador = setTimeout(() => setMensaje(null), 4000);

    return () => clearTimeout(temporizador);
  }, [mensaje]);

  const actividadesFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return actividades.filter((actividad) => {
      const coincideTexto =
        !texto ||
        [actividad.tipo, actividad.descripcion, actividad.paciente, actividad.detalles].some(
          (valor) => typeof valor === "string" && valor.toLowerCase().includes(texto),
        );

      const coincideTipo =
        filtroTipo === "Todos" || actividad.tipo === filtroTipo;

      return coincideTexto && coincideTipo;
    });
  }, [actividades, busqueda, filtroTipo]);

  const resumen = useMemo(
    () => ({
      total: actividades.length,
      consultas: actividades.filter(
        (actividad) => actividad.tipo === "Consulta programada",
      ).length,
      informes: actividades.filter(
        (actividad) => actividad.tipo === "Informe médico",
      ).length,
      analisis: actividades.filter(
        (actividad) => actividad.tipo === "Análisis plantar",
      ).length,
    }),
    [actividades],
  );

  const tieneFiltros = busqueda.trim() !== "" || filtroTipo !== "Todos";

  const totalPaginas = Math.max(
    1,
    Math.ceil(actividadesFiltradas.length / TAMANO_PAGINA),
  );
  const paginaSegura = Math.min(pagina, totalPaginas - 1);
  const inicio =
    actividadesFiltradas.length === 0 ? 0 : paginaSegura * TAMANO_PAGINA + 1;
  const fin = Math.min(
    (paginaSegura + 1) * TAMANO_PAGINA,
    actividadesFiltradas.length,
  );
  const actividadesPagina = actividadesFiltradas.slice(inicio - 1, fin);

  const cambiarBusqueda = (valor) => {
    setBusqueda(valor);
    setPagina(0);
  };

  const limpiarBusqueda = () => {
    setBusqueda("");
    setPagina(0);
  };

  const cambiarFiltroTipo = (valor) => {
    setFiltroTipo(valor);
    setPagina(0);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setFiltroTipo("Todos");
    setPagina(0);
  };

  const irAPagina = (nuevaPagina) => {
    if (
      cargando ||
      nuevaPagina === paginaSegura ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setPagina(nuevaPagina);
  };

  const eliminarActividad = (id) => {
    const nuevoHistorial = actividades.filter((actividad) => actividad.id !== id);

    setActividades(nuevoHistorial);

    try {
      localStorage.setItem("historialActividades", JSON.stringify(nuevoHistorial));
      setMensaje({ texto: "Actividad eliminada.", severidad: "success" });
    } catch {
      setMensaje({
        texto: "No se pudo guardar el cambio. Reintenta más tarde.",
        severidad: "error",
      });
    }
  };

  const limpiarHistorial = () => {
    localStorage.removeItem("historialActividades");
    setActividades([]);
    setConfirmarLimpiar(false);
    setPagina(0);
    setMensaje({ texto: "Historial eliminado.", severidad: "success" });
  };

  const renderContenido = () => {
    if (cargando) return <EstadoCarga />;

    if (actividades.length === 0) {
      return <VacioHistorial conBusqueda={false} onIrAlMenu={() => navigate("/menu")} />;
    }

    if (actividadesFiltradas.length === 0) {
      return <VacioHistorial conBusqueda={tieneFiltros} onLimpiarFiltros={limpiarFiltros} />;
    }

    return (
      <>
        <ListaActividades actividades={actividadesPagina} onEliminar={eliminarActividad} />

        {totalPaginas > 1 && (
          <PaginacionActividades
            pagina={paginaSegura}
            totalPaginas={totalPaginas}
            onIrAPagina={irAPagina}
            deshabilitado={cargando}
          />
        )}
      </>
    );
  };

  return (
    <div className="ha-page">
      <HeaderHistorial onMenu={() => navigate("/menu")} />

      <main className="ha-main">
        <section className="ha-titulo" aria-labelledby="ha-titulo-texto">
          <div className="ha-titulo-izq">
            <h1 id="ha-titulo-texto">Historial de Actividades</h1>
            <p>Consulta todas las actividades realizadas dentro del sistema StepIA.</p>
          </div>

          {!cargando && actividades.length > 0 && (
            confirmarLimpiar ? (
              <Collapse in={confirmarLimpiar}>
                <div className="ha-confirm">
                  <Alert
                    variant="filled"
                    severity="warning"
                    role="alert"
                    sx={{ fontWeight: 600, borderRadius: 1.5 }}
                  >
                    ¿Eliminar todo el historial? Esta acción no se puede deshacer.
                  </Alert>

                  <div className="ha-confirm-botones">
                    <ButtonComponent
                      config={{
                        name: "confirmar-limpiar",
                        text: "Sí, eliminar",
                        type: "button",
                        variant: "blue",
                      }}
                      onClick={limpiarHistorial}
                    />

                    <ButtonComponent
                      config={{
                        name: "cancelar-limpiar",
                        text: "Cancelar",
                        type: "button",
                        variant: "white",
                      }}
                      onClick={() => setConfirmarLimpiar(false)}
                    />
                  </div>
                </div>
              </Collapse>
            ) : (
              <button
                type="button"
                className="ha-limpiar"
                onClick={() => setConfirmarLimpiar(true)}
              >
                <FaTrash aria-hidden="true" />
                Limpiar historial
              </button>
            )
          )}
        </section>

        {!cargando && actividades.length > 0 && (
          <ResumenActividades
            total={resumen.total}
            consultas={resumen.consultas}
            informes={resumen.informes}
            analisis={resumen.analisis}
          />
        )}

        <FiltrosHistorial
          busqueda={busqueda}
          onCambioBusqueda={cambiarBusqueda}
          onLimpiarBusqueda={limpiarBusqueda}
          filtroTipo={filtroTipo}
          onCambioFiltro={cambiarFiltroTipo}
        />

        <Collapse in={Boolean(mensaje)}>
          <div className="ha-mensaje" role="status">
            <Alert
              variant="filled"
              severity={mensaje?.severidad || "info"}
              sx={{ fontWeight: 600, borderRadius: 1.5 }}
            >
              {mensaje?.texto}
            </Alert>
          </div>
        </Collapse>

        {!cargando && actividadesFiltradas.length > 0 && (
          <p className="ha-meta" role="status" aria-live="polite">
            Mostrando {inicio}–{fin} de{" "}
            {actividadesFiltradas.length} actividad
            {actividadesFiltradas.length === 1 ? "" : "es"}
            {tieneFiltros ? " (resultados filtrados)" : ""}
          </p>
        )}

        {renderContenido()}
      </main>
    </div>
  );
}

export default Historial;