import React from 'react';

import LandingHeader from '../../components/LandingHeader';

import './styles.css';

export default function Contact() {
   return (
      <div id="contactContainer" className="firstContainer container">
         <header>
            <LandingHeader />
         </header>
         <section>
            <h2>Contatos</h2>
            <br />

            <p>Clodoveu Davis: clodoveu@dcc.ufmg.br</p>
            <p>Guilherme Henrique: guilherme@dcc.ufmg.br</p>
            <p>Matheus Henrique: mhenrique@dcc.ufmg.br</p>
         </section>
      </div>
   );
}
