import './App.css';
import ComplaintForm from './ComplaintForm';
import DashboardAdmin from './DashboardAdmin';
import Login from './Login';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ComplaintForm />} />
  <Route path="/admin" element={<DashboardAdmin />} />
  <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
