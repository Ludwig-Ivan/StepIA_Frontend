import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RutaProtegida from "./RutaProtegida";

const Login = lazy(() => import("../pages/Login/Login"));
const Menu = lazy(() => import("../pages/Menu/Menu"));
const RegistroPaciente = lazy(
  () => import("../pages/RegistroPaciente/RegistroPaciente"),
);
const AnalisisPlantar = lazy(
  () => import("../pages/AnalisisPlantar/AnalisisPlantar"),
);
const InformePaciente = lazy(
  () => import("../pages/InformePaciente/InformePaciente"),
);
const ListaPacientes = lazy(
  () => import("../pages/ListaPacientes/ListaPacientes"),
);
const HistorialPaciente = lazy(
  () => import("../pages/HistorialPaciente/HistorialPaciente"),
);
const Historial = lazy(() => import("../pages/HistorialActividad/Historial"));
const AgendaConsultas = lazy(
  () => import("../pages/Agenda/AgendaConsultas"),
);
const Ajustes = lazy(() => import("../pages/Ajustes/Ajustes"));
const Soporte = lazy(() => import("../pages/Soporte/Soporte"));
const Expediente = lazy(() => import("../pages/Expediente/Expediente"));
const NoEncontrado = lazy(() => import("../pages/NoEncontrado/NoEncontrado"));

function PaginaCargando() {
  return (
    <div className="app-cargando" role="status" aria-live="polite">
      Cargando…
    </div>
  );
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PaginaCargando />}>
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
          <Route path="*" element={<NoEncontrado />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default AppRoutes;
