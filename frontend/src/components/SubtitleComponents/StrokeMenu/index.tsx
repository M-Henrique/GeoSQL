import React, { useCallback, useState } from 'react';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import RegularShape from 'ol/style/RegularShape';
import Stroke from 'ol/style/Stroke';
import Style from 'ol/style/Style';

import './styles.css';

interface StrokeMenuProps {
   layer: VectorLayer<VectorSource<any>>;
}

const StrokeMenu: React.FC<StrokeMenuProps> = ({ layer }) => {
   // Estados de utilidade. São estados utilizados para indicar ao react que o valor dos inputs foi atualizado (utilizando o set), o que  faz com que o react renderize novamente o componente em questão.
   // Ex: ao alterar o input de cor (do polígono ou da linha), usamos o setColor para dizer ao react que o input mudou, fazendo com que ele altere o input visualmente e renderize-o novamente.
   const [, setColor] = useState<string>();
   const [, setSize] = useState<number>();

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
      const newColor = (
         document.getElementById(`strokeColorPicker${layer.get('id')}`)! as HTMLInputElement
      ).value;

      // Atualiza as linhas (strokes) de cada feature com a nova cor.
      features.forEach((feature) => {
         const oldStyle = feature.getStyle() as Style;

         (feature.getStyle() as Style).getStroke().setColor(newColor);

         (feature.getStyle() as Style).setImage(
            new RegularShape({
               fill: oldStyle.getFill(),
               stroke: new Stroke({
                  color: newColor,

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
         const oldStyle = feature.getStyle() as Style;

         oldStyle.getStroke().setWidth(newSize);

         oldStyle.setImage(
            new RegularShape({
               fill: oldStyle.getFill(),
               stroke: new Stroke({
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
            className="colorPicker"
            value={
               (layer.getSource().getFeatures()[0].getStyle()! as Style)
                  .getStroke()
                  .getColor() as string
            }
            onChange={handleStrokeColor}
         />

         <input
            id={`strokeSizePicker${layer.get('id')}`}
            type="range"
            className="sizePicker"
            min={1}
            max={5}
            step={0.1}
            value={(layer.getSource().getFeatures()[0].getStyle() as Style).getStroke().getWidth()}
            onChange={handleStrokeSize}
            draggable="true"
            onDragStart={handleInputDrag}
         />
      </div>
   );
};

export default StrokeMenu;
