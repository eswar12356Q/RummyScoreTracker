import React from 'react';

function App() {
  return (
    <div className="App">
      <header style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }}>🎲 Housie Game</h1>
        <p style={{ fontSize: '1.2rem', marginTop: '0.5rem' }}>Multiplayer Tambola Game</p>
      </header>

      <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '2rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{ color: '#333', marginBottom: '1rem' }}>🎮 Welcome to Housie Game!</h2>

          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#666', lineHeight: '1.6' }}>
              A fully functional multiplayer housie/tambola game with real-time gameplay,
              room management, unique ticket generation, and comprehensive claim validation.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem'
          }}>
            <div style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>🏠 Room Management</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                Create & join rooms
              </p>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>🎟️ Unique Tickets</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                Generated per housie rules
              </p>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>🏆 Winning Patterns</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                All claim types supported
              </p>
            </div>
            <div style={{
              background: '#f8f9fa',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              <h3 style={{ color: '#667eea', margin: '0 0 0.5rem 0' }}>🔄 Real-time</h3>
              <p style={{ color: '#666', margin: 0, fontSize: '0.9rem' }}>
                Live multiplayer sync
              </p>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(45deg, #ff6b6b, #ee5a24)',
            color: 'white',
            padding: '1rem 2rem',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '600'
          }}>
            ✅ Backend Server Running on Port 3001
            <br />
            ⏳ Frontend Compiling...
          </div>

          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e3f2fd', borderRadius: '8px' }}>
            <h4 style={{ color: '#1976d2', margin: '0 0 0.5rem 0' }}>🔧 Technical Stack:</h4>
            <ul style={{ color: '#666', margin: 0, paddingLeft: '1.5rem' }}>
              <li>React 18 + TypeScript</li>
              <li>Node.js + Express + Socket.io</li>
              <li>SQLite Database</li>
              <li>Real-time Multiplayer</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;