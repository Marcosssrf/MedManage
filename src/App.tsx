import { Routes, Route } from "react-router-dom";
import "./App.css";
import AppLayout from "./components/AppLayout.tsx";
import Pacientes from "./pages/Pacientes.tsx";
import Medicos from "./pages/Medicos.tsx";
import Consultas from "./pages/Consultas.tsx";

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/pacientes" element={<Pacientes />} />
        <Route path="/medicos" element={<Medicos />} />
        <Route path="/consultas" element={<Consultas />} />
        <Route path="/pagamentos" element={<div>Pagamentos</div>} />
      </Route>
    </Routes>
  );
}

export default App;