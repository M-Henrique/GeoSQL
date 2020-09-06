import React from 'react';

import { ResultsProvider } from './contexts/results';

import Routes from './routes';

import './assets/styles/globals.css';

function App() {
   return (
      <ResultsProvider>
         <Routes />
      </ResultsProvider>
   );
}

export default App;
