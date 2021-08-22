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

export type Result = {
   [key: string]: string | number;
};

export interface IQueryHistory {
   query: string;
   success: boolean;
}

interface ContextData {
   firstTime: boolean;

   query: string;
   setQuery: Dispatch<SetStateAction<string>>;
   submitQuery(query: string): Promise<void>;

   queryHistory: IQueryHistory[];
   handleDeletePastQuery: (pastQuery: string) => void;

   results: Result[];
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
   const [results, setResults] = useState<Result[]>([]);
   // Flag para identificar se a consulta obteve algum resultado geométrico.
   const [hasGeomValue, setHasGeomValue] = useState(false);
   // Flag ativada durante a chamada à api.
   const [loading, setLoading] = useState(false);
   // Estado que armazena o histórico de queries, filtrado para não incluir os resultados vazios do método split, e revertido para ser visualizado corretamente.
   const [queryHistory, setQueryHistory] = useState<IQueryHistory[]>([]);
   // Valor que armazena a ordem das consultas (para identificar cada consulta no histórico e evitar a exclusão de consultas duplicadas).
   const [pastQueryIdentifier, setPastQueryIdentifier] = useState(1);

   // Função que realiza o armazenamento da query no histórico.
   const handleQueryHistory = useCallback(
      (success: boolean) => {
         let queryHistoryCopy = [...queryHistory].reverse();
         queryHistoryCopy.push({ query: `${pastQueryIdentifier} - ${query}`, success });
         setQueryHistory([...queryHistoryCopy].reverse());

         setPastQueryIdentifier(pastQueryIdentifier + 1);
      },
      [query, queryHistory, pastQueryIdentifier]
   );

   // Função que deleta uma query passada.
   const handleDeletePastQuery = useCallback(
      (pastQuery: string) => {
         setQueryHistory([...queryHistory].filter(({ query }) => query !== pastQuery));
      },
      [setQueryHistory, queryHistory]
   );

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

            handleQueryHistory(typeof data !== 'string' ? true : false);

            setLoading(false);
         } catch {
            return;
         }
      },
      [firstTime, handleQueryHistory, database]
   );

   return (
      <QueryContext.Provider
         value={{
            firstTime,
            query,
            setQuery,
            submitQuery,
            queryHistory,
            handleDeletePastQuery,
            results,
            hasGeomValue,
            loading,
         }}
      >
         {children}
      </QueryContext.Provider>
   );
};

export default QueryContext;
