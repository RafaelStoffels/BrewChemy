import { Routes, Route } from 'react-router-dom';
import Login from './Pages/Login/Login';
// Import outros componentes de páginas se tiver
import 'react-toastify/dist/ReactToastify.css';
import './Styles/global.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      {/* exemplo de outras rotas */}
      {/* <Route path="/dashboard" element={<Dashboard />} /> */}
    </Routes>
  );
}

export default App;
