import { Controller } from "react-hook-form";
import { PIES } from "../useInformePaciente";

function PanelAnalisisIA({
  control,
  imgPieIzq64,
  imgPieDer64,
  analisisPieIzq,
  analisisPieDer,
  mensajeIA,
  cargando,
  onCargarImagen,
  onAnalizar,
}) {
  return (
    <section className="ai-panel" aria-label="Análisis con IA">
      <div className="ai-panel-header">
        <span>Análisis AI</span>
      </div>

      <div className="ai-layout">
        <div className="ai-pies-columna">
          <div className="pies-grid">
            {PIES.map((pie) => {
              const imagenPreview =
                pie.tipo === "izquierdo" ? imgPieIzq64 : imgPieDer64;

              return (
                <div className="upload-pie-card" key={pie.key}>
                  <label htmlFor={`input-${pie.key}`}>
                    {pie.etiqueta}
                  </label>

                  <div className="imagen-pie">
                    {imagenPreview ? (
                      <img src={imagenPreview} alt={pie.alt} />
                    ) : (
                      <span>Sin imagen</span>
                    )}
                  </div>

                  <Controller
                    name={pie.key}
                    control={control}
                    render={({ field }) => (
                      <>
                        <button
                          type="button"
                          className="btn-subir-imagen"
                          onClick={() =>
                            document
                              .getElementById(`input-${pie.key}`)
                              ?.click()
                          }
                        >
                          Subir imagen
                        </button>
                        <input
                          id={`input-${pie.key}`}
                          className="input-archivo-oculto"
                          type="file"
                          accept="image/*"
                          data-testid={
                            pie.tipo === "izquierdo"
                              ? "input-pie-izquierdo"
                              : "input-pie-derecho"
                          }
                          onChange={(e) => {
                            onCargarImagen(e, pie.tipo, field.onChange);
                          }}
                        />
                      </>
                    )}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="ai-resultados-columna">
          <div className="campo resultado-ia-box">
            <label htmlFor="resultadoIA">Resultado dado por IA</label>

            <textarea
              id="resultadoIA"
              className="lista-box campo-bloqueado"
              name="resultadoIA"
              placeholder="Resultado generado por IA..."
              value={`Pie Izq (${analisisPieIzq.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieIzq.confidence ?? "?"} 
                    \nPie Der (${analisisPieDer.className ?? "?"}) -> Porcentaje de Confianza: %${analisisPieDer.confidence ?? "?"}`}
              readOnly
            ></textarea>
          </div>

          {mensajeIA && (
            <p className="ai-aviso" role="alert">
              {mensajeIA}
            </p>
          )}
        </div>
      </div>

      <div className="boton-analizar-informe">
        <button
          type="button"
          data-testid="boton-analizar-informe"
          onClick={onAnalizar}
          disabled={cargando}
          aria-busy={cargando}
        >
          {cargando ? "Analizando..." : "Analizar con IA"}
        </button>
      </div>
    </section>
  );
}

export default PanelAnalisisIA;
