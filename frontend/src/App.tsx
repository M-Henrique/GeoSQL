import React from 'react';

import { TablesProvider } from './contexts/tables';
import { QueryProvider } from './contexts/query';

import Routes from './routes';

import './assets/styles/globals.css';

function App() {
   return (
      <TablesProvider>
         <QueryProvider>
            <Routes />
         </QueryProvider>
      </TablesProvider>
   );
}

export default App;
