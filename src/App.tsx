import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Routines } from './pages/Routines';
import { Rooms } from './pages/Rooms';
import { Teachers } from './pages/Teachers';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/routines" element={<Routines />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/teachers" element={<Teachers />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
