import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

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
   const { results } = useContext(QueryContext);
   const [layers, setLayers] = useState<VectorLayer[]>([]);

   const isInitialMount = useRef(true);
   useEffect(() => {
      if (isInitialMount.current) {
         isInitialMount.current = false;
      } else {
         const resultsGeoJSON = results.map((result: any) => JSON.parse(result.geojson));

         const geoJSONObject = {
            type: 'FeatureCollection',
            features: [...resultsGeoJSON],
         };

         const vectorSource = new VectorSource({
            features: new GeoJSON().readFeatures(geoJSONObject, { featureProjection: 'EPSG:3857' }),
         });

         const vectorLayer = new VectorLayer({
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
                     color: '#654321',
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
      }
   }, [results]);

   return <LayersContext.Provider value={{ layers }}>{children}</LayersContext.Provider>;
};

export default LayersContext;
