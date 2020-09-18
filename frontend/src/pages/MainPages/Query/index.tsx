import React, { useState, useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FiSearch, FiSave, FiHelpCircle } from 'react-icons/fi';
import ClipLoader from 'react-spinners/ClipLoader';

import QueryContext from '../../../contexts/query';
import TablesContext from '../../../contexts/tables';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function Query() {
   const { query, submitQuery, setQueryValue } = useContext(QueryContext);
   const { tables, tablesColumns, loading } = useContext(TablesContext);

   const [queryText, setQueryText] = useState(query);

   const handleQueryTextChange = useCallback(
      (query: string) => {
         setQueryText(query);
         setQueryValue(query);
      },
      [setQueryValue]
   );

   const handleSubmitQuery = useCallback(
      async (queryText: string) => {
         try {
            await submitQuery(queryText);
         } catch {
            return;
         }
      },
      [submitQuery]
   );

   return (
      <div id="queryContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="query" />
         </header>
         <main>
            {/* Não contém className container pois o display flex causa um bug na expansão das tabelas */}
            <div id="schemaContainer">
               {tables.length <= 0 ? (
                  <div id="firstTimeContainer" className="container">
                     <p>Sem tabelas para exibir até o momento.</p>
                     <p>Selecione um banco de dados.</p>
                  </div>
               ) : loading ? (
                  <div id="loadingContainer" className="container">
                     <ClipLoader color={'var(--color-primary-dark)'} size={170} />
                  </div>
               ) : (
                  tables.map((table, index) => {
                     return (
                        <table key={index}>
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
                  })
               )}
            </div>

            <div id="inputsContainer" className="container">
               <div id="textAreaContainer" className="container">
                  <textarea
                     name="query"
                     id="query"
                     placeholder="SELECT * FROM ..."
                     autoFocus
                     value={queryText}
                     onChange={(e) => handleQueryTextChange(e.target.value)}
                  ></textarea>
                  <small>
                     Obs: ao realizar consultas com funções geográficas, como ST_Union por exemplo,
                     utilizar o alias "geom". Ex: SELECT ST_Union(a.geom, b.geom){' '}
                     <strong>as geom</strong> from ...
                  </small>
               </div>

               <div id="buttonsContainer" className="container">
                  <Link
                     to="/results"
                     id="submitQuery"
                     className="queryButton"
                     onClick={() => {
                        handleSubmitQuery(queryText);
                     }}
                  >
                     <FiSearch className="queryIcon" />
                     Pesquisar
                  </Link>
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
