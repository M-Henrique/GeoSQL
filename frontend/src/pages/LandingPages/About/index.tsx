import React from 'react';

import LandingHeader from '../../../components/LandingHeader';

import './styles.css';

export default function About() {
   return (
      <div id="aboutContainer" className="firstContainer container">
         <header>
            <LandingHeader />
         </header>
         <section>
            <h2>Desenvolvimento</h2>
            <br />
            <p>
               O GeoSQL+ foi desenvolvido por <strong>Guilherme Henrique</strong> e ampliado por{' '}
               <strong>Matheus Henrique</strong>, alunos de Iniciação Científica do Departamento de
               Ciência da Computadação da Universidade Federal de Minas Gerais. Este trabalho foi
               realizado sob a orientação do Professor Dr. Clodoveu Davis Jr. e financiado pelo
               PIBIC/CNPq para os próximos alunos da Disciplina de Banco de Dados Geográficos e de
               outras disciplinas correlatas.
            </p>
            <br />

            <p>
               Este site é um sistema com código aberto, sob a licença GNU v2. O propósito do
               desenvolvimento é contar futuramente com a ação colaborativa dos demais alunos que
               utilizarão e que poderão ampliar a abrangência do sistema, criando novas
               funcionalidades, melhorando as já existentes e, principalmente, aprender durante o
               processo.
            </p>
         </section>
      </div>
   );
}
