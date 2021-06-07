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

interface ContextData {
   layers: Array<VectorLayer>;
   setLayers: Dispatch<SetStateAction<VectorLayer[]>>;
}

const LayersContext = createContext<ContextData>({} as ContextData);

export const LayersProvider: React.FC = ({ children }) => {
   const { query, results, hasGeomValue } = useContext(QueryContext);

   // IDs das camadas (para facilitar identificação de cada uma).
   const [id, setId] = useState(0);
   // Vetor de camadas em si.
   const [layers, setLayers] = useState<VectorLayer[]>([]);

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

   // Função auxiliar para verificar a necessidade de "declutter" na camada
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
            // Flag de controle para saber qual filtro aplicar a cada features.
            features[index].set('filterID', -1);
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

         // A layer em si
         const vectorLayer = new VectorLayer({
            // Tipagem desnecessária nesse caso (openlayers reconhece atributos personalizados automaticamente).
            //@ts-ignore
            id,
            // Classname necessário para evitar que labels 'declutteradas' sobreponham outras layers (https://github.com/openlayers/openlayers/issues/10096)
            className: `Layer ${id}`,
            // Armazenamento da cor base utilizada nas features (para utilização nos filtros).
            color: colorFill,
            // Query realizada pelo usuário (para exibição ao manter o mouse em cima da camada, na legenda).
            query,
            labels: layerLabels,
            geoJson: geoJSONObject,
            // Armazenamento do formato da camada (caso aplicável).
            shape,
            // Armazenamento do tamanho das features da camada (caso aplicável).
            size: radius,
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

   return <LayersContext.Provider value={{ layers, setLayers }}>{children}</LayersContext.Provider>;
};

export default LayersContext;
