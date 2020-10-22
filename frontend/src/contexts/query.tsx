/* Contexto que armazena informações referentes à consulta realizada e aos resultados da mesma, para evitar chamadas repetitivas à api, e permitir que o contexto de layers tenha acesso. */

import React, { createContext, useCallback, useState, Dispatch, SetStateAction } from 'react';

import { AxiosRequestConfig } from 'axios';

import api from '../services/api';

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
            setLoading(false);
         } catch {
            return;
         }
      },
      [firstTime]
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
