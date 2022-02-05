/* Contexto que armazena as tabelas recebidas do banco, para evitar chamadas repetitivas à api. */
import React, { createContext, useCallback, useEffect, useRef, useState } from 'react';

import api from '../services/api';

interface ITemplate {
   item: string;

   group: string;
   title: string;
   prototype: string;
   description: string;
}

interface ContextData {
   database: string;

   databases: Array<string>;

   tables: Array<any>;
   tablesColumns: Array<any>;
   getTables(database: string): Promise<void>;

   templates: Array<ITemplate>;

   loading: boolean;
}

const TablesContext = createContext<ContextData>({} as ContextData);

export const TablesProvider: React.FC = ({ children }) => {
   /**Referência que mantém o status de renderização do componente, para evitar vazamentos de memória em tarefas assíncronas realizadas em componentes já desmontados */
   const isMounted = useRef(true);

   // Banco de dados selecionado atualmente.
   const [database, setDatabase] = useState(
      sessionStorage.getItem('@geosql/selected-database')
         ? sessionStorage.getItem('@geosql/selected-database')!
         : 'geosql_brasil'
   );
   // Bancos de dados.
   const [databases, setDatabases] = useState<string[]>([]);
   // Tabelas (para facilitar indexação).
   const [tables, setTables] = useState([]);
   // Templates.
   const [templates, setTemplates] = useState<ITemplate[]>([]);
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

         if (!isMounted.current) return;

         setTables(tables);
         setTablesColumns(tablesColumns);

         setLoading(false);
      } catch {
         return;
      }
   }, []);

   // Função que realiza a chamada à api, para recuperar os bancos de dados disponíveis para a aplicação.
   const getDatabases = useCallback(async () => {
      const {
         data: { databases },
      } = await api.get('/databases', { params: { database } });

      if (!isMounted.current) return;

      const allDatabases: string[] = databases.map(
         (database: { datname: string }) => database.datname
      );

      setDatabases([...allDatabases]);
   }, [database]);

   // Função que realiza a chamada à api, para recuperar os bancos de dados disponíveis para a aplicação.
   const getTemplates = useCallback(async () => {
      const {
         data: { templates },
      } = await api.get('/templates');

      if (!isMounted.current) return;

      const allTemplates: ITemplate[] = templates.map((template: { [key: string]: any }) => {
         return {
            item: template.item,
            group: template.grupo,
            title: template.titulo,
            prototype: template.proto,
            description: template.descr,
         };
      });

      setTemplates([...allTemplates]);
   }, []);

   useEffect(() => {
      getTables(database);
      getDatabases();
      getTemplates();

      return () => {};
      // eslint-disable-next-line
   }, [getTables, getDatabases, getTemplates]);

   /**Atualiza a referência para indicar que o componente foi desmontado */
   useEffect(() => {
      return () => {
         isMounted.current = false;
      };
   }, []);

   return (
      <TablesContext.Provider
         value={{ database, databases, tables, tablesColumns, getTables, templates, loading }}
      >
         {children}
      </TablesContext.Provider>
   );
};

export default TablesContext;
