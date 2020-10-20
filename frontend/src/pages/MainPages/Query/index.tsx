import React, { useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FiSearch, FiSave, FiHelpCircle } from 'react-icons/fi';
import ClipLoader from 'react-spinners/ClipLoader';

import QueryContext from '../../../contexts/query';
import TablesContext from '../../../contexts/tables';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function Query() {
   const { query, setQuery, submitQuery } = useContext(QueryContext);
   const { tables, tablesColumns, loading } = useContext(TablesContext);

   // Função que submete a consulta do usuário.
   const handleSubmitQuery = useCallback(async () => {
      try {
         await submitQuery(query);
      } catch {
         return;
      }
   }, [query, submitQuery]);

   // Função que salva a consulta em um arquivo txt.
   const handleSaveQuery = useCallback(() => {
      const query = document.getElementById('query')!.innerHTML;

      const file = new Blob([query], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = `Query.txt`;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, []);

   return (
      <div id="queryContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="query" />
         </header>
         <main>
            {/* Não contém className container pois o display flex causa um bug na expansão das tabelas */}
            <div id="schemaContainer">
               {loading ? (
                  <div id="loadingContainer" className="container">
                     <ClipLoader color={'var(--color-primary-dark)'} size={170} />
                  </div>
               ) : tables.length <= 0 ? (
                  <div id="firstTimeContainer" className="container">
                     <p>Sem tabelas para exibir até o momento.</p>
                     <p>Selecione um banco de dados.</p>
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
                     value={query}
                     onChange={(e) => setQuery(e.target.value)}
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
                     onClick={handleSubmitQuery}
                  >
                     <FiSearch className="queryIcon" />
                     Pesquisar
                  </Link>
                  <button id="saveQuery" className="queryButton" onClick={handleSaveQuery}>
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
