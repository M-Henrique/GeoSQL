import React, { useCallback, useState } from 'react';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Style from 'ol/style/Style';

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
         const oldSize = (features[0].getStyle()! as Style).getText().getFont().split('p')[0];

         switch (operator) {
            case '+':
               features.forEach((feature) => {
                  (feature.getStyle()! as Style)
                     .getText()
                     .setFont(`${Number(oldSize) + 1}px roboto`);
               });

               source.changed();
               break;

            case '-':
               features.forEach((feature) => {
                  (feature.getStyle()! as Style)
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
         (feature.getStyle()! as Style).getText().getFill().setColor(newColor);
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
            (feature.getStyle()! as Style)
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
            <button onClick={() => handleLabelTextSize('-')}>
               <FaMinus size={12} />
            </button>
            <FaTextHeight size={30} />
            <button onClick={() => handleLabelTextSize('+')}>
               <FaPlus size={12} />
            </button>
         </div>

         <input
            type="color"
            id={`labelColorPicker${layer.get('id')}`}
            className="colorPicker"
            value={
               (layer.getSource().getFeatures()[0].getStyle()! as Style)
                  .getText()
                  .getFill()
                  .getColor() as string
            }
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
