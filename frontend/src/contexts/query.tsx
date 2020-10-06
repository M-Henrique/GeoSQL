import React, { createContext, useCallback, useState } from 'react';
import api from '../services/api';
import { AxiosRequestConfig } from 'axios';

interface ContextData {
   query: string;
   results: Array<Object>;
   hasGeomValue: boolean;
   loading: boolean;
   submitQuery(query: string): Promise<void>;
   setQueryValue(queryText: string): void;
}

interface Query extends AxiosRequestConfig {
   query: string;
}

const QueryContext = createContext<ContextData>({} as ContextData);

export const QueryProvider: React.FC = ({ children }) => {
   const [query, setQuery] = useState('');
   const [results, setResults] = useState([]);
   const [hasGeomValue, setHasGeomValue] = useState(false);
   const [loading, setLoading] = useState(false);

   const setQueryValue = useCallback((query: string) => {
      setQuery(query);
   }, []);

   const submitQuery = useCallback(async (query: string) => {
      setLoading(true);

      const { data } = await api.post('/results', {
         query,
      } as Query);

      if (data[0].hasOwnProperty('geojson')) {
         setHasGeomValue(true);
      } else {
         setHasGeomValue(false);
      }

      setResults(data);
      setLoading(false);
   }, []);

   return (
      <QueryContext.Provider
         value={{ query, results, hasGeomValue, loading, submitQuery, setQueryValue }}
      >
         {children}
      </QueryContext.Provider>
   );
};

export default QueryContext;
