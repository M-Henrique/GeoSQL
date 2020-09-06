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
                        <th>Teste</th>
                        <th>Teste</th>
                        <th>Teste</th>
                        <th>Teste</th>
                        <th>Teste</th>
                     </tr>
                  </thead>
                  <tbody>
                     <tr>
                        <td>Teste</td>
                        <td>Teste</td>
                        <td>Teste</td>
                        <td>Teste</td>
                        <td>Teste</td>
                     </tr>
                  </tbody>
               </table>
            </section>
         </div>
      </div>
   );
}
