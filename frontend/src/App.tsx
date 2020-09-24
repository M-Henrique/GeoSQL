import React from 'react';

import { TablesProvider } from './contexts/tables';
import { QueryProvider } from './contexts/query';
import { LayersProvider } from './contexts/layers';

import Routes from './routes';

import './assets/styles/globals.css';

function App() {
   return (
      <TablesProvider>
         <QueryProvider>
            <LayersProvider>
               <Routes />
            </LayersProvider>
         </QueryProvider>
      </TablesProvider>
   );
}

export default App;
