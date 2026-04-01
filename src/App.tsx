import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Layout from "./components/AppLayout";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Consultas from "./pages/Consultas";
import Pagamentos from "./pages/Pagamentos";
import Dashboard from "./pages/Dashboard";
import Usuarios from "./pages/Usuarios";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={
          <ProtectedRoute roles={["ADMIN", "SECRETARIA", "MEDICO"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="pacientes" element={
          <ProtectedRoute roles={["ADMIN", "SECRETARIA", "MEDICO"]}>
            <Pacientes />
          </ProtectedRoute>
        } />
        <Route path="medicos" element={
          <ProtectedRoute roles={["ADMIN", "SECRETARIA"]}>
            <Medicos />
          </ProtectedRoute>
        } />
        <Route path="consultas" element={
          <ProtectedRoute roles={["ADMIN", "SECRETARIA", "MEDICO"]}>
            <Consultas />
          </ProtectedRoute>
        } />
        <Route
          path="pagamentos"
          element={
            <ProtectedRoute roles={["ADMIN", "SECRETARIA"]}>
              <Pagamentos />
            </ProtectedRoute>
          }
        />
        <Route path="usuarios" element={
          <ProtectedRoute roles={["ADMIN"]}>
            <Usuarios />
          </ProtectedRoute>
        } />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}