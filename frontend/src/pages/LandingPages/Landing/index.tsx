import React, { useContext } from 'react';
import { Link } from 'react-router-dom';

import { FiPlayCircle } from 'react-icons/fi';

import TablesContext from '../../../contexts/tables';

import LandingHeader from '../../../components/LandingHeader';

import Logo from '../../../assets/images/logGeosqlplus743x232.png';

import './styles.css';

export default function Landing() {
   const { getTables } = useContext(TablesContext);

   async function handleGetTables() {
      await getTables();
   }

   return (
      <div id="landingContainer" className="firstContainer container">
         <header>
            <LandingHeader />
         </header>

         <section id="introContainer" className="container">
            <img src={Logo} alt="Logo GeoSQL" />
            <h1>
               Esse é o GeoSQL+, um ambiente online para aprendizado de SQL espacialmente estendido.
               <br />
               Escolha um Banco de Dados para começar:
            </h1>

            <div id="databaseSelection" className="container">
               <select name="Banco">
                  <option value="Brasil">Brasil</option>
               </select>
               <Link to="/query" id="start" onClick={handleGetTables}>
                  <FiPlayCircle id="startIcon" />
                  Iniciar
               </Link>
            </div>
         </section>

         <footer>
            <a href="https://www.dcc.ufmg.br/dcc/" target="_blank" rel="noopener noreferrer">
               Departamento de Ciência da Computação
            </a>{' '}
            -{' '}
            <a href="https://ufmg.br/" target="_blank" rel="noopener noreferrer">
               UFMG
            </a>
         </footer>
      </div>
   );
}
