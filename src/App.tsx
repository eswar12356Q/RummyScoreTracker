import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GameSetup from './pages/GameSetup';
import Game from './pages/Game';

const App: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Navigate to="/setup" replace />} />
        <Route path="/setup" element={<GameSetup />} />
        <Route path="/game" element={<Game />} />
      </Routes>
    </div>
  );
};

export default App;