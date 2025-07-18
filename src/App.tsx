import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import LiveDashboard from './components/LiveDashboard';
import TrafficTrendsPage from './components/TrafficTrendsPage';
import ProtocolAnalysisPage from './components/ProtocolAnalysisPage';
import AIAnalysisPage from './components/AIAnalysisPage';
import ContactSection from './components/ContactSection';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <Router>
      <ScrollToTop />
      <div className="min-h-screen bg-slate-900">
        <Navigation />
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSection />
                <LiveDashboard />
              </>
            }
          />
          <Route path="/traffic-trends" element={<TrafficTrendsPage />} />
          <Route path="/protocol-analysis" element={<ProtocolAnalysisPage />} />
          <Route path="/ai-analysis" element={<AIAnalysisPage />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
        <ContactSection />
        <Footer />
      </div>
    </Router>
  );
}

export default App;
