// Torna possível o retorno do map apenas em condicionais.
/* eslint-disable array-callback-return */

import React, { useCallback, useContext } from 'react';

import { FiDownload } from 'react-icons/fi';
import { ClipLoader } from 'react-spinners';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

import QueryContext from '../../../contexts/query';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function Results() {
   const { firstTime, results, loading } = useContext(QueryContext);

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

   return (
      <div id="resultsContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="results" />
         </header>

         <div id="mainContainer" className="container">
            <aside className="container">
               <button className="saveResults" onClick={handleSaveResultsJson}>
                  <FiDownload className="saveIcon" />
                  JSON
               </button>
               <button className="saveResults" onClick={handleSaveResultsPdf}>
                  <FiDownload className="saveIcon" />
                  PDF
               </button>
               <button className="saveResults" onClick={handleSaveResultsTxt}>
                  <FiDownload className="saveIcon" />
                  TXT
               </button>
               <button className="saveResults" onClick={handleSaveResultsCsv}>
                  <FiDownload className="saveIcon" />
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
                           {Object.keys(results[0]).map((column, index) => {
                              if (column !== 'geojson') {
                                 return <th key={index}>{column}</th>;
                              }
                           })}
                        </tr>
                     </thead>
                     <tbody>
                        {results.map((row, index) => {
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
