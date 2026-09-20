import { useEffect, useState } from "react";
import "./HeaderComponentStyle.css";

function EstadoConexion() {
  const [enLinea, setEnLinea] = useState(
    typeof navigator !== "undefined" ? navigator.onLine : true,
  );

  useEffect(() => {
    const alConectar = () => setEnLinea(true);
    const alDesconectar = () => setEnLinea(false);

    window.addEventListener("online", alConectar);
    window.addEventListener("offline", alDesconectar);

    return () => {
      window.removeEventListener("online", alConectar);
      window.removeEventListener("offline", alDesconectar);
    };
  }, []);

  return (
    <div className="connection-status" role="status" aria-live="polite">
      <span
        className={`connection-dot${enLinea ? "" : " connection-dot--offline"}`}
        aria-hidden="true"
      />
      <span>{enLinea ? "Conectado" : "Sin conexión"}</span>
    </div>
  );
}

export default EstadoConexion;
