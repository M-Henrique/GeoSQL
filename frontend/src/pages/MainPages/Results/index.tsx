// Torna possível o retorno do map apenas em condicionais.
/* eslint-disable array-callback-return */

import React, { useContext, useState, useCallback, useEffect } from 'react';

import { FaDownload, FaCaretUp, FaCaretDown } from 'react-icons/fa';
import { ClipLoader } from 'react-spinners';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import QueryContext, { Result } from '../../../contexts/query';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

interface ISortableResults {
   sortOrientation: Array<'ascendant' | 'descendant' | 'unordered'>;
   results: Result[];
}

export default function Results() {
   const { firstTime, results, loading } = useContext(QueryContext);

   // Variável que mantém o mesmo array de resultados obtido da consulta, mas que pode ser modificado sem comprometer a funcionalidade do resto do sistema.
   const [sortableResults, setSortableResults] = useState<ISortableResults>({
      sortOrientation: ['unordered'],
      results,
   });

   // Função que ordena a exibição dos resultados baseado no rótulo clicado.
   const handleSortResults = useCallback(
      (label: string, index: number) => {
         const { sortOrientation } = sortableResults;

         let newSortOrientation = [...sortOrientation];

         newSortOrientation.fill('unordered');

         newSortOrientation[index] =
            sortOrientation[index] === 'ascendant'
               ? 'descendant'
               : sortOrientation[index] === 'descendant'
               ? 'ascendant'
               : 'ascendant';

         const sortedResults = sortableResults.results.sort((a, b) => {
            if (newSortOrientation[index] === 'descendant') {
               return a[label] < b[label] ? 1 : -1;
            } else {
               return a[label] > b[label] ? 1 : -1;
            }
         });

         setSortableResults({ sortOrientation: newSortOrientation, results: sortedResults });
      },
      [sortableResults, setSortableResults]
   );

   // Funções que salvam os resultados em diferentes formatos.
   const handleSaveResultsJson = useCallback(() => {
      const content = JSON.stringify(results);

      const file = new Blob([content], { type: 'application/json' });
      const fileName = `Results.json`;

      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, [results]);

   const handleSaveResultsPdf = useCallback(() => {
      const file = new jsPDF();

      autoTable(file, { html: '#resultsTable', styles: { lineWidth: 0.2 } });

      file.save('Results.pdf');
   }, []);

   const handleSaveResultsTxt = useCallback(() => {
      const content = JSON.stringify(results);

      const file = new Blob([content], { type: 'text/plain' });
      const fileName = `Results.txt`;

      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, [results]);

   const handleSaveResultsCsv = useCallback(() => {
      const table = document.getElementById('resultsTable') as HTMLTableElement;
      let csvContent = '';

      // Formatação CSV.
      for (let i = 0, row; (row = table.rows[i]); i++) {
         for (let j = 0, col; (col = row.cells[j]); j++) {
            if (j === row.cells.length - 1) {
               csvContent += col.innerHTML.toString();
               continue;
            }

            csvContent += `${col.innerHTML.toString()}, `;
         }

         csvContent += '\n';
      }

      const file = new Blob([csvContent], { type: 'text/plain' });
      const fileName = `Results.csv`;

      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = fileName;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, []);

   useEffect(() => {
      setSortableResults({ sortOrientation: [], results: [...results] });
   }, [results]);

   return (
      <div id="resultsContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="results" />
         </header>

         <div id="mainContainer" className="container">
            <aside className="container">
               <button className="saveResults" onClick={handleSaveResultsJson}>
                  <FaDownload className="saveIcon" />
                  JSON
               </button>
               <button className="saveResults" onClick={handleSaveResultsPdf}>
                  <FaDownload className="saveIcon" />
                  PDF
               </button>
               <button className="saveResults" onClick={handleSaveResultsTxt}>
                  <FaDownload className="saveIcon" />
                  TXT
               </button>
               <button className="saveResults" onClick={handleSaveResultsCsv}>
                  <FaDownload className="saveIcon" />
                  CSV
               </button>
            </aside>
            <section id="tableContainer" className="container">
               {loading ? (
                  <div id="loadingContainer" className="container">
                     <ClipLoader color={'var(--color-primary-dark)'} size={220} />
                  </div>
               ) : firstTime ? (
                  <div id="firstTimeContainer" className="container">
                     <p>Nenhum resultado a ser exibido até o momento.</p>{' '}
                     <p>Vá até a aba "consulta" e realize uma consulta.</p>{' '}
                  </div>
               ) : results.length <= 0 ? (
                  <div id="firstTimeContainer" className="container">
                     <p>Nenhum resultado a ser exibido.</p>{' '}
                     <p>Verifique a consulta e tente novamente.</p>{' '}
                  </div>
               ) : typeof results === 'string' ? (
                  <div id="errorContainer" className="container">
                     <p>Error:</p>
                     <p>{results}</p>
                  </div>
               ) : (
                  <table id="resultsTable">
                     <thead>
                        <tr>
                           {Object.keys(sortableResults.results[0]).map((column, index) => {
                              if (column !== 'geojson') {
                                 return (
                                    <th
                                       key={index}
                                       onClick={() => handleSortResults(column, index)}
                                    >
                                       {column}{' '}
                                       {sortableResults.sortOrientation[index] === 'ascendant' ? (
                                          <FaCaretDown />
                                       ) : (
                                          sortableResults.sortOrientation[index] ===
                                             'descendant' && <FaCaretUp />
                                       )}
                                    </th>
                                 );
                              }
                           })}
                        </tr>
                     </thead>
                     <tbody>
                        {sortableResults.results.map((row, index) => {
                           return (
                              <tr key={index}>
                                 {Object.values(row).map((value, index) => {
                                    if (row['geojson'] !== value)
                                       return <td key={index}>{value}</td>;
                                 })}
                              </tr>
                           );
                        })}
                     </tbody>
                  </table>
               )}
            </section>
         </div>
      </div>
   );
}
