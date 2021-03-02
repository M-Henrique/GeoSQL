/* Contexto que armazena informações referentes à consulta realizada e aos resultados da mesma, para evitar chamadas repetitivas à api, e permitir que o contexto de layers tenha acesso. */

import React, {
   createContext,
   useCallback,
   useState,
   Dispatch,
   SetStateAction,
   useContext,
} from 'react';

import { AxiosRequestConfig } from 'axios';

import api from '../services/api';

import TablesContext from './tables';

interface ContextData {
   firstTime: boolean;

   query: string;
   setQuery: Dispatch<SetStateAction<string>>;
   submitQuery(query: string): Promise<void>;

   results: Array<Object>;
   hasGeomValue: boolean;

   loading: boolean;
}

// Extensão da interface padrão de request do axios para permitir o envio do campo "query".
interface Query extends AxiosRequestConfig {
   query: string;
}

const QueryContext = createContext<ContextData>({} as ContextData);

export const QueryProvider: React.FC = ({ children }) => {
   const { database } = useContext(TablesContext);

   // Flag para identificar se o usuário ainda não fez nenhuma consulta.
   const [firstTime, setFirstTime] = useState(true);
   // Consulta realizada pelo usuário.
   const [query, setQuery] = useState('');
   // Resultados obtidos da consulta.
   const [results, setResults] = useState([]);
   // Flag para identificar se a consulta obteve algum resultado geométrico.
   const [hasGeomValue, setHasGeomValue] = useState(false);
   // Flag ativada durante a chamada à api.
   const [loading, setLoading] = useState(false);

   // Função que realiza o armazenamento da query no histórico.
   const handleQueryHistory = useCallback(() => {
      let queryHistory = sessionStorage.getItem('@geosql/query-history');
      if (queryHistory) {
         let queryHistoryArray = queryHistory.split('@geosqlidentifier@');

         queryHistoryArray.push(query);
         sessionStorage.setItem(
            '@geosql/query-history',
            queryHistoryArray.join('@geosqlidentifier@')
         );
      } else {
         const queryWithIdentifier = query + '@geosqlidentifier@';
         sessionStorage.setItem('@geosql/query-history', queryWithIdentifier);
      }
   }, [query]);

   // Função que realiza a chamda à api, passando a query realizada pelo usuário.
   const submitQuery = useCallback(
      async (query: string) => {
         try {
            setLoading(true);

            if (firstTime) {
               setFirstTime(false);
            }

            const { data } = await api.post('/results', {
               query,
               database,
            } as Query);

            // Checa se os objetos recebidos em resposta possuem a propriedade geométrica, e marca a flag.
            if (data[0]) {
               if (data[0].hasOwnProperty('geojson')) {
                  setHasGeomValue(true);
               } else {
                  setHasGeomValue(false);
               }
            }

            setResults(data);

            handleQueryHistory();

            setLoading(false);
         } catch {
            return;
         }
      },
      [firstTime, handleQueryHistory]
   );

   return (
      <QueryContext.Provider
         value={{ firstTime, query, setQuery, submitQuery, results, hasGeomValue, loading }}
      >
         {children}
      </QueryContext.Provider>
   );
};

export default QueryContext;
