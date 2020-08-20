import React from 'react';
import { Link } from 'react-router-dom';

import GitHubIcon from '../../assets/images/GitHub-Mark-32px.png';

import './styles.css';

export default function LandingHeader() {
   return (
      <nav id="linksList" className="firstContainer container">
         <div id="localLinks" className="container">
            <Link to="/" id="homeLink" className="link">
               GeoSQL+
            </Link>
            <Link to="about" id="aboutLink" className="link">
               Sobre
            </Link>
            <Link to="contact" id="contactLink" className="link">
               Contato
            </Link>
         </div>
         <div id="exteriorLinks" className="container">
            <div id="githubLink" className="link container">
               <a
                  href="https://github.com/M-Henrique/GeoSQL"
                  target="_blank"
                  rel="noopener noreferrer"
               >
                  <img src={GitHubIcon} alt="Ícone Github" />
               </a>
            </div>
         </div>
      </nav>
   );
}
