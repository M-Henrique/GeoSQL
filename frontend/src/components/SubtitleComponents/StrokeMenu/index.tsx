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
import Stroke from 'ol/style/Stroke';

import './styles.css';

interface StrokeMenuProps {
   layer: VectorLayer;
}

const StrokeMenu: React.FC<StrokeMenuProps> = ({ layer }) => {
   // Estados de utilidade. São estados utilizados para indicar ao react que o valor dos inputs foi atualizado (utilizando o set), o que  faz com que o react renderize novamente o componente em questão.
   // Ex: ao alterar o input de cor (do polígono ou da linha), usamos o setColor para dizer ao react que o input mudou, fazendo com que ele altere o input visualmente e renderize-o novamente.
   // eslint desativado para evitar os avisos das variáveis inutilizadas
   // eslint-disable-next-line
   const [color, setColor] = useState<string>();
   // eslint-disable-next-line
   const [size, setSize] = useState<number>();

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

   const handleStrokeColor = useCallback(() => {
      const newColor = (document.getElementById(
         `strokeColorPicker${layer.get('id')}`
      )! as HTMLInputElement).value;

      // Atualiza as linhas (strokes) de cada feature com a nova cor.
      features.forEach((feature) => {
         const oldStyle = feature.getStyle();
         //@ts-ignore
         feature.getStyle().getStroke().setColor(newColor);
         //@ts-ignore
         feature.getStyle().setImage(
            new RegularShape({
               //@ts-ignore
               fill: oldStyle.getFill(),
               stroke: new Stroke({
                  color: newColor,
                  //@ts-ignore
                  width: oldStyle.getStroke().getWidth(),
               }),
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

   const handleStrokeSize = useCallback(() => {
      const newSize = Number(
         (document.getElementById(`strokeSizePicker${layer.get('id')}`)! as HTMLInputElement).value
      );

      // Atualiza as linhas (strokes) de cada feature com a nova grossura.
      features.forEach((feature) => {
         const oldStyle = feature.getStyle();
         //@ts-ignore
         feature.getStyle().getStroke().setWidth(newSize);
         //@ts-ignore
         feature.getStyle().setImage(
            new RegularShape({
               //@ts-ignore
               fill: oldStyle.getFill(),
               stroke: new Stroke({
                  //@ts-ignore
                  color: oldStyle.getStroke().getColor(),
                  width: newSize,
               }),
               points,
               angle,
               rotation,
               radius,
               radius2,
            })
         );
      });

      source.changed();
      setSize(newSize);
   }, [source, features, layer, points, radius, radius2, angle, rotation]);

   // Função de utilidade para impedir que o arrasto do input de slider inicie um drag da camada.
   const handleInputDrag = useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
   }, []);

   return (
      <div className="strokeMenu menu container">
         <input
            type="color"
            id={`strokeColorPicker${layer.get('id')}`}
            className="colorPicker" //
            value={layer
               .getSource()
               .getFeatures()[0]
               .getStyle()
               //@ts-ignore
               .getStroke()
               .getColor()}
            onChange={handleStrokeColor}
         />
         <input
            id={`strokeSizePicker${layer.get('id')}`}
            type="range"
            className="sizePicker"
            min={1}
            max={5}
            step={0.1}
            //@ts-ignore
            value={layer
               .getSource()
               .getFeatures()[0]
               .getStyle()
               //@ts-ignore
               .getStroke()
               .getWidth()}
            onChange={handleStrokeSize}
            draggable="true"
            onDragStart={handleInputDrag}
         />
      </div>
   );
};

export default StrokeMenu;
