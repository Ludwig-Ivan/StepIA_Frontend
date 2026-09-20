import { BrowserRouter, Routes, Route } from "react-router-dom";
import AgendaConsultas from "../pages/Agenda/AgendaConsultas";
import Login from "../pages/Login/Login";
import Menu from "../pages/Menu/Menu";
import RegistroPaciente from "../pages/RegistroPaciente/RegistroPaciente";
import AnalisisPlantar from "../pages/AnalisisPlantar/AnalisisPlantar";
// import DatosMedicos from '../pages/DatosMedicos/DatosMedicos'
import InformePaciente from "../pages/InformePaciente/InformePaciente";
import ListaPacientes from "../pages/ListaPacientes/ListaPacientes";
import HistorialPaciente from "../pages/HistorialPaciente/HistorialPaciente";
import Historial from "../pages/HistorialActividad/Historial";
import Ajustes from "../pages/Ajustes/Ajustes";
import Soporte from "../pages/Soporte/Soporte";
import Expediente from "../pages/Expediente/Expediente";
import RutaProtegida from "./RutaProtegida";

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/menu"
          element={
            <RutaProtegida>
              <Menu />
            </RutaProtegida>
          }
        />
        <Route
          path="/registro-paciente"
          element={
            <RutaProtegida>
              <RegistroPaciente />
            </RutaProtegida>
          }
        />
        <Route
          path="/analisis-plantar"
          element={
            <RutaProtegida>
              <AnalisisPlantar />
            </RutaProtegida>
          }
        />
        <Route
          path="/historial-paciente"
          element={
            <RutaProtegida>
              <HistorialPaciente />
            </RutaProtegida>
          }
        />
        <Route
          path="/expediente"
          element={
            <RutaProtegida>
              <Expediente />
            </RutaProtegida>
          }
        />
        <Route
          path="/informe-paciente"
          element={
            <RutaProtegida>
              <InformePaciente />
            </RutaProtegida>
          }
        />
        <Route
          path="/lista-pacientes"
          element={
            <RutaProtegida>
              <ListaPacientes />
            </RutaProtegida>
          }
        />
        <Route
          path="/agenda-consultas"
          element={
            <RutaProtegida>
              <AgendaConsultas />
            </RutaProtegida>
          }
        />
        <Route
          path="/historial"
          element={
            <RutaProtegida>
              <Historial />
            </RutaProtegida>
          }
        />
        <Route
          path="/ajustes"
          element={
            <RutaProtegida>
              <Ajustes />
            </RutaProtegida>
          }
        />
        <Route
          path="/soporte"
          element={
            <RutaProtegida>
              <Soporte />
            </RutaProtegida>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;
