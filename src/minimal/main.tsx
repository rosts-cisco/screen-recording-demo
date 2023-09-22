import React from 'react';
import ReactDOM from 'react-dom/client';
import { AppMinimal } from './AppMinimal.tsx';
import '../tailwind.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AppMinimal />,
  </React.StrictMode>,
);
