import { useRef } from "react";
import "./AnalisisPlantar.css";
import { FaUserAlt } from "react-icons/fa";
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

function HeaderAnalisis({ onMenu }) {
  return (
    <header className="analisis-header">
      <button type="button" className="analisis-logo" onClick={onMenu}>
        StepIA
      </button>

      <div className="analisis-user" title="Profesional en sesión">
        <span>USUARIO</span>
        <div className="analisis-user-icon" aria-hidden="true">
          <FaUserAlt />
        </div>
      </div>
    </header>
  );
}

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
          No hay pacientes registrados. Regístralo antes de realizar un análisis.
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
            const coincide =
              seleccionado?.idPaciente === paciente.idPaciente;

            return (
              <label
                key={paciente.idPaciente}
                className={`paciente-opcion${coincide ? " paciente-opcion--activa" : ""}`}
              >
                <input
                  type="radio"
                  name="paciente-seleccion"
                  value={paciente.idPaciente}
                  checked={coincide}
                  onChange={() => onSeleccionar(paciente.idPaciente)}
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
    pacientes,
    cargandoPacientes,
    busqueda,
    paginaSegura,
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

  return (
    <div className="analisis-page">
      <HeaderAnalisis onMenu={() => navigate("/menu")} />

      <main className="analisis-main">
        <section className="analisis-card" aria-labelledby="analisis-titulo">
          <h1 id="analisis-titulo">Análisis Plantar</h1>

          <p className="analisis-subtitle">
            Busca y selecciona un paciente registrado para guardar el análisis
            en su informe.
          </p>

          <SelectorPaciente
            cargando={cargandoPacientes}
            hayPacientes={pacientes.length > 0}
            pacientesPagina={pacientesPagina}
            totalPaginas={totalPaginas}
            pagina={paginaSegura}
            onIrAPagina={irAPagina}
            busqueda={busqueda}
            onCambioBusqueda={cambiarBusqueda}
            onLimpiarBusqueda={limpiarBusqueda}
            seleccionado={pacienteSeleccionado}
            onSeleccionar={seleccionarPaciente}
            onRegistrarPaciente={() => navigate("/registro-paciente")}
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
                disabled: pacientes.length === 0,
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
                disabled: pacientes.length === 0,
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
