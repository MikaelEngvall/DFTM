import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout/Layout';
import { Home } from './pages/Home';
import './i18n/config';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          {/* Fler routes kommer att läggas till här senare */}
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
