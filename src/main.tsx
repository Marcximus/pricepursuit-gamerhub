
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add console log to help debugging
console.log('Initializing application');

// Make sure we find the root element
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error("Cannot find root element");
  throw new Error("Cannot find root element");
}

// Render the app with error boundaries
try {
  createRoot(rootElement).render(<App />);
  console.log('Application rendered successfully');
} catch (error) {
  console.error('Failed to render application:', error);
}
