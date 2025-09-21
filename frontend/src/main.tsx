import { createRoot } from 'react-dom/client'
import React from 'react'
import App from './App.tsx'
import './main.css'

// createRoot(document.getElementById("root")!).render(<App />);

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
