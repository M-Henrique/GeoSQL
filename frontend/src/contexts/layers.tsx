import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import RegularShape from 'ol/style/RegularShape';
import Stroke from 'ol/style/Stroke';

import QueryContext from './query';

interface ContextData {
   layers: Array<VectorLayer>;
}

const LayersContext = createContext<ContextData>({} as ContextData);

export const LayersProvider: React.FC = ({ children }) => {
   const { query, results } = useContext(QueryContext);

   const [id, setId] = useState(0);
   const [layers, setLayers] = useState<VectorLayer[]>([]);

   //Função auxiliar para geração da cor inicial.
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

   useEffect(() => {
      if (typeof results !== 'string') {
         const resultsGeoJSON = results.map((result: any) => JSON.parse(result.geojson));

         const geoJSONObject = {
            type: 'FeatureCollection',
            features: [...resultsGeoJSON],
         };

         const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(geoJSONObject, { featureProjection: 'EPSG:3857' }),
         });

         const [colorFill, colorStroke] = getRandomColor();

         const vectorLayer = new VectorLayer({
            // Tipagem desnecessária nesse caso (openlayers reconhece atributos personalizados automaticamente)
            //@ts-ignore
            id,
            query,
            source: vectorSource,
            style: new Style({
               fill: new Fill({
                  color: colorFill,
               }),
               stroke: new Stroke({
                  color: colorStroke,
                  width: 2,
               }),
               image: new RegularShape({
                  fill: new Fill({
                     color: colorFill,
                  }),
                  stroke: new Stroke({
                     color: colorStroke,
                     width: 2,
                  }),
                  points: 4,
                  radius: 10,
                  angle: Math.PI / 4,
               }),
            }),
         });

         setLayers((oldLayers) => [...oldLayers, vectorLayer]);
         setId((id) => id + 1);
      }
      // Necessário para evitar loops infinitos na criação de layers
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [results]);

   return <LayersContext.Provider value={{ layers }}>{children}</LayersContext.Provider>;
};

export default LayersContext;