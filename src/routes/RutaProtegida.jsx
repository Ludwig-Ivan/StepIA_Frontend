import { Navigate, useLocation } from "react-router-dom";
import { haySesionActiva } from "../utils/session";

function RutaProtegida({ children }) {
  const location = useLocation();

  if (!haySesionActiva()) {
    return <Navigate to="/" replace state={{ desde: location.pathname }} />;
  }

  return children;
}

export default RutaProtegida;
