import { useNavigate } from "react-router-dom";
import "./HeaderComponentStyle.css";
import { cerrarSesion } from "../../utils/session";
import EstadoConexion from "./EstadoConexion";
import PerfilMenu from "./PerfilMenu";
import Logo from "../../assets/images/Logo.svg";

/**
 * @param {Object} props
 * @param {Object} props.data
 * @param {Object} props.data.usuario
 * @param {React.ReactNode} [props.childrenLeft]
 * @param {React.ReactNode} [props.childrenRigth]
 */
function HeaderComponent({ childrenLeft, childrenRigth, data }) {
  const { usuario } = data;
  const navigate = useNavigate();

  const cerrarSesionYVolver = () => {
    cerrarSesion();
    navigate("/");
  };

  return (
    <header className="top-menu">
      <div className="top-menu-left">
        {/* <img src={Logo} height={40} /> */}
        <button
          type="button"
          className="top-logo"
          onClick={() => navigate("/menu")}
        >
          StepIA
        </button>

        <EstadoConexion />

        {childrenLeft}
      </div>

      <div className="top-menu-right">
        {childrenRigth}

        <PerfilMenu
          usuario={usuario}
          onEditar={() => navigate("/ajustes")}
          onSalir={cerrarSesionYVolver}
        />
      </div>
    </header>
  );
}

export default HeaderComponent;
