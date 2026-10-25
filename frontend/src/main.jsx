import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Planner from './pages/Planner';
import Translator from './pages/Translator';
import FoodExplorer from './pages/FoodExplorer';
import ItineraryDetails from './pages/ItineraryDetails';
import Auth from './pages/Auth';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/itineraryPlanner" element={<Planner />} />
          <Route path="/plan" element={<Planner />} />
          <Route path="/translator" element={<Translator />} />
          <Route path="/foodScanner" element={<FoodExplorer />} />
          <Route path="/food-scanner" element={<FoodExplorer />} />
          <Route path="/food" element={<FoodExplorer />} />
          <Route path="/itinerary" element={<ItineraryDetails />} />
          <Route path="/itinerary/:id" element={<ItineraryDetails />} />
          <Route path="/login" element={<Auth defaultMode="login" />} />
          <Route path="/signup" element={<Auth defaultMode="signup" />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
