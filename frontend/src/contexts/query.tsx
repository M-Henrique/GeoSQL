import React, { createContext, useState } from 'react';
import api from '../services/api';
import { AxiosRequestConfig } from 'axios';

interface ContextData {
   query: string;
   results: Array<Object>;
   submitQuery(query: string): Promise<void>;
}

interface Query extends AxiosRequestConfig {
   query: string;
}

const QueryContext = createContext<ContextData>({} as ContextData);

export const QueryProvider: React.FC = ({ children }) => {
   const [results, setResults] = useState([{}]);
   const [query, setQuery] = useState('');

   async function submitQuery(query: string) {
      setQuery(query);

      const { data } = await api.post('/results', {
         query,
      } as Query);

      setResults(data);
   }

   return (
      <QueryContext.Provider value={{ query, results, submitQuery }}>
         {children}
      </QueryContext.Provider>
   );
};

export default QueryContext;
