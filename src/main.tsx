import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register Service Worker for Mobile PWA (iOS & Android)
registerSW({ immediate: true });

createRoot(document.getElementById('root')!).render(<App />);
