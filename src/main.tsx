
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './styles/sidebar.css'

createRoot(document.getElementById("root")!).render(<App />);

// Register service worker for offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered: ', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed: ', error);
      });
  });
}
