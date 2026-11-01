import React from 'react';
import {createRoot} from 'react-dom/client';
import App from './App';
import '../docs/design/tokens.css';
import './style.css';
createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
if(import.meta.env.PROD&&'serviceWorker' in navigator){
  window.addEventListener('load',()=>{navigator.serviceWorker.register('/sw.js').catch(()=>{/* The game remains playable when offline caching is unavailable. */});});
}
