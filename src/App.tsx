import { Routes, Route, Navigate } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Login from "./pages/Login";
import Layout from "./components/AppLayout";
import Pacientes from "./pages/Pacientes";
import Medicos from "./pages/Medicos";
import Consultas from "./pages/Consultas";
import Pagamentos from "./pages/Pagamentos";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={
        <PrivateRoute>
          <Layout />
        </PrivateRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="pacientes" element={<Pacientes />} />
        <Route path="medicos" element={<Medicos />} />
        <Route path="consultas" element={<Consultas />} />
        <Route path="pagamentos" element={<Pagamentos />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}