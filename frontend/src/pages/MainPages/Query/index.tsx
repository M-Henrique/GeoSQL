import React, { useContext, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { FiTrash2, FiDownload, FiSearch, FiSave, FiHelpCircle } from 'react-icons/fi';
import ClipLoader from 'react-spinners/ClipLoader';

import QueryContext, { IQueryHistory } from '../../../contexts/query';
import TablesContext from '../../../contexts/tables';

import TabsMenu from '../../../components/TabsMenu';
import QueryTemplates from '../../../components/QueryTemplates';

import './styles.css';

export default function Query() {
   const { query, setQuery, submitQuery, queryHistory, handleDeletePastQuery } =
      useContext(QueryContext);
   const { database, databases, tables, tablesColumns, getTables, loading } =
      useContext(TablesContext);

   // Função que salva o histórico de queries em um arquivo txt.
   const handleSaveHistory = useCallback(() => {
      // Formato semelhante a uma lista de exercícios.
      let queryList = '';
      queryHistory.forEach((pastQuery) => {
         queryList += `${pastQuery}\n\n`;
      });

      const file = new Blob([queryList], { type: 'text/plain' });
      const fileName = `History.txt`;

      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, [queryHistory]);

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

   // Função que muda o banco de dados selecionado.
   const handleChangeDatabase = useCallback(() => {
      const database = (document.getElementById('databaseSelector')! as HTMLSelectElement).value;

      getTables(database);
   }, [getTables]);

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
                     <p>Sem tabelas para exibir.</p>
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
               <div id="historyContainer" className="container">
                  <div id="history" className="container">
                     <ul>
                        {queryHistory?.map(({ query, success }: IQueryHistory, index) => (
                           <li
                              key={index}
                              title={query}
                              style={{ color: success ? 'green' : 'red' }}
                              onClick={() => setQuery(query.substr(query.indexOf('-') + 1).trim())}
                           >
                              <span>{query}</span>{' '}
                              <FiTrash2 size={14} onClick={() => handleDeletePastQuery(query)} />
                           </li>
                        ))}
                     </ul>
                  </div>

                  <button onClick={handleSaveHistory}>
                     {' '}
                     <FiDownload size={20} />
                     Baixar histórico
                  </button>
               </div>

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
                     Obs: ao realizar consultas com funções geográficas, utilizar o alias "geom".
                     Ex: SELECT ST_Union(a.geom, b.geom) <strong>as geom</strong> from ...
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

               <QueryTemplates />

               <div id="databaseSelectionContainer" className="container">
                  <span>Escolha o banco de dados:</span>
                  <select
                     name="databases"
                     id="databaseSelector"
                     value={database}
                     onChange={handleChangeDatabase}
                  >
                     {databases.map((database, index) => {
                        const databaseName = database.replace('geosql_', '');

                        return (
                           <option key={index} value={database}>
                              {databaseName}
                           </option>
                        );
                     })}
                  </select>
               </div>
            </div>
         </main>
      </div>
   );
}
