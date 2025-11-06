import React from 'react';
import { Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/room/:roomId" element={<div>Room Page - Coming Soon</div>} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </div>
  );
}

export default App;