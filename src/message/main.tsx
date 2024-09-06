import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppMessage } from './AppMessage.tsx';
import '../tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppMessage />,
  </React.StrictMode>,
);
