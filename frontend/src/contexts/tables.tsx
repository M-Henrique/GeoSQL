/* Contexto que armazena as tabelas recebidas do banco, para evitar chamadas repetitivas à api. */

import React, { createContext, useCallback, useEffect, useState } from 'react';

import api from '../services/api';

interface ContextData {
   database: string;

   tables: Array<any>;
   tablesColumns: Array<any>;
   getTables(database: string): Promise<void>;

   loading: boolean;
}

const TablesContext = createContext<ContextData>({} as ContextData);

export const TablesProvider: React.FC = ({ children }) => {
   // Banco de dados selecionado atualmente.
   const [database, setDatabase] = useState(
      sessionStorage.getItem('@geosql/selected-database')
         ? sessionStorage.getItem('@geosql/selected-database')!
         : 'brasil'
   );
   // Tabelas (para facilitar indexação).
   const [tables, setTables] = useState([]);
   // Tabelas com suas respectivas colunas.
   const [tablesColumns, setTablesColumns] = useState([]);
   // Flag ativada enquanto a chamada à api é realizada.
   const [loading, setLoading] = useState(false);

   // Função que realiza a chamada à api, para recuperar as tabelas do banco.
   const getTables = useCallback(async (database: string) => {
      try {
         setLoading(true);

         sessionStorage.setItem('@geosql/selected-database', database);
         setDatabase(database);

         const {
            data: { tables, tablesColumns },
         } = await api.get('/query', { params: { database } });

         setTables(tables);
         setTablesColumns(tablesColumns);

         setLoading(false);
      } catch {
         return;
      }
   }, []);

   useEffect(() => {
      getTables(database);
      // eslint-disable-next-line
   }, [getTables]);

   return (
      <TablesContext.Provider value={{ database, tables, tablesColumns, getTables, loading }}>
         {children}
      </TablesContext.Provider>
   );
};

export default TablesContext;
