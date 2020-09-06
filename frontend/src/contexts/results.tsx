import React, { createContext, useState } from 'react';
import api from '../services/api';
import { AxiosRequestConfig } from 'axios';

interface ResultsContextData {
   rows: Array<Object>;
   submitQuery(): Promise<void>;
}

interface Query extends AxiosRequestConfig {
   queryText: string;
}

const ResultsContext = createContext<ResultsContextData>({} as ResultsContextData);

export const ResultsProvider: React.FC = ({ children }) => {
   const [results, setResults] = useState([{}]);

   async function submitQuery() {
      const { data } = await api.post('/results', {
         queryText: `SELECT * FROM estado`,
      } as Query);

      setResults(data);
   }

   return (
      <ResultsContext.Provider value={{ rows: results, submitQuery }}>
         {children}
      </ResultsContext.Provider>
   );
};

export default ResultsContext;
