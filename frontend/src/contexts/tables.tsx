import React, { createContext, useCallback, useState } from 'react';
import api from '../services/api';

interface ContextData {
   tables: Array<any>;
   tablesColumns: Array<any>;
   loading: boolean;
   getTables(): Promise<void>;
}

const TablesContext = createContext<ContextData>({} as ContextData);

export const TablesProvider: React.FC = ({ children }) => {
   const [tables, setTables] = useState([]);
   const [tablesColumns, setTablesColumns] = useState([]);
   const [loading, setLoading] = useState(false);

   const getTables = useCallback(async () => {
      setLoading(true);
      const {
         data: { tables, tablesColumns },
      } = await api.get('/query');

      setTables(tables);
      setTablesColumns(tablesColumns);
      setLoading(false);
   }, []);

   return (
      <TablesContext.Provider value={{ tables, tablesColumns, loading, getTables }}>
         {children}
      </TablesContext.Provider>
   );
};

export default TablesContext;
