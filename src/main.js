import { initPortalApp } from './app.js';
import './styles/main.css';

const container = document.getElementById('app');
if (container) {
  initPortalApp(container);
}
