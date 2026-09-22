import { useNavigate } from "react-router-dom";
import "./NoEncontrado.css";

function NoEncontrado() {
  const navigate = useNavigate();

  return (
    <main className="no-encontrado">
      <div className="no-encontrado-card">
        <p className="no-encontrado-codigo" aria-hidden="true">
          404
        </p>
        <h1>Página no encontrada</h1>
        <p className="no-encontrado-texto">
          La dirección a la que intentas acceder no existe o fue movida.
        </p>
        <button
          type="button"
          className="no-encontrado-boton"
          onClick={() => navigate("/menu")}
        >
          Volver al menú
        </button>
      </div>
    </main>
  );
}

export default NoEncontrado;
