import { useCallback, useEffect, useRef, useState } from "react";
import "./AnalisisPlantar.css";
import {
  FaCloudArrowUp,
  FaMagnifyingGlass,
  FaShoePrints,
  FaXmark,
} from "react-icons/fa6";
import ButtonComponent from "../../components/buttons/ButtonComponent.jsx";
import Collapse from "@mui/material/Collapse";
import Alert from "@mui/material/Alert";
import useAnalisisPlantar from "./useAnalisisPlantar";
import HeaderComponent from "../../components/generals/HeaderComponent.jsx";
import { obtenerByEmail } from "../../services/profesionalService.js";

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

const identificarPaciente = (paciente) =>
  paciente?.curp || paciente?.idPaciente || paciente?.nss || "";

function SubidaImagen({
  idInput,
  titulo,
  alt,
  preview,
  nombreArchivo,
  onCargar,
}) {
  const inputRef = useRef(null);

  return (
    <div className="pie-upload" role="group" aria-label={`Imagen del ${alt}`}>
      <span className="pie-upload-rotulo">{titulo}</span>

      <div className="pie-box">
        {preview ? (
          <img src={preview} alt={alt} />
        ) : (
          <div className="pie-box-vacio">
            <FaShoePrints className="pie-box-vacio-icono" aria-hidden="true" />
            <span>Sin imagen</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        id={idInput}
        className="sr-only"
        type="file"
        accept="image/*"
        onChange={onCargar}
      />

      <label className="analisis-btn-subir" htmlFor={idInput}>
        <FaCloudArrowUp aria-hidden="true" />
        {preview ? "Cambiar imagen" : "Subir imagen"}
      </label>

      {nombreArchivo && <small className="pie-archivo">{nombreArchivo}</small>}
    </div>
  );
}

function SelectorPaciente({
  cargando,
  hayPacientes,
  pacientesPagina,
  totalPaginas,
  pagina,
  onIrAPagina,
  busqueda,
  onCambioBusqueda,
  onLimpiarBusqueda,
  seleccionado,
  onSeleccionar,
  onRegistrarPaciente,
}) {
  let contenido;

  if (cargando) {
    contenido = (
      <div className="analisis-carga" role="status" aria-live="polite">
        <span
          className="analisis-spinner analisis-spinner--mini"
          aria-hidden="true"
        />
        Cargando pacientes…
      </div>
    );
  } else if (!hayPacientes) {
    contenido = (
      <div className="analisis-aviso" role="status" aria-live="polite">
        <Alert
          variant="filled"
          severity="warning"
          sx={{ fontWeight: 600, borderRadius: 1.5 }}
        >
          No hay pacientes registrados. Regístralo antes de realizar un
          análisis.
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
  } else if (pacientesPagina.length === 0) {
    contenido = (
      <div className="analisis-aviso" role="status" aria-live="polite">
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
  } else {
    contenido = (
      <>
        <div
          className="paciente-lista"
          role="radiogroup"
          aria-label="Pacientes disponibles"
        >
          {pacientesPagina.map((paciente) => {
            const idPaciente = identificarPaciente(paciente);
            const coincide = identificarPaciente(seleccionado) === idPaciente;

            return (
              <label
                key={idPaciente}
                className={`paciente-opcion${coincide ? " paciente-opcion--activa" : ""}`}
              >
                <input
                  type="radio"
                  name="paciente-seleccion"
                  value={idPaciente}
                  checked={coincide}
                  onChange={() => onSeleccionar(idPaciente)}
                />

                <span className="paciente-opcion-marcador" aria-hidden="true" />

                <span className="paciente-opcion-info">
                  <strong>{paciente.nombre || "Sin nombre"}</strong>
                  <small>
                    {paciente.curp || paciente.nss || "Sin registro"}
                    {paciente.fechaNacimiento
                      ? ` • ${paciente.fechaNacimiento}`
                      : ""}
                  </small>
                </span>
              </label>
            );
          })}
        </div>

        {totalPaginas > 1 && (
          <div className="analisis-paginacion">
            <button
              type="button"
              className="analisis-pagina-boton"
              aria-label="Página anterior"
              onClick={() => onIrAPagina(pagina - 1)}
              disabled={pagina <= 0}
            >
              ‹
            </button>

            {crearPaginas(pagina, totalPaginas).map((itemPagina, indice) =>
              itemPagina.elipsis ? (
                <span
                  key={`elipsis-${indice}`}
                  className="analisis-pagina-elipsis"
                  aria-hidden="true"
                >
                  …
                </span>
              ) : (
                <button
                  key={itemPagina.valor}
                  type="button"
                  className={`analisis-pagina-boton${itemPagina.valor === pagina ? " analisis-pagina-boton--activa" : ""}`}
                  aria-label={`Página ${itemPagina.valor + 1}`}
                  aria-current={
                    itemPagina.valor === pagina ? "page" : undefined
                  }
                  onClick={() => onIrAPagina(itemPagina.valor)}
                >
                  {itemPagina.valor + 1}
                </button>
              ),
            )}

            <button
              type="button"
              className="analisis-pagina-boton"
              aria-label="Página siguiente"
              onClick={() => onIrAPagina(pagina + 1)}
              disabled={pagina >= totalPaginas - 1}
            >
              ›
            </button>
          </div>
        )}
      </>
    );
  }

  return (
    <section className="analisis-step" aria-labelledby="analisis-paso-1">
      <h2 id="analisis-paso-1">
        <span className="analisis-step-num" aria-hidden="true">
          1
        </span>
        Seleccionar paciente
      </h2>

      {hayPacientes && (
        <search className="analisis-buscador">
          <label className="sr-only" htmlFor="analisis-input-busqueda">
            Buscar paciente
          </label>

          <FaMagnifyingGlass
            className="analisis-buscador-icono"
            aria-hidden="true"
          />

          <input
            id="analisis-input-busqueda"
            type="search"
            placeholder="Buscar por nombre o número de registro social..."
            value={busqueda}
            onChange={(e) => onCambioBusqueda(e.target.value)}
          />

          {busqueda && (
            <button
              type="button"
              className="analisis-clear"
              aria-label="Limpiar búsqueda"
              onClick={onLimpiarBusqueda}
            >
              <FaXmark aria-hidden="true" />
            </button>
          )}
        </search>
      )}

      {hayPacientes && (
        <div className="analisis-nuevo-paciente">
          <ButtonComponent
            config={{
              name: "registrar-nuevo-paciente",
              text: "Registrar nuevo paciente",
              type: "button",
              variant: "blue",
            }}
            onClick={onRegistrarPaciente}
          />
        </div>
      )}

      {contenido}

      {seleccionado && (
        <div className="paciente-seleccionado" role="status" aria-live="polite">
          Paciente seleccionado: <strong>{seleccionado.nombre}</strong>
        </div>
      )}
    </section>
  );
}

function AnalisisPlantar() {
  const {
    navigate,
    cargandoPacientes,
    busqueda,
    paginaSegura,
    hayPacientes,
    pacienteSeleccionado,
    pieIzquierdo,
    pieDerecho,
    previewIzquierdo,
    previewDerecho,
    resultadoIA,
    tipoPie,
    cargando,
    guardando,
    mensaje,
    totalPaginas,
    pacientesPagina,
    cambiarBusqueda,
    limpiarBusqueda,
    irAPagina,
    seleccionarPaciente,
    cargarImagen,
    analizarPies,
    guardarAnalisis,
  } = useAnalisisPlantar();

  const emailUsuario = localStorage.getItem("UsuarioActivo");
  const [cargandoUser, setCargandoUser] = useState(true);
  const [errorUser, setErrorUser] = useState("");
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
      setErrorUser(
        "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
      );
    } finally {
      setCargandoUser(false);
    }
  }, [emailUsuario, navigate]);

  const reintentarUser = () => {
    setErrorUser("");
    setCargandoUser(true);
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
          setErrorUser(
            "No se pudo cargar la información del profesional. Verifica tu conexión o inténtalo de nuevo.",
          );
      })
      .finally(() => {
        if (activo) setCargandoUser(false);
      });

    return () => {
      activo = false;
    };
  }, [emailUsuario, navigate]);

  if (cargandoUser) {
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

  if (errorUser) {
    return (
      <div className="menu-page">
        <main className="menu-overlay" role="alert">
          <div className="menu-error-card">
            <h1>No se pudo cargar el panel</h1>
            <p>{errorUser}</p>
            <button
              type="button"
              className="btn btn-green"
              onClick={reintentarUser}
            >
              Reintentar
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="analisis-page">
      <HeaderComponent data={{ usuario }} />

      <main className="analisis-main">
        <section className="analisis-card" aria-labelledby="analisis-titulo">
          <h1 id="analisis-titulo">Análisis Plantar</h1>

          <p className="analisis-subtitle">
            Busca y selecciona un paciente registrado para guardar el análisis
            en su informe.
          </p>

          <SelectorPaciente
            cargando={cargandoPacientes}
            hayPacientes={hayPacientes}
            pacientesPagina={pacientesPagina}
            totalPaginas={totalPaginas}
            pagina={paginaSegura}
            onIrAPagina={irAPagina}
            busqueda={busqueda}
            onCambioBusqueda={cambiarBusqueda}
            onLimpiarBusqueda={limpiarBusqueda}
            seleccionado={pacienteSeleccionado}
            onSeleccionar={seleccionarPaciente}
            onRegistrarPaciente={() =>
              navigate("/registro-paciente?origen=analisis")
            }
          />

          <section className="analisis-step" aria-labelledby="analisis-paso-2">
            <h2 id="analisis-paso-2">
              <span className="analisis-step-num" aria-hidden="true">
                2
              </span>
              Imágenes de los pies
            </h2>

            <div className="pies-container">
              <SubidaImagen
                idInput="input-pie-izquierdo"
                titulo="Pie Izquierdo"
                alt="Pie izquierdo"
                preview={previewIzquierdo}
                nombreArchivo={pieIzquierdo?.name}
                onCargar={(e) => cargarImagen(e, "izquierdo")}
              />

              <SubidaImagen
                idInput="input-pie-derecho"
                titulo="Pie Derecho"
                alt="Pie derecho"
                preview={previewDerecho}
                nombreArchivo={pieDerecho?.name}
                onCargar={(e) => cargarImagen(e, "derecho")}
              />
            </div>
          </section>

          <section className="analisis-step" aria-labelledby="analisis-paso-3">
            <h2 id="analisis-paso-3">
              <span className="analisis-step-num" aria-hidden="true">
                3
              </span>
              Resultado del análisis
            </h2>

            <div className="resultado-panel">
              <div className="analisis-campo">
                <label htmlFor="resultado-ia">Resultado IA</label>

                <textarea
                  id="resultado-ia"
                  value={resultadoIA}
                  placeholder="Resultado generado por IA..."
                  aria-readonly="true"
                  readOnly
                />
              </div>

              <div className="analisis-campo">
                <label htmlFor="tipo-pie">Tipo de Pie</label>

                <input
                  id="tipo-pie"
                  type="text"
                  placeholder="Tipo de Pie"
                  value={tipoPie}
                  aria-readonly="true"
                  readOnly
                />
              </div>
            </div>
          </section>

          <Collapse in={Boolean(mensaje)}>
            <div
              className="analisis-mensaje"
              role={mensaje?.severidad === "error" ? "alert" : "status"}
            >
              <Alert
                variant="filled"
                severity={mensaje?.severidad || "info"}
                sx={{ fontWeight: 600, borderRadius: 1.5 }}
              >
                {mensaje?.texto}
              </Alert>
            </div>
          </Collapse>

          {cargando && (
            <div
              className="analisis-estado-ia"
              role="status"
              aria-live="polite"
            >
              <span
                className="analisis-spinner analisis-spinner--mini"
                aria-hidden="true"
              />
              Analizando imágenes con el modelo de IA…
            </div>
          )}

          <div className="analisis-buttons">
            <ButtonComponent
              config={{
                name: "volver",
                text: "Volver",
                type: "button",
                variant: "blue",
              }}
              onClick={() => navigate(-1)}
            />

            <ButtonComponent
              config={{
                name: "analizar",
                text: "Analizar",
                type: "button",
                variant: "green",
                loading: cargando,
                loadingText: "Analizando…",
                disabled: !pacienteSeleccionado,
              }}
              onClick={analizarPies}
            />

            <ButtonComponent
              config={{
                name: "guardar",
                text: "Guardar",
                type: "button",
                variant: "purple",
                loading: guardando,
                loadingText: "Guardando…",
                disabled: !pacienteSeleccionado,
              }}
              onClick={guardarAnalisis}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default AnalisisPlantar;
