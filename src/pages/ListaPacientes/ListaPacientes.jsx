import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ListaPacientes.css";
import { getPacientes } from "../../services/pacienteService";
import { FaUserAlt } from "react-icons/fa";
import { FaPen, FaRegFileLines, FaMagnifyingGlass, FaUsers } from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";

const TAMANO_PAGINA = 10;

function formatearFecha(valor) {
  if (!valor) return "Sin fecha";

  const fecha = new Date(`${valor}T00:00:00`);

  if (Number.isNaN(fecha.getTime())) return "Sin fecha";

  return fecha.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

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

function ListaHeader({ onVolverMenu }) {
  return (
    <header className="lista-header">
      <button
        type="button"
        className="lista-logo"
        onClick={onVolverMenu}
      >
        StepIA
      </button>

      <div className="lista-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

function BuscadorPacientes({ busqueda, onCambio, onBuscar, deshabilitado }) {
  return (
    <search className="buscador">
      <label className="label-buscador" htmlFor="input-busqueda">
        Buscar paciente
      </label>

      <div className="buscador-campo">
        <input
          id="input-busqueda"
          testid="input-search"
          type="search"
          placeholder="Buscar por nombre o CURP..."
          value={busqueda}
          onChange={(e) => onCambio(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onBuscar();
            }
          }}
        />

        <button
          type="button"
          testid="btn-search"
          className="btn-buscar"
          aria-label="Buscar pacientes"
          onClick={onBuscar}
          disabled={deshabilitado}
        >
          <FaMagnifyingGlass aria-hidden="true" />
        </button>
      </div>
    </search>
  );
}

function PacienteRow({ paciente, onEditar, onVerHistorial }) {
  const nombreCompleto =
    [paciente.nombre, paciente.apellidoPaterno, paciente.apellidoMaterno]
      .filter(Boolean)
      .join(" ") || "Sin nombre";

  return (
    <tr>
      <td className="nombre-paciente">
        <span className="nombre-paciente-texto">{nombreCompleto}</span>
        {paciente.sexo && (
          <small className="nombre-paciente-sexo">{paciente.sexo}</small>
        )}
      </td>

      <td>{paciente.curp || "Sin CURP"}</td>

      <td>{formatearFecha(paciente.fechaNacimiento)}</td>

      <td>{paciente.telefono || "Sin teléfono"}</td>

      <td className="acciones">
        <button
          type="button"
          testid={`btn-editar-${paciente.curp}`}
          className="btn-editar"
          onClick={() => onEditar(paciente.curp)}
        >
          <FaPen aria-hidden="true" />
          Editar
        </button>

        <button
          type="button"
          testid={`btn-historial-${paciente.curp}`}
          className="btn-historial"
          onClick={() => onVerHistorial(paciente.curp)}
        >
          <FaRegFileLines aria-hidden="true" />
          Historial
        </button>
      </td>
    </tr>
  );
}

function ContenidoTabla({
  cargando,
  error,
  pacientes,
  termino,
  onEditar,
  onVerHistorial,
  onRegistrar,
}) {
  if (cargando && pacientes.length === 0) {
    return (
      <div className="estado-carga" role="status" aria-live="polite">
        <span className="carga-spinner" aria-hidden="true" />
        <p>Cargando pacientes…</p>
      </div>
    );
  }

  if (error) return null;

  if (pacientes.length === 0) {
    return (
      <div className="estado-vacio">
        <div className="estado-vacio-icono" aria-hidden="true">
          <FaUsers />
        </div>
        <strong>
          {termino
            ? `No se encontraron pacientes para “${termino}”`
            : "No hay pacientes registrados"}
        </strong>
        <span>
          {termino
            ? "Revisa el término o intenta con otra búsqueda."
            : "Registra al primer paciente para comenzar."}
        </span>

        {!termino && (
          <ButtonComponent
            config={{
              name: "registrar",
              text: "Registrar paciente",
              type: "button",
              variant: "green",
            }}
            onClick={onRegistrar}
          />
        )}
      </div>
    );
  }

  return (
    <table className="tabla-pacientes">
      <caption className="sr-only">Lista de pacientes registrados</caption>

      <thead>
        <tr>
          <th scope="col">Paciente</th>
          <th scope="col">CURP</th>
          <th scope="col">Fecha de nacimiento</th>
          <th scope="col">Teléfono</th>
          <th scope="col">Acciones</th>
        </tr>
      </thead>

      <tbody>
        {pacientes.map((paciente) => (
          <PacienteRow
            key={paciente.curp}
            paciente={paciente}
            onEditar={onEditar}
            onVerHistorial={onVerHistorial}
          />
        ))}
      </tbody>
    </table>
  );
}

function PaginacionPacientes({
  pagina,
  totalPaginas,
  onIrAPagina,
  deshabilitado,
}) {
  return (
    <nav className="paginacion" aria-label="Paginación de pacientes">
      <button
        type="button"
        className="btn-pagina"
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
            className="pagina-elipsis"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={itemPagina.valor}
            type="button"
            className={`btn-pagina${itemPagina.valor === pagina ? " btn-pagina--activa" : ""}`}
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
        className="btn-pagina"
        aria-label="Página siguiente"
        onClick={() => onIrAPagina(pagina + 1)}
        disabled={deshabilitado || pagina >= totalPaginas - 1}
      >
        ›
      </button>
    </nav>
  );
}

function ListaPacientes() {
  const navigate = useNavigate();
  const solicitudActual = useRef(0);

  const [busqueda, setBusqueda] = useState("");
  const [termino, setTermino] = useState("");
  const [pagina, setPagina] = useState(0);
  const [pacientes, setPacientes] = useState([]);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [totalElementos, setTotalElementos] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");

  const consultarPacientes = useCallback((terminoBusqueda, paginaBusqueda) => {
    const idSolicitud = ++solicitudActual.current;

    getPacientes(terminoBusqueda, paginaBusqueda, TAMANO_PAGINA)
      .then((data) => {
        if (idSolicitud !== solicitudActual.current) return;

        const totalPaginasServidor = data.totalPages || 1;

        setPacientes(data.content || []);
        setTotalPaginas(totalPaginasServidor);
        setTotalElementos(data.totalElements ?? 0);
        setPagina(Math.min(paginaBusqueda, totalPaginasServidor - 1));
      })
      .catch(() => {
        if (idSolicitud !== solicitudActual.current) return;

        setError(
          "No se pudo cargar la lista de pacientes. Verifica tu conexión e inténtalo de nuevo.",
        );
        setPacientes([]);
        setTotalPaginas(1);
        setTotalElementos(0);
      })
      .finally(() => {
        if (idSolicitud === solicitudActual.current) {
          setCargando(false);
        }
      });
  }, []);

  useEffect(() => {
    consultarPacientes(termino, pagina);
  }, [consultarPacientes, termino, pagina]);

  const buscar = () => {
    const nuevoTermino = busqueda.trim();

    if (nuevoTermino === termino && pagina === 0) return;

    setError("");
    setCargando(true);
    setTermino(nuevoTermino);
    setPagina(0);
  };

  const irAPagina = (nuevaPagina) => {
    if (
      cargando ||
      nuevaPagina === pagina ||
      nuevaPagina < 0 ||
      nuevaPagina >= totalPaginas
    ) {
      return;
    }

    setError("");
    setCargando(true);
    setPagina(nuevaPagina);
  };

  const reintentar = () => {
    setError("");
    setCargando(true);
    consultarPacientes(termino, pagina);
  };

  const editarPaciente = (idPaciente) => {
    localStorage.setItem("idPaciente", idPaciente);
    navigate("/informe-paciente");
  };

  const verHistorial = (idPaciente) => {
    localStorage.setItem("idPaciente", idPaciente);
    navigate("/historial-paciente");
  };

  const inicio = totalElementos === 0 ? 0 : pagina * TAMANO_PAGINA + 1;
  const fin = Math.min((pagina + 1) * TAMANO_PAGINA, totalElementos);

  const textoResultados = totalElementos
    ? `Mostrando ${inicio}–${fin} de ${totalElementos} paciente${totalElementos === 1 ? "" : "s"}${termino ? ` para “${termino}”` : ""}`
    : "";

  return (
    <div className="lista-page">
      <ListaHeader onVolverMenu={() => navigate("/menu")} />

      <main className="lista-main">
        <section className="lista-card" aria-labelledby="lista-titulo">
          <div className="lista-top">
            <div className="lista-titulo">
              <h3 id="lista-titulo">Lista de Pacientes</h3>
              <p>Busca, consulta y gestiona los expedientes de tus pacientes.</p>
            </div>

            <BuscadorPacientes
              busqueda={busqueda}
              onCambio={setBusqueda}
              onBuscar={buscar}
              deshabilitado={cargando}
            />
          </div>

          <Collapse in={Boolean(error)}>
            <div className="lista-error">
              <Alert
                variant="filled"
                severity="error"
                role="alert"
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                {error}
              </Alert>
              <ButtonComponent
                config={{
                  name: "reintentar",
                  text: "Reintentar",
                  type: "button",
                  variant: "white",
                  disabled: cargando,
                }}
                onClick={reintentar}
              />
            </div>
          </Collapse>

          {!error && textoResultados && (
            <p className="resultados-meta" role="status" aria-live="polite">
              {textoResultados}
            </p>
          )}

          <div className="tabla-contenedor">
            <ContenidoTabla
              cargando={cargando}
              error={Boolean(error)}
              pacientes={pacientes}
              termino={termino}
              onEditar={editarPaciente}
              onVerHistorial={verHistorial}
              onRegistrar={() => navigate("/registro-paciente")}
            />
          </div>

          {cargando && pacientes.length > 0 && (
            <p className="carga-ligera" role="status" aria-live="polite">
              <span className="carga-spinner carga-spinner--mini" aria-hidden="true" />
              Cargando…
            </p>
          )}

          {totalPaginas > 1 && pacientes.length > 0 && (
            <PaginacionPacientes
              pagina={pagina}
              totalPaginas={totalPaginas}
              onIrAPagina={irAPagina}
              deshabilitado={cargando}
            />
          )}

          <div className="lista-buttons">
            <ButtonComponent
              config={{
                name: "volver",
                text: "Volver",
                type: "button",
                variant: "blue",
                disabled: cargando,
              }}
              onClick={() => navigate("/menu")}
            />

            <span className="pagina-contador" aria-live="polite">
              {totalElementos > 0
                ? `Página ${pagina + 1} de ${totalPaginas}`
                : ""}
            </span>

            <ButtonComponent
              config={{
                name: "nuevo",
                text: "Registrar paciente",
                type: "button",
                variant: "green",
                disabled: cargando,
              }}
              onClick={() => navigate("/registro-paciente")}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default ListaPacientes;