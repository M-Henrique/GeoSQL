import React from 'react';
import { Link } from 'react-router-dom';

import { FiSearch, FiSave, FiHelpCircle } from 'react-icons/fi';

import LandingHeader from '../../components/LandingHeader';

import './styles.css';

export default function Query() {
   return (
      <div id="queryContainer" className="firstContainer container">
         <header>
            <LandingHeader />
         </header>
         <main>
            {/* Não contém className container pois o display flex causa um bug na expansão das tabelas */}
            <div id="schemaContainer">
               <table>
                  <caption>Estado</caption>
                  <tbody>
                     <tr>
                        <td>Nome</td>
                        <td>Sigla</td>
                        <td>UF</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                        <td>Extensão</td>
                     </tr>
                  </tbody>
               </table>
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
                  <Link to="/results" id="submitQuery" className="queryButton">
                     <FiSearch className="queryIcon" />
                     Iniciar
                  </Link>
                  <Link to="" id="saveQuery" className="queryButton">
                     <FiSave className="queryIcon" />
                     Salvar
                  </Link>
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