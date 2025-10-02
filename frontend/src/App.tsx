import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuctionProvider } from './contexts/AuctionContext';
import Layout from './layouts/Layout';
import AuctionPage from './pages/AuctionPage';
import TeamsPage from './pages/TeamsPage';
import PlayersPage from './pages/PlayersPage';
import UnsoldPage from './pages/UnsoldPage';
import ResultsPage from './pages/ResultsPage';
import './App.css';

function App() {
  return (
    <Router>
      <AuctionProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<AuctionPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/players" element={<PlayersPage />} />
            <Route path="/unsold" element={<UnsoldPage />} />
            <Route path="/results" element={<ResultsPage />} />
          </Routes>
        </Layout>
      </AuctionProvider>
    </Router>
  );
}

export default App;
