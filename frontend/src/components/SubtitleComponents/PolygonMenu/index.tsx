/*------------------------------------------------------------------------------------------------------------------------
|  A tipagem do Openlayers sofre um bug so utilizar a função getStyle,                                                   |
|     da VectorLayer. Apesar de, no arquivo "C:\Apache24\htdocs\TCC\frontend\node_modules\@types\ol\style\Style.d.ts"    |
|        o retorno ser especificado como "Style", por algum motivo esse retorno não é reconhecido, forçando a utilização |
|           de @ts-ignore por diversas vezes ao longo do arquivo.                                                        |
|                                                                                                                        |
|                                                                                                                        |
|                                                                                                                        |
------------------------------------------------------------------------------------------------------------------------*/

import React, { useCallback, useState } from 'react';

import VectorLayer from 'ol/layer/Vector';
import RegularShape from 'ol/style/RegularShape';
import Fill from 'ol/style/Fill';

import { FaSquare, FaPlay, FaStar, FaCircle } from 'react-icons/fa';

import './styles.css';

interface PolygonMenuProps {
   layer: VectorLayer;
}

const PolygonMenu: React.FC<PolygonMenuProps> = ({ layer }) => {
   // Estados de utilidade. São estados utilizados para indicar ao react que o valor dos inputs foi atualizado (utilizando o set), o que  faz com que o react renderize novamente o componente em questão.
   // Ex: ao alterar o input de cor (do polígono ou da linha), usamos o setColor para dizer ao react que o input mudou, fazendo com que ele altere o input visualmente e renderize-o novamente.
   // eslint desativado para evitar os avisos das variáveis inutilizadas
   // eslint-disable-next-line
   const [color, setColor] = useState<string>();
   // eslint-disable-next-line
   const [size, setSize] = useState<number>();
   // eslint-disable-next-line
   const [shape, setShape] = useState<string>();

   // Função de utilidade para pegar o formato atual da camada (caso aplicável).
   const getShape = useCallback((shape: string, size: number) => {
      const shapes = [
         { name: 'square', points: 4, radius: size, angle: Math.PI / 4 },
         { name: 'triangle', points: 3, radius: size, rotation: Math.PI / 4, angle: 0 },
         { name: 'star', points: 5, radius: size, radius2: size / 3, angle: 0 },
         { name: 'circle', points: 100, radius: size },
      ];

      const [correctShape] = shapes.filter((format) => format.name === shape);
      return correctShape;
   }, []);

   const source = layer.getSource();
   const features = source.getFeatures();

   // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual
   const { points, angle, rotation, radius, radius2 } = getShape(
      layer.get('shape'),
      layer.get('size')
   );

   const handlePolygonColor = useCallback(() => {
      const newColor = (document.getElementById(
         `polygonColorPicker${layer.get('id')}`
      )! as HTMLInputElement).value;

      // Atualiza a cor de preenchimento para cada feature.
      features.forEach((feature) => {
         const oldStyle = feature.getStyle();
         //@ts-ignore
         feature.getStyle().getFill().setColor(newColor);
         //@ts-ignore
         feature.getStyle().setImage(
            new RegularShape({
               fill: new Fill({
                  color: newColor,
               }),
               //@ts-ignore
               stroke: oldStyle.getStroke(),
               points,
               angle,
               rotation,
               radius,
               radius2,
            })
         );
      });

      source.changed();
      setColor(newColor);
   }, [angle, features, layer, points, radius, radius2, rotation, source]);

   const handlePolygonSize = useCallback(() => {
      const newSize = Number(
         (document.getElementById(`polygonSizePicker${layer.get('id')}`)! as HTMLInputElement).value
      );

      // Atualiza a propriedade da layer para manter o tamanho facilmente acessível.
      layer.set('size', newSize);

      // Atualiza o tamanho para cada feature.
      features.forEach((feature) => {
         const oldStyle = feature.getStyle();
         //@ts-ignore
         feature.getStyle().setImage(
            new RegularShape({
               //@ts-ignore
               fill: oldStyle.getFill(),
               //@ts-ignore
               stroke: oldStyle.getStroke(),
               points,
               angle,
               rotation,
               radius: newSize,
               radius2,
            })
         );
      });

      source.changed();
      setSize(newSize);
   }, [angle, features, layer, points, radius2, rotation, source]);

   const handlePolygonShape = useCallback(
      (shape: string) => {
         // Atualiza a imagem de cada feature baseado no formato requerido.
         if (shape === 'square') {
            const { points, angle, rotation, radius, radius2 } = getShape(
               'square',
               layer.get('size')
            );

            layer.set('shape', 'square');

            features.forEach((feature) => {
               const oldStyle = feature.getStyle();
               //@ts-ignore
               feature.getStyle().setImage(
                  new RegularShape({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     points,
                     angle,
                     rotation,
                     radius,
                     radius2,
                  })
               );
            });
         }
         if (shape === 'triangle') {
            const { points, angle, rotation, radius, radius2 } = getShape(
               'triangle',
               layer.get('size')
            );

            layer.set('shape', 'triangle');

            features.forEach((feature) => {
               const oldStyle = feature.getStyle();
               //@ts-ignore
               feature.getStyle().setImage(
                  new RegularShape({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     points,
                     angle,
                     rotation,
                     radius,
                     radius2,
                  })
               );
            });
         }
         if (shape === 'star') {
            const { points, angle, rotation, radius, radius2 } = getShape(
               'star',
               layer.get('size')
            );

            layer.set('shape', 'star');

            features.forEach((feature) => {
               const oldStyle = feature.getStyle();
               //@ts-ignore
               feature.getStyle().setImage(
                  new RegularShape({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     points,
                     angle,
                     rotation,
                     radius,
                     radius2,
                  })
               );
            });
         }
         if (shape === 'circle') {
            const { points, angle, rotation, radius, radius2 } = getShape(
               'circle',
               layer.get('size')
            );

            layer.set('shape', 'circle');

            features.forEach((feature) => {
               const oldStyle = feature.getStyle();
               //@ts-ignore
               feature.getStyle().setImage(
                  new RegularShape({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     points,
                     angle,
                     rotation,
                     radius,
                     radius2,
                  })
               );
            });
         }

         source.changed();
         setShape(shape);
      },
      [features, getShape, layer, source]
   );

   // Função de utilidade para impedir que o arrasto do input de slider inicie um drag da camada.
   const handleInputDrag = useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
   }, []);

   return (
      <div className="polygonMenu menu container">
         <input
            type="color"
            id={`polygonColorPicker${layer.get('id')}`}
            className="colorPicker"
            value={layer
               .getSource()
               .getFeatures()[0]
               .getStyle()
               //@ts-ignore
               .getFill()
               .getColor()}
            onChange={handlePolygonColor}
         />
         <input
            id={`polygonSizePicker${layer.get('id')}`}
            type="range"
            className="sizePicker"
            min={5}
            max={15}
            step={0.1}
            value={layer.get('size')}
            onChange={handlePolygonSize}
            draggable="true"
            onDragStart={handleInputDrag}
         />
         <div className="polygonShapesPicker container">
            <button
               className={layer.get('shape') === 'square' ? 'selectedShape shape' : 'shape'}
               onClick={() => handlePolygonShape('square')}
            >
               <FaSquare />
            </button>
            <button
               className={layer.get('shape') === 'triangle' ? 'selectedShape shape' : 'shape'}
               onClick={() => handlePolygonShape('triangle')}
            >
               <FaPlay />
            </button>
            <button
               className={layer.get('shape') === 'star' ? 'selectedShape shape' : 'shape'}
               onClick={() => handlePolygonShape('star')}
            >
               <FaStar />
            </button>
            <button
               className={layer.get('shape') === 'circle' ? 'selectedShape shape' : 'shape'}
               onClick={() => handlePolygonShape('circle')}
            >
               <FaCircle />
            </button>
         </div>
      </div>
   );
};

export default PolygonMenu;
