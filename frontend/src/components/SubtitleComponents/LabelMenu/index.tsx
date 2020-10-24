/*------------------------------------------------------------------------------------------------------------------------
|  A tipagem do Openlayers sofre um bug so utilizar a função getStyle,                                                   |
|     da VectorLayer. Apesar de, no arquivo "C:\Apache24\htdocs\TCC\frontend\node_modules\@types\ol\style\Style.d.ts"    |
|        o retorno ser especificado como "Style", por algum motivo esse retorno não é reconhecido, forçando a utilização |
|           de @ts-ignore por diversas vezes ao longo do arquivo.                                                        |
|                                                                                                                        |
|                                                                                                                        |
|                                                                                                                        |
------------------------------------------------------------------------------------------------------------------------*/

import React, { useCallback } from 'react';

import VectorLayer from 'ol/layer/Vector';

import './styles.css';

interface LabelMenuProps {
   layer: VectorLayer;
}

const LabelMenu: React.FC<LabelMenuProps> = ({ layer }) => {
   const source = layer.getSource();
   const features = source.getFeatures();

   const handleLabel = useCallback(
      (labelIdentifier: number) => {
         const newLabel = (document.getElementById(
            `labelPicker${labelIdentifier}`
         ) as HTMLLIElement)
            .getAttribute('value')!
            .toString();

         // Atualiza o texto de cada feature baseado na label que foi passada.
         features.forEach((feature) => {
            feature
               .getStyle()
               //@ts-ignore
               .getText()
               .setText(newLabel === '' ? '' : feature.get('info')[newLabel].toString());
         });

         source.changed();
      },
      [features, source]
   );

   return (
      <ul className="labelMenu menu container">
         <li
            id={`labelPicker-1`}
            className="label"
            value={''}
            style={{ color: '#A83232' }}
            onClick={() => handleLabel(-1)}
         >
            {' '}
            VAZIO{' '}
         </li>
         {layer.get('labels').map((label: string, index: number) => (
            <li
               key={index}
               id={`labelPicker${index}`}
               className="label"
               value={label}
               onClick={() => handleLabel(index)}
            >
               {label}
            </li>
         ))}
      </ul>
   );
};

export default LabelMenu;
