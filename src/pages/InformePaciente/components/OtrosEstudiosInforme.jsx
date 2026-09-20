import { LiaEyeSolid } from "react-icons/lia";
import { FaTrashCan } from "react-icons/fa6";
import { FcOpenedFolder } from "react-icons/fc";

function OtrosEstudiosInforme({
  estudios,
  mensajeEstudios,
  confirmaEliminarId,
  onSubir,
  onVer,
  onEliminar,
  onSolicitarEliminar,
}) {
  return (
    <div className="otros-estudios">
      <div className="otros-estudios-header">
        <div>
          <h4>Otros Estudios</h4>
          <p>
            Agrega estudios adicionales del paciente, como radiografías,
            análisis clínicos, resonancias u otros documentos.
          </p>
        </div>

        <button
          type="button"
          className="btn-subir-estudio controles-estudio-pdf"
          onClick={() =>
            document.getElementById("input-estudio-adicional")?.click()
          }
        >
          Subir otro estudio
        </button>
        <input
          id="input-estudio-adicional"
          className="input-archivo-oculto"
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          aria-label="Subir otro estudio"
          onChange={onSubir}
        />
      </div>

      {mensajeEstudios && (
        <p
          className={`mensaje-estudios mensaje-estudios--${mensajeEstudios.tipo}`}
          role={mensajeEstudios.tipo === "error" ? "alert" : "status"}
        >
          {mensajeEstudios.texto}
        </p>
      )}

      {estudios.length === 0 ? (
        <div className="sin-estudios">
          <div className="sin-estudios-icono" aria-hidden="true">
            <FcOpenedFolder />
          </div>
          <strong>No hay otros estudios</strong>
          <span>Los archivos que agregues aparecerán aquí.</span>
        </div>
      ) : (
        <div className="lista-estudios">
          {estudios.map((estudio) => (
            <div className="estudio-item" key={estudio.id}>
              <div className="estudio-icono" aria-hidden="true">
                {estudio.tipo === "application/pdf" ? "📄" : "🖼️"}
              </div>

              <div className="estudio-datos">
                <strong>{estudio.nombre}</strong>
                <span>
                  {estudio.fecha}
                  {" • "}
                  {estudio.hora}
                </span>
                <span>{(estudio.tamaño / 1024 / 1024).toFixed(2)} MB</span>
              </div>

              <div className="estudio-acciones controles-estudio-pdf">
                <button
                  type="button"
                  className="btn-ver-estudio"
                  onClick={() => onVer(estudio)}
                >
                  <LiaEyeSolid /> Ver
                </button>

                {confirmaEliminarId === estudio.id ? (
                  <div className="confirma-estudio">
                    <span>¿Eliminar?</span>
                    <button
                      type="button"
                      className="btn-confirmar-eliminar"
                      onClick={() => onEliminar(estudio.id)}
                    >
                      Sí
                    </button>
                    <button
                      type="button"
                      className="btn-cancelar-eliminar"
                      onClick={() => onSolicitarEliminar(null)}
                    >
                      No
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="btn-eliminar-estudio"
                    aria-label={`Eliminar ${estudio.nombre}`}
                    onClick={() => onSolicitarEliminar(estudio.id)}
                  >
                    <FaTrashCan />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default OtrosEstudiosInforme;
