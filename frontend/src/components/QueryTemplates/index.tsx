import React, { useContext, useState } from 'react';

import QueryContext from '../../contexts/query';

import './styles.css';

interface ITemplate {
   name: string;
   template: string;
}

export default function QueryTemplates() {
   const { setQuery } = useContext(QueryContext);

   const [templates] = useState<ITemplate[]>([
      {
         name: 'Seleção sem condicionais',
         template: `SELECT {insira os campos que deseja buscar aqui (e.g 'sigla')}

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'estado')}`,
      },
      {
         name: 'Seleção com condicionais',
         template: `SELECT {insira os campos que deseja buscar aqui (e.g 'sigla')}

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'estado')}

WHERE {insira as condições aqui (e.g 'pop2000 > 1000000')}`,
      },
      {
         name: 'União de duas geometrias',
         template: `SELECT ST_UNION({insira os campos geométricos das duas geometrias que deseja unir (e.g 'a.geom, b.geom')}) as geom

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'estado as a, microbrasil as b')}

WHERE {insira as condições aqui (e.g 'a.sigla='MG' and b.regiao = 'Nordeste'')}`,
      },
      {
         name: 'Intercessão de duas geometrias',
         template: `SELECT ST_INTERSECTION({insira os campos geométricos das duas geometrias que deseja marcar a intercessão (e.g 'a.geom, b.geom')}) as geom

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'estado as a, rodovia_br as b')}

WHERE {insira as condições aqui (e.g 'a.sigla='MG' and b.sigla = 'BR-153'')}`,
      },
      {
         name: 'Distância entre duas geometrias',
         template: `SELECT ST_DISTANCE({insira os campos geométricos das duas geometrias cuja distância deseja medir (e.g 'a.geom, b.geom')})

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'refinaria as a, microbrasil as b')}

WHERE {insira as condições aqui (e.g 'a.sigla='REFAP' and b.micro = 11001')}`,
      },
      {
         name: 'Tamanho de uma geometria',
         template: `SELECT ST_LENGTH({insira o campos geométrico da geometria cuja qual deseja medir o tamanho (e.g 'geom')})

FROM {insira as tabelas das quais deseja buscar os campos aqui (e.g 'rodovia_br')}

WHERE {insira as condições aqui (e.g 'sigla='BR-153'')}`,
      },
   ]);

   return (
      <div id="templatesContainer" className="container">
         <span>TEMPLATES</span>
         <ul>
            {templates.map(({ name, template }, index: number) => (
               <li key={index} title={name} onClick={() => setQuery(template)}>
                  {name}
               </li>
            ))}
         </ul>
      </div>
   );
}
