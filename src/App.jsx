import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import CanvasBuilder from './pages/CanvasBuilder';
import Diagnostic from './pages/Diagnostic';
import Integration from './pages/Integration';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/builder/:id?" element={<CanvasBuilder />} />
        <Route path="/diagnostic/:id?" element={<Diagnostic />} />
        <Route path="/integration/:id?" element={<Integration />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
