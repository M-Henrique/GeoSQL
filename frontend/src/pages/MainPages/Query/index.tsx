import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';

import { FiSearch, FiSave, FiHelpCircle } from 'react-icons/fi';

import api from '../../../services/api';
import ResultsContext from '../../../contexts/results';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function Query() {
   // Nomes de tabelas e suas respectivas colunas
   const [tablesColumns, setTablesColumns] = useState<any[]>([]);
   // Nomes de tabelas apenas (para facilitar a iteração)
   const [tables, setTables] = useState<any[]>([]);

   const { submitQuery } = useContext(ResultsContext);

   useEffect(() => {
      api.get('/query').then(({ data: { tablesColumns, tables } }) => {
         setTablesColumns(tablesColumns);
         setTables(tables);
      });
   }, []);

   async function handleSubmitQuery() {
      await submitQuery();
   }

   return (
      <div id="queryContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="query" />
         </header>
         <main>
            {/* Não contém className container pois o display flex causa um bug na expansão das tabelas */}
            <div id="schemaContainer">
               {tables.map((table) => {
                  return (
                     <table key={table.name}>
                        <caption>{table.name}</caption>
                        <tbody>
                           <tr>
                              {tablesColumns
                                 .filter((column) => column.table === table.name)
                                 .map((filteredColumn, index) => (
                                    <td key={index}>{filteredColumn.name}</td>
                                 ))}
                           </tr>
                        </tbody>
                     </table>
                  );
               })}
            </div>

            <div id="inputsContainer" className="container">
               <div id="textAreaContainer" className="container">
                  <textarea name="query" id="queryText" placeholder="SELECT * FROM ..."></textarea>
                  <small>
                     Obs: ao realizar consultas com funções geográficas, como ST_Union por exemplo,
                     utilizar o alias "geom". Ex: SELECT ST_Union(a.geom, b.geom){' '}
                     <strong>as geom</strong> from ...
                  </small>
               </div>

               <div id="buttonsContainer" className="container">
                  <span onClick={handleSubmitQuery}>
                     <Link to="/results" id="submitQuery" className="queryButton">
                        <FiSearch className="queryIcon" />
                        Pesquisar
                     </Link>
                  </span>
                  <button id="saveQuery" className="queryButton">
                     <FiSave className="queryIcon" />
                     Salvar
                  </button>
                  <Link to="/help" id="helpPageButton" className="queryButton">
                     <FiHelpCircle className="queryIcon" />
                     Ajuda
                  </Link>
               </div>
            </div>
         </main>
      </div>
   );
}
