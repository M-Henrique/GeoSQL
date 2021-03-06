import React from 'react';
import { Link } from 'react-router-dom';

import { FiPlayCircle } from 'react-icons/fi';

import LandingHeader from '../../../components/LandingHeader';

import LogoGeoSQL from '../../../assets/images/Logo_GeoSQL.png';
import LogoUFMG from '../../../assets/images/Logo_UFMG.png';
import LogoDCC from '../../../assets/images/Logo_DCC.png';
import LogoCSX from '../../../assets/images/Logo_CSX.png';

import './styles.css';

export default function Landing() {
   return (
      <div id="landingContainer" className="firstContainer container">
         <header>
            <LandingHeader />
         </header>

         <section id="introContainer" className="container">
            <img src={LogoGeoSQL} alt="Logo GeoSQL" />
            <h1>
               Esse é o GeoSQL+, um ambiente online para aprendizado de SQL espacialmente estendido.
               <br />
            </h1>

            <Link to="/query" id="start">
               <FiPlayCircle id="startIcon" />
               Iniciar
            </Link>
         </section>

         <footer>
            <a href="https://www.dcc.ufmg.br/dcc/" target="_blank" rel="noopener noreferrer">
               <img src={LogoDCC} alt="Logo DCC" />
            </a>
            <a
               href="https://www.dcc.ufmg.br/dcc/?q=pt-br/LabCS%2BX"
               target="_blank"
               rel="noopener noreferrer"
            >
               <img src={LogoCSX} alt="Logo CSX" />
            </a>
            <a href="https://ufmg.br/" target="_blank" rel="noopener noreferrer">
               <img src={LogoUFMG} alt="Logo UFMG" />
            </a>
         </footer>
      </div>
   );
}
