import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppEmbed } from './AppEmbed.tsx';
import '../tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppEmbed />
  </React.StrictMode>,
);
