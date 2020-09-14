import React, { createContext, useState } from 'react';
import api from '../services/api';

interface ContextData {
   tables: Array<any>;
   tablesColumns: Array<any>;
   getTables(): Promise<void>;
}

const TablesContext = createContext<ContextData>({} as ContextData);

export const TablesProvider: React.FC = ({ children }) => {
   const [tables, setTables] = useState([{}]);
   const [tablesColumns, setTablesColumns] = useState([{}]);

   async function getTables() {
      const {
         data: { tables, tablesColumns },
      } = await api.get('/query');

      setTables(tables);
      setTablesColumns(tablesColumns);
   }

   return (
      <TablesContext.Provider value={{ tables, tablesColumns, getTables }}>
         {children}
      </TablesContext.Provider>
   );
};

export default TablesContext;
