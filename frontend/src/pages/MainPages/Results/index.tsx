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
   const { results, loading } = useContext(QueryContext);

   const handleSaveResults = useCallback(
      (format: string) => {
         const content = JSON.stringify(results);

         let file = null;
         let fileName = '';
         
         switch (format) {
            case 'json':
               file = new Blob([content], { type: 'application/json' });
               fileName = `Results.json`;
               break;
            case 'pdf':
               file = new jsPDF();
               autoTable(file, { html: '#resultsTable', styles: { lineWidth: 0.2 } });
               file.save('Results.pdf');
               return;
            case 'txt':
               file = new Blob([content], { type: 'text/plain' });
               fileName = `Results.txt`;
               break;
            case 'csv':
               const table = document.getElementById('resultsTable') as HTMLTableElement;
               let csvContent = '';

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

               file = new Blob([csvContent], { type: 'text/plain' });
               fileName = `Results.csv`;
               break;
            default:
               break;
         }
         const downloadUrl = URL.createObjectURL(file);

         const downloadLink = document.createElement('a');
         downloadLink.download = fileName;
         downloadLink.href = downloadUrl;
         downloadLink.click();
      },
      [results]
   );

   return (
      <div id="resultsContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="results" />
         </header>

         <div id="mainContainer" className="container">
            <aside className="container">
               <button className="saveResults" onClick={() => handleSaveResults('json')}>
                  <FiDownload className="saveIcon" />
                  JSON
               </button>
               <button className="saveResults" onClick={() => handleSaveResults('pdf')}>
                  <FiDownload className="saveIcon" />
                  PDF
               </button>
               <button className="saveResults" onClick={() => handleSaveResults('txt')}>
                  <FiDownload className="saveIcon" />
                  TXT
               </button>
               <button className="saveResults" onClick={() => handleSaveResults('csv')}>
                  <FiDownload className="saveIcon" />
                  CSV
               </button>
            </aside>
            <section id="tableContainer" className="container">
               {loading ? (
                  <div id="loadingContainer" className="container">
                     <ClipLoader color={'var(--color-primary-dark)'} size={220} />
                  </div>
               ) : results.length <= 0 ? (
                  <div id="firstTimeContainer" className="container">
                     <p>Nenhum resultado a ser exibido até o momento.</p>{' '}
                     <p>Vá até a aba "consulta" e realize uma consulta.</p>{' '}
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
                              if (column !== 'geom' && column !== 'geojson') {
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
                                    // A tipagem do typescript não aceita a comparação direta por meio da string 'geom'. Como a tipagem estática não pode ser feita (devido às diferentes colunas que virão em cada resultado), o ts-ignore fez-se necessário).
                                    //@ts-ignore
                                    if (row['geom'] !== value && row['geojson'] !== value)
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
