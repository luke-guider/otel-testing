import React from 'react';
import ReactDOM from 'react-dom/client';
import { DiceRoller } from './components/DiceRoller';
import './index.css';
import './instrumentation';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <DiceRoller />
  </React.StrictMode>,
);
