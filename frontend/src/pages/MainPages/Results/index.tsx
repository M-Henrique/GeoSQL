import React, { useContext } from 'react';

import { FiDownload } from 'react-icons/fi';

import ResultsContext from '../../../contexts/results';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function Results() {
   const { rows } = useContext(ResultsContext);

   return (
      <div id="resultsContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="results" />
         </header>

         <div id="mainContainer" className="container">
            <aside className="container">
               <button className="saveResults">
                  <FiDownload className="saveIcon" />
                  JSON
               </button>
               <button className="saveResults">
                  <FiDownload className="saveIcon" />
                  PDF
               </button>
               <button className="saveResults">
                  <FiDownload className="saveIcon" />
                  TXT
               </button>
               <button className="saveResults">
                  <FiDownload className="saveIcon" />
                  CSV
               </button>
            </aside>
            <section id="tableContainer" className="container">
               <table>
                  <thead>
                     <tr>
                        {Object.keys(rows[0]).map((column, index) => {
                           if (column !== 'geom') {
                              return <th key={index}>{column}</th>;
                           }
                        })}
                     </tr>
                  </thead>
                  <tbody>
                     {rows.map((row, index) => {
                        return (
                           <tr key={index}>
                              {Object.values(row).map((value, index) => {
                                 // A tipagem do typescript não aceita a comparação direta por meio da string 'geom'. Como a tipagem estática não pode ser feita (devido às diferentes colunas que virão em cada resultado), o ts-ignore e fez-se necessário).
                                 //@ts-ignore
                                 if (row['geom'] !== value) return <td key={index}>{value}</td>;
                              })}
                           </tr>
                        );
                     })}
                  </tbody>
               </table>
            </section>
         </div>
      </div>
   );
}
