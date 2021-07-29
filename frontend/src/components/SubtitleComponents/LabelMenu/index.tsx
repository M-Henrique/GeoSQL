/*------------------------------------------------------------------------------------------------------------------------
|  A tipagem do Openlayers sofre um bug so utilizar a função getStyle,                                                   |
|     da VectorLayer. Apesar de, no arquivo "__dirname\node_modules\@types\ol\style\Style.d.ts"    |
|        o retorno ser especificado como "Style", por algum motivo esse retorno não é reconhecido, forçando a utilização |
|           de @ts-ignore por diversas vezes ao longo do arquivo.                                                        |
|                                                                                                                        |
|                                                                                                                        |
|                                                                                                                        |
------------------------------------------------------------------------------------------------------------------------*/

import React, { useCallback, useState } from 'react';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';

import { FaPlus, FaTextHeight, FaMinus } from 'react-icons/fa';

import './styles.css';

interface LabelMenuProps {
   layer: VectorLayer<VectorSource<any>>;
}

const LabelMenu: React.FC<LabelMenuProps> = ({ layer }) => {
   // Estado de utilidade. Estado utilizado para indicar ao react que o valor dos inputs foi atualizado (utilizando o set), o que faz com que o react renderize novamente o componente em questão.
   // Ex: ao alterar o input de cor, usamos o setColor para dizer ao react que o input mudou, fazendo com que ele altere o input visualmente e renderize-o novamente.
   const [, setColor] = useState<string>();

   const source = layer.getSource();
   const features = source.getFeatures();

   const handleLabelTextSize = useCallback(
      (operator: '+' | '-') => {
         //@ts-ignore
         const oldSize = features[0].getStyle()!.getText().getFont().split('p')[0];

         switch (operator) {
            case '+':
               features.forEach((feature) => {
                  feature
                     .getStyle()!
                     //@ts-ignore
                     .getText()
                     .setFont(`${Number(oldSize) + 1}px roboto`);
               });

               source.changed();
               break;

            case '-':
               features.forEach((feature) => {
                  feature
                     .getStyle()!
                     //@ts-ignore
                     .getText()
                     .setFont(`${Number(oldSize) - 1}px roboto`);
               });

               source.changed();
               break;

            default:
               break;
         }
      },
      [source, features]
   );

   const handleLabelColor = useCallback(() => {
      const newColor = (
         document.getElementById(`labelColorPicker${layer.get('id')}`)! as HTMLInputElement
      ).value;

      // Atualiza o texto de cada feature baseado na label que foi passada.
      features.forEach((feature) => {
         feature
            .getStyle()!
            //@ts-ignore
            .getText()
            .getFill()
            .setColor(newColor);
      });

      source.changed();
      setColor(newColor);
   }, [features, layer, source]);

   const handleLabelText = useCallback(
      (labelIdentifier: number) => {
         const newLabel = (
            document.getElementById(`labelTextPicker${labelIdentifier}`) as HTMLLIElement
         )
            .getAttribute('value')!
            .toString();

         // Atualiza o texto de cada feature baseado na label que foi passada.
         features.forEach((feature) => {
            feature
               .getStyle()!
               //@ts-ignore
               .getText()
               .setText(
                  newLabel === '' || feature.get('info')[newLabel] === null || undefined
                     ? ''
                     : feature.get('info')[newLabel].toString()
               );
         });

         source.changed();
      },
      [features, source]
   );

   return (
      <div className="labelMenu menu container">
         <div className="textSizeContainer container">
            <button>
               <FaMinus size={12} onClick={() => handleLabelTextSize('-')} />
            </button>
            <FaTextHeight size={30} />
            <button>
               <FaPlus size={12} onClick={() => handleLabelTextSize('+')} />
            </button>
         </div>

         <input
            type="color"
            id={`labelColorPicker${layer.get('id')}`}
            className="colorPicker"
            value={layer
               .getSource()
               .getFeatures()[0]
               .getStyle()!
               //@ts-ignore
               .getText()
               .getFill()
               .getColor()}
            onChange={handleLabelColor}
         />

         <ul>
            <li
               id={`labelTextPicker-1`}
               className="label"
               value={''}
               style={{ color: '#A83232' }}
               onClick={() => handleLabelText(-1)}
            >
               {' '}
               VAZIO{' '}
            </li>
            {layer.get('labels').map((label: string, index: number) => (
               <li
                  key={index}
                  id={`labelTextPicker${index}`}
                  className="label"
                  value={label}
                  onClick={() => handleLabelText(index)}
               >
                  {label}
               </li>
            ))}
         </ul>
      </div>
   );
};

export default LabelMenu;
