import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Sidebar from './components/sidebar/sidebar';
import './index.css'
// import './styles/sidebar.css';

createRoot(document.getElementById('sidebar-root')!).render(
  <StrictMode>
    <Sidebar />
  </StrictMode>
);