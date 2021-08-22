/* Contexto que armazena o vetor de layers, juntamente de suas informações e características, que serão mostradas em mapa. */

import React, {
   createContext,
   Dispatch,
   SetStateAction,
   useCallback,
   useContext,
   useEffect,
   useRef,
   useState,
} from 'react';

import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import RegularShape from 'ol/style/RegularShape';
import Text from 'ol/style/Text';
import { Feature } from 'ol';
import Geometry from 'ol/geom/Geometry';

import QueryContext from './query';

const hexToHsl = require('hex-to-hsl');
const hsl = require('hsl-to-hex');

// Interface dos filtros
export interface IFilter {
   type: string;

   label: string;
   value: string;

   fillColor: string;
   isFillColorRandom: boolean;

   strokeColor: string;
   isStrokeColorRandom: boolean;
}

// Interface dos itens da legenda dos filtros.
export interface IFilterSubtitle {
   type: string;

   minValue?: number;
   maxValue?: number;
   categoryValue?: string;

   fillColor: string;
   strokeColor: string;

   filteredFeatures: Feature<Geometry>[];
}

interface ContextData {
   layers: Array<VectorLayer<VectorSource<any>>>;
   setLayers: Dispatch<SetStateAction<VectorLayer<VectorSource<any>>[]>>;

   handleIntervalFilter: (layerID: number) => void;
   handlePercentileFilter: (layerID: number) => void;
   handleCategoryFilter: (layerID: number) => void;

   handleChangeSpecificFeatures: (
      layerID: number,
      features: Feature<Geometry>[],
      fillColor: string,
      strokeColor: string
   ) => void;

   handleEraseFilter: (layerID: number) => void;
}

const LayersContext = createContext<ContextData>({} as ContextData);

export const LayersProvider: React.FC = ({ children }) => {
   const { query, results, hasGeomValue } = useContext(QueryContext);

   // IDs das camadas (para facilitar identificação de cada uma).
   const [id, setId] = useState(0);
   // Vetor de camadas em si.
   const [layers, setLayers] = useState<VectorLayer<VectorSource<any>>[]>([]);

   //Função auxiliar para geração randômica da cor inicial
   const getRandomColor = useCallback(() => {
      const letters = '0123456789ABCDEF';
      let color = [];

      for (let i = 0; i < 2; i++) {
         color.push('#');
         for (let j = 0; j < 6; j++) {
            color[i] += letters[Math.floor(Math.random() * 16)];
         }
      }

      return color;
   }, []);

   // Função auxiliar para geração randômica do formato inicial da camada (caso aplicável).
   const getRandomShape = useCallback(() => {
      const shapes = [
         { shape: 'square', points: 4, radius: 15, angle: Math.PI / 4 },
         { shape: 'triangle', points: 3, radius: 15, rotation: Math.PI / 4, angle: 0 },
         { shape: 'star', points: 5, radius: 15, radius2: 4, angle: 0 },
         { shape: 'circle', points: 100, radius: 15 },
      ];

      return shapes[Math.floor(Math.random() * shapes.length)];
   }, []);

   // Função auxiliar para verificar a necessidade de "declutter" na camada.
   const checkLayerDeclutter = useCallback((features) => {
      for (let i in features) {
         if (
            JSON.parse(features[i]).type === 'LineString' ||
            JSON.parse(features[i]).type === 'MultiLineString'
         )
            return true;
      }

      return false;
   }, []);

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

   // Função que realiza a tematização do mapa baseado no número de intervalos de uma determinada label.
   const handleIntervalFilter = useCallback(
      (layerID: number) => {
         // Recupera as features da layer sendo filtrada.
         const filteredLayer = layers.find((layer) => layer.get('id') === layerID)!;
         const features = filteredLayer?.getSource().getFeatures()!;

         // Recupera o objeto de filtro da camada.
         const filter = filteredLayer.get('filter') as IFilter;

         if (filter.type !== '' && filter.label !== '' && filter.value !== '') {
            // Ordena as features baseado na label passada, para facilitar a indexação e evitar iterar por features já passadas.
            features.sort(
               (feature1, feature2) =>
                  Number(feature1.get('info')[filter.label]) -
                  Number(feature2.get('info')[filter.label])
            );

            // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual.
            const { points, angle, rotation, radius, radius2 } = getShape(
               filteredLayer.get('shape'),
               filteredLayer.get('size')
            );

            // Tamanho dos intervalos
            const rangeSize = Math.ceil(
               Number(features[features.length - 1].get('info')[filter.label]) /
                  Number(filter.value)
            );
            // Tamanho dos intervalos do brilho (cor) para correta exibição do gradiente.
            const lightnessRangeSize = Math.floor(50 / Number(filter.value));
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [polyHue, polySat] = hexToHsl(filter.fillColor);
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [stroHue, stroSat] = hexToHsl(filter.strokeColor);

            // Variável que mantém os itens necessários para construção da legenda do filtro.
            let subtitle: IFilterSubtitle[] = [];
            // Variável que mantém o índice da última feature iterada a cada loop de value, evitando que features passadas tenham seus estilos sobrepostos.
            let lastFeatureIndex = 0;
            for (let i = 1; i <= Number(filter.value); i++) {
               // Brilho da cor.
               const newLig = 30 + lightnessRangeSize * (Number(filter.value) + 1 - i);
               // Numero máximo permitido para esse intervalo.
               const maxRange = rangeSize * i;
               // Recupera uma cor aleatória (caso o usuário tenha selecionado tal opção).
               const [randomFillColor, randomStrokeColor] = getRandomColor();

               // Insere no array de legenda os valores respectivos.
               if (
                  !(
                     filter.fillColor === '#000000' &&
                     filter.strokeColor === '#000000' &&
                     !filter.isFillColorRandom &&
                     !filter.isStrokeColorRandom
                  )
               ) {
                  // Recupera o antigo estilo de uma feature, para ser utilizado no filtro caso o usuário não tenha alterado manualmente.
                  const oldStyle = features[0].getStyle() as Style;

                  subtitle.push({
                     type: 'Intervalo',
                     minValue: maxRange - rangeSize,
                     maxValue: maxRange,
                     fillColor: filter.isFillColorRandom
                        ? randomFillColor
                        : filter.fillColor !== '#000000'
                        ? hsl(polyHue, polySat, newLig)
                        : oldStyle.getFill().getColor(),
                     strokeColor: filter.isStrokeColorRandom
                        ? randomStrokeColor
                        : filter.strokeColor !== '#000000'
                        ? hsl(stroHue, stroSat, newLig)
                        : oldStyle.getStroke().getColor(),
                     filteredFeatures: [],
                  });
               }

               // Modifica a cor das features, alterando o brilho do hsl para diferenciar as features pertencentes a cada intervalo.
               for (let j = lastFeatureIndex; j < features.length; j++) {
                  // Caso o elemento iterado pertença a um novo intervalo, quebra o loop (funciona pois o array está ordenado).
                  if (Number(features[j].get('info')[filter.label]) > maxRange) {
                     lastFeatureIndex = j;
                     break;
                  }

                  // Insere a feature no objeto da legenda, para permitir modificação de features específicas através da legenda.
                  subtitle[i - 1].filteredFeatures.push(features[j]);

                  // Recupera o antigo estilo da feature.
                  const oldStyle = features[j].getStyle() as Style;

                  // Modifica a cor de preenchimento (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getFill()
                     .setColor(
                        filter.isFillColorRandom
                           ? randomFillColor
                           : filter.fillColor !== '#000000'
                           ? hsl(polyHue, polySat, newLig)
                           : oldStyle.getFill().getColor()
                     );

                  // Modifica a cor de contorno (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getStroke()
                     .setColor(
                        filter.isStrokeColorRandom
                           ? randomStrokeColor
                           : filter.strokeColor !== '#000000'
                           ? hsl(stroHue, stroSat, newLig)
                           : oldStyle.getStroke().getColor()
                     );

                  // Modifica as mesmas coisas para features que sejam geradas como Regular Shapes (estrelas, círculos, etc).
                  oldStyle.setImage(
                     new RegularShape({
                        fill: new Fill({
                           color: filter.isFillColorRandom
                              ? randomFillColor
                              : filter.fillColor !== '#000000'
                              ? hsl(polyHue, polySat, newLig)
                              : oldStyle.getFill().getColor(),
                        }),

                        stroke: new Stroke({
                           color: filter.isStrokeColorRandom
                              ? randomStrokeColor
                              : filter.strokeColor !== '#000000'
                              ? hsl(stroHue, stroSat, newLig)
                              : oldStyle.getStroke().getColor(),
                           width: oldStyle.getStroke().getWidth(),
                        }),

                        points,
                        angle,
                        rotation,
                        radius,
                        radius2,
                     })
                  );
               }
            }

            // Atualiza o array de valores dos filtros da camada, para correta exibição da legenda.
            filteredLayer.set('filterSubtitle', subtitle);

            // Indica uma modificação na camada respectiva, para realizar uma nova renderização.
            filteredLayer?.getSource().changed();
         }
      },
      [layers, getShape, getRandomColor]
   );

   // Função que realiza a tematização do mapa baseado em grupos com quantidades iguais de elementos.
   const handlePercentileFilter = useCallback(
      (layerID: number) => {
         // Recupera as features da layer sendo filtrada.
         const filteredLayer = layers.find((layer) => layer.get('id') === layerID)!;
         const features = filteredLayer?.getSource().getFeatures()!;

         // Recupera o objeto de filtro da camada.
         const filter = filteredLayer.get('filter') as IFilter;

         if (filter.type !== '' && filter.label !== '' && filter.value !== '') {
            // Ordena as features baseado na label passada, para facilitar a indexação e evitar iterar por features já passadas.
            features.sort(
               (feature1, feature2) =>
                  Number(feature1.get('info')[filter.label]) -
                  Number(feature2.get('info')[filter.label])
            );

            // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual.
            const { points, angle, rotation, radius, radius2 } = getShape(
               filteredLayer.get('shape'),
               filteredLayer.get('size')
            );

            // Tamanho dos grupos.
            const groupSize = Math.ceil(features.length * (Number(filter.value) / 100));
            // Número de grupos.
            const numOfGroups = Math.ceil(features.length / groupSize);
            // Tamanho dos intervalos do brilho (cor) para correta exibição do gradiente.
            const lightnessRangeSize = Math.floor(50 / numOfGroups);
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [polyHue, polySat] = hexToHsl(filter.fillColor);
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [stroHue, stroSat] = hexToHsl(filter.strokeColor);

            // Variável que mantém os itens necessários para construção da legenda do filtro.
            let subtitle: IFilterSubtitle[] = [];
            // Variável que mantém o índice da última feature iterada a cada loop de value, evitando que features passadas tenham seus estilos sobrepostos.
            let nextFeatureIndex = 0;
            for (let i = 1; i <= numOfGroups; i++) {
               // Brilho da cor.
               const newLig = 30 + lightnessRangeSize * (numOfGroups + 1 - i);
               // Recupera uma cor aleatória (caso o usuário tenha selecionado tal opção).
               const [randomFillColor, randomStrokeColor] = getRandomColor();

               // Insere no array de legenda os valores respectivos.
               if (
                  !(
                     filter.fillColor === '#000000' &&
                     filter.strokeColor === '#000000' &&
                     !filter.isFillColorRandom &&
                     !filter.isStrokeColorRandom
                  )
               ) {
                  // Recupera o antigo estilo de uma feature, para ser utilizado no filtro caso o usuário não tenha alterado manualmente.
                  const oldStyle = features[0].getStyle() as Style;

                  subtitle.push({
                     type: 'Percentil',
                     minValue: Number(filter.value) * (i - 1),
                     maxValue: Number(filter.value) * i,
                     fillColor: filter.isFillColorRandom
                        ? randomFillColor
                        : filter.fillColor !== '#000000'
                        ? hsl(polyHue, polySat, newLig)
                        : oldStyle.getFill().getColor(),
                     strokeColor: filter.isStrokeColorRandom
                        ? randomStrokeColor
                        : filter.strokeColor !== '#000000'
                        ? hsl(stroHue, stroSat, newLig)
                        : oldStyle.getStroke().getColor(),
                     filteredFeatures: [],
                  });
               }

               // Modifica a cor das features, alterando o brilho do hsl para diferenciar as features pertencentes a cada intervalo.
               for (let j = nextFeatureIndex; j < features.length; j++) {
                  // Insere a feature no objeto da legenda, para permitir modificação de features específicas através da legenda.
                  subtitle[i - 1].filteredFeatures.push(features[j]);
                  // Recupera o antigo estilo da feature.
                  const oldStyle = features[j].getStyle() as Style;

                  // Modifica a cor de preenchimento (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getFill()
                     .setColor(
                        filter.isFillColorRandom
                           ? randomFillColor
                           : filter.fillColor !== '#000000'
                           ? hsl(polyHue, polySat, newLig)
                           : oldStyle.getFill().getColor()
                     );

                  // Modifica a cor de contorno (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getStroke()
                     .setColor(
                        filter.isStrokeColorRandom
                           ? randomStrokeColor
                           : filter.strokeColor !== '#000000'
                           ? hsl(stroHue, stroSat, newLig)
                           : oldStyle.getStroke().getColor()
                     );

                  // Modifica as mesmas coisas para features que sejam geradas como Regular Shapes (estrelas, círculos, etc).
                  oldStyle.setImage(
                     new RegularShape({
                        fill: new Fill({
                           color: filter.isFillColorRandom
                              ? randomFillColor
                              : filter.fillColor !== '#000000'
                              ? hsl(polyHue, polySat, newLig)
                              : oldStyle.getFill().getColor(),
                        }),

                        stroke: new Stroke({
                           color: filter.isStrokeColorRandom
                              ? randomStrokeColor
                              : filter.strokeColor !== '#000000'
                              ? hsl(stroHue, stroSat, newLig)
                              : oldStyle.getStroke().getColor(),
                           width: oldStyle.getStroke().getWidth(),
                        }),

                        points,
                        angle,
                        rotation,
                        radius,
                        radius2,
                     })
                  );

                  // Caso o elemento iterado seja de um novo grupo, quebra o loop (funciona pois o array está ordenado).
                  if ((j + 1) % groupSize === 0) {
                     nextFeatureIndex = j + 1;
                     break;
                  }
               }
            }

            // Atualiza o array de valores dos filtros da camada, para correta exibição da legenda.
            filteredLayer.set('filterSubtitle', subtitle);

            // Indica uma modificação na camada respectiva, para realizar uma nova renderização.
            filteredLayer?.getSource().changed();
         }
      },
      [layers, getShape, getRandomColor]
   );

   // Função que realiza a tematização do mapa baseado em categorias diferentes.
   const handleCategoryFilter = useCallback(
      (layerID: number) => {
         // Recupera as features da layer sendo filtrada.
         const filteredLayer = layers.find((layer) => layer.get('id') === layerID)!;
         const features = filteredLayer?.getSource().getFeatures()!;

         // Recupera o objeto de filtro da camada.
         const filter = filteredLayer.get('filter') as IFilter;

         if (filter.type !== '' && filter.label !== '') {
            // Agrupa as features em um novo objeto, baseado nos diferentes valores da label passada.
            const groupedFeatures = features.reduce((featuresSoFar: any, feature) => {
               if (!featuresSoFar[feature.get('info')[filter.label]])
                  featuresSoFar[feature.get('info')[filter.label]] = [];

               featuresSoFar[feature.get('info')[filter.label]].push(feature);

               return featuresSoFar;
            }, {});

            // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual.
            const { points, angle, rotation, radius, radius2 } = getShape(
               filteredLayer.get('shape'),
               filteredLayer.get('size')
            );

            // Número de categorias.
            let numOfCategories = Object.keys(groupedFeatures).length;
            // Tamanho dos intervalos do brilho (cor) para correta exibição do gradiente.
            const lightnessRangeSize = Math.floor(50 / numOfCategories);
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [polyHue, polySat] = hexToHsl(filter.fillColor);
            // Conversão da cor do formato hex para hsl, para aplicar uma modificação de brilho e obter efeito de gradiente.
            const [stroHue, stroSat] = hexToHsl(filter.strokeColor);

            // Variável auxiliar para conseguir acessar o índice correto da legenda
            let i = 0;
            // Variável que mantém os itens necessários para construção da legenda do filtro.
            let subtitle: IFilterSubtitle[] = [];
            for (let feats in groupedFeatures) {
               // Brilho da cor.
               const newLig = 30 + lightnessRangeSize * numOfCategories;
               // Recupera uma cor aleatória (caso o usuário tenha selecionado tal opção).
               const [randomFillColor, randomStrokeColor] = getRandomColor();

               // Insere no array de legenda os valores respectivos.
               if (
                  !(
                     filter.fillColor === '#000000' &&
                     filter.strokeColor === '#000000' &&
                     !filter.isFillColorRandom &&
                     !filter.isStrokeColorRandom
                  )
               ) {
                  // Recupera o antigo estilo da feature.
                  const oldStyle = features[0].getStyle() as Style;

                  subtitle.push({
                     type: 'Categoria',
                     categoryValue: feats,
                     fillColor: filter.isFillColorRandom
                        ? randomFillColor
                        : filter.fillColor !== '#000000'
                        ? hsl(polyHue, polySat, newLig)
                        : oldStyle.getFill().getColor(),
                     strokeColor: filter.isStrokeColorRandom
                        ? randomStrokeColor
                        : filter.strokeColor !== '#000000'
                        ? hsl(stroHue, stroSat, newLig)
                        : oldStyle.getStroke().getColor(),
                     filteredFeatures: [],
                  });
               }

               // Modifica a cor das features, alterando o brilho do hsl para diferenciar as features pertencentes a cada intervalo.
               for (let j = 0; j < groupedFeatures[feats].length; j++) {
                  // Insere a feature no objeto da legenda, para permitir modificação de features específicas através da legenda.
                  subtitle[i].filteredFeatures.push(groupedFeatures[feats][j]);
                  // Recupera o antigo estilo da feature.
                  const oldStyle = groupedFeatures[feats][j].getStyle() as Style;

                  // Modifica a cor de preenchimento (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getFill()
                     .setColor(
                        filter.isFillColorRandom
                           ? randomFillColor
                           : filter.fillColor !== '#000000'
                           ? hsl(polyHue, polySat, newLig)
                           : oldStyle.getFill().getColor()
                     );

                  // Modifica a cor de contorno (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
                  oldStyle
                     .getStroke()
                     .setColor(
                        filter.isStrokeColorRandom
                           ? randomStrokeColor
                           : filter.strokeColor !== '#000000'
                           ? hsl(stroHue, stroSat, newLig)
                           : oldStyle.getStroke().getColor()
                     );

                  // Modifica as mesmas coisas para features que sejam geradas como Regular Shapes (estrelas, círculos, etc).
                  oldStyle.setImage(
                     new RegularShape({
                        fill: new Fill({
                           color: filter.isFillColorRandom
                              ? randomFillColor
                              : filter.fillColor !== '#000000'
                              ? hsl(polyHue, polySat, newLig)
                              : oldStyle.getFill().getColor(),
                        }),

                        stroke: new Stroke({
                           color: filter.isStrokeColorRandom
                              ? randomStrokeColor
                              : filter.strokeColor !== '#000000'
                              ? hsl(stroHue, stroSat, newLig)
                              : oldStyle.getStroke().getColor(),
                           width: oldStyle.getStroke().getWidth(),
                        }),

                        points,
                        angle,
                        rotation,
                        radius,
                        radius2,
                     })
                  );
               }

               i++;
               numOfCategories--;
            }

            // Atualiza o array de valores dos filtros da camada, para correta exibição da legenda.
            filteredLayer.set('filterSubtitle', subtitle);

            // Indica uma modificação na camada respectiva, para realizar uma nova renderização.
            filteredLayer?.getSource().changed();
         }
      },
      [layers, getShape, getRandomColor]
   );

   // Função que modifica o estilo das features compreendidas em um intervalo/percentil/categoria específico.
   const handleChangeSpecificFeatures = useCallback(
      (layerID: number, features: Feature<Geometry>[], fillColor: string, strokeColor: string) => {
         const filteredLayer = layers.find((layer) => layer.get('id') === layerID)!;

         // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual.
         const { points, angle, rotation, radius, radius2 } = getShape(
            filteredLayer.get('shape'),
            filteredLayer.get('size')
         );

         // Recupera e modifica os valores de cor do pedaço específico sendo afetado, possibilitando o acompanhamento visual do input de cor de acordo com as ações do usuário
         const affectedPiece = (filteredLayer.get('filterSubtitle') as IFilterSubtitle[]).find(
            (sub) => sub.filteredFeatures === features
         ) as IFilterSubtitle;

         affectedPiece.fillColor = fillColor;
         affectedPiece.strokeColor = strokeColor;

         features.forEach((feat) => {
            // Recupera o antigo estilo da feature.
            const oldStyle = feat.getStyle() as Style;

            // Modifica a cor de preenchimento (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
            oldStyle.getFill().setColor(fillColor);

            // Modifica a cor de contorno (utiliza-se a cor preta base (#000000) para evitar que o filtro seja aplicado sem que o usuário queira (por exemplo, aplicar efeitos no contorno sem que o usuário deseje). Como esta é a cor padrão do color picker, esse controle força uma escolha de cor por parte do usuário).
            oldStyle.getStroke().setColor(strokeColor);

            // Modifica as mesmas coisas para features que sejam geradas como Regular Shapes (estrelas, círculos, etc).
            oldStyle.setImage(
               new RegularShape({
                  fill: new Fill({
                     color: fillColor,
                  }),

                  stroke: new Stroke({
                     color: strokeColor,
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

         filteredLayer.getSource().changed();
      },
      [layers, getShape]
   );

   // Função que apaga os filtros aplicados.
   const handleEraseFilter = useCallback(
      (layerID: number) => {
         const filteredLayer = layers.find((layer) => layer.get('id') === layerID)!;
         const source = filteredLayer.getSource();
         const features = source.getFeatures();

         const filter = filteredLayer.get('filter') as IFilter;

         const fillColor = filter.fillColor;
         const strokeColor = filter.strokeColor;

         filter.type = '';
         filter.label = '';
         filter.value = '';

         filteredLayer.set('filterSubtitle', []);

         // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual
         const { points, angle, rotation, radius, radius2 } = getShape(
            filteredLayer.get('shape'),
            filteredLayer.get('size')
         );

         features.forEach((feature) => {
            const oldStyle = feature.getStyle() as Style;

            oldStyle.getFill().setColor(fillColor);
            oldStyle.getStroke().setColor(strokeColor);

            oldStyle.setImage(
               new RegularShape({
                  fill: new Fill({
                     color: fillColor,
                  }),

                  stroke: new Stroke({
                     color: strokeColor,
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
      },
      [layers, getShape]
   );

   // Flag utilizada para demarcar a primeira renderização.
   const isInitialMount = useRef(true);
   useEffect(() => {
      // Pseudo-layer do mapa (usada para indexação da legenda).
      if (isInitialMount.current) {
         setLayers([
            new VectorLayer({
               // Tipagem desnecessária nesse caso (openlayers reconhece atributos personalizados automaticamente)
               //@ts-ignore
               id,
            }),
         ]);
         setId((id) => id + 1);

         isInitialMount.current = false;
      } else if (hasGeomValue) {
         // Armazenamento do geojson de cada resultado, para uso no objeto que será o download da camada.
         const resultsGeoJSON = results.map((result: any) => result.geojson);

         // Geração das features individualmente para que seja possível armazenar em cada uma as informações referentes à própria.
         let features: Feature<Geometry>[] = [];
         results.forEach((result: any, index) => {
            result.geojson = JSON.parse(result.geojson);

            features.push(
               // Nova feature gerada a partir da leitura do geoJSON do resultado.
               new GeoJSON().readFeature(result.geojson, {
                  featureProjection: 'EPSG:3857',
               })
            );

            delete result.geojson;

            // Armazenamento das informações de cada feature.
            features[index].set('info', result);
         });

         // A fonte (source) das informações para geração da camada.
         const vectorSource = new VectorSource({
            // Features da fonte serão aquelas geradas anteriormente, transformadas em apenas um objeto geoJSON.
            features: new GeoJSON().readFeatures(new GeoJSON().writeFeaturesObject(features), {
               featureProjection: 'EPSG:3857',
            }),
         });

         // Obtenção das cores e formatos randômicos iniciais.
         const [colorFill, colorStroke] = getRandomColor();
         const { shape, points, angle, rotation, radius, radius2 } = getRandomShape();

         // Estilização das features.
         vectorSource.getFeatures().forEach((feature, index) => {
            feature.setStyle(
               new Style({
                  fill: new Fill({
                     color: colorFill,
                  }),
                  stroke: new Stroke({
                     color: colorStroke,
                     width: 1,
                  }),
                  text: new Text({
                     text: '',
                     font: '12px roboto',
                     fill: new Fill({
                        color: '#000000',
                     }),
                  }),
                  image: new RegularShape({
                     fill: new Fill({
                        color: colorFill,
                     }),
                     stroke: new Stroke({
                        color: colorStroke,
                        width: 1,
                     }),
                     points,
                     angle,
                     rotation,
                     radius,
                     radius2,
                  }),
               })
            );
         });

         // Captação dos rótulos (colunas) da query feita para exibição no menu de rótulos.
         let layerLabels = null;
         if (results.length > 0) {
            layerLabels = Object.keys(results[0]);
         }

         // Captação do objeto GeoJSON representando a camada a ser renderizada, para posterior utilização no download das camadas.
         const geoJSONObject = {
            type: 'FeatureCollection',
            features: [...resultsGeoJSON],
         };

         // Inicialização do objeto responsável pela filtragem da camada.
         const filter: IFilter = {
            type: '',
            label: '',
            value: '',

            fillColor: '#000000',
            isFillColorRandom: false,

            strokeColor: '#000000',
            isStrokeColorRandom: false,
         };

         // Inicialização do objeto responsável pela legenda do filtro da camada.
         const filterSubtitle: IFilterSubtitle[] = [];

         // A layer em si
         const vectorLayer = new VectorLayer({
            // Tipagem desnecessária nesse caso (openlayers reconhece atributos personalizados automaticamente).
            //@ts-ignore
            id,
            // Classname necessário para evitar que labels 'declutteradas' sobreponham outras layers (https://github.com/openlayers/openlayers/issues/10096)
            className: `Layer ${id}`,
            // Query realizada pelo usuário (para exibição ao manter o mouse em cima da camada, na legenda).
            query,
            labels: layerLabels,
            geoJson: geoJSONObject,
            // Armazenamento do formato da camada (caso aplicável).
            shape,
            // Armazenamento do tamanho das features da camada (caso aplicável).
            size: radius,
            // Objeto com os inputs do fitro da camada.
            filter,
            // Array com os valores do fitro da camada, para utilização na legenda.
            filterSubtitle,

            source: vectorSource,
            declutter: checkLayerDeclutter(geoJSONObject.features),
         });

         // Atualização do vetor de layers e do contador de ID das layers.
         setLayers((oldLayers) => [...oldLayers, vectorLayer]);
         setId((id) => id + 1);
      }
      // Necessário para evitar loops infinitos na criação de layers
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results]);

   return (
      <LayersContext.Provider
         value={{
            layers,
            setLayers,

            handleIntervalFilter,
            handlePercentileFilter,
            handleCategoryFilter,

            handleChangeSpecificFeatures,

            handleEraseFilter,
         }}
      >
         {children}
      </LayersContext.Provider>
   );
};

export default LayersContext;
