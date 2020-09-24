import React, { createContext, useContext, useEffect, useState } from 'react';

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

         const vectorLayer = new VectorLayer({
            // Tipagem desnecessária nesse caso (openlayers reconhece atributos personalizados automaticamente)
            //@ts-ignore
            id,
            query,
            source: vectorSource,
            style: new Style({
               stroke: new Stroke({
                  color: '#678901',
                  width: 2,
               }),
               fill: new Fill({
                  color: '#654321',
               }),
               image: new RegularShape({
                  fill: new Fill({
                     color: '#981561',
                  }),
                  stroke: new Stroke({
                     color: '#678901',
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
