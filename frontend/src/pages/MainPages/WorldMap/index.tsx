import React, { useEffect, useRef, useState } from 'react';
import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function WorldMap(props: any) {
   const [map, setMap] = useState<Map>();
   const [featuresLayer, setFeaturesLayer] = useState<VectorLayer>(
      () =>
         new VectorLayer({
            source: new VectorSource(),
         })
   );
   const [selectedCoord, setSelectedCoord] = useState(null);

   const mapElement = useRef<HTMLDivElement | null>(null);

   useEffect(() => {
      // create map
      const initialMap = new Map({
         // Tipagem original do target (PluggableMap.d.ts(63, 5)) foi modidicada para permitir a alocação do mapa em uma div.
         target: mapElement.current,
         layers: [
            new TileLayer({
               source: new XYZ({
                  url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png',
               }),
            }),

            featuresLayer,
         ],
         view: new View({
            projection: 'EPSG:3857',
            center: [0, 0],
            zoom: 2,
         }),
         controls: [],
      });

      // save map layer references to state
      setMap(initialMap);
   }, [featuresLayer]);

   return (
      <div id="mapContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="map" />
         </header>

         <div ref={mapElement} id="mainContainer" className="firstContainer container"></div>
      </div>
   );
}
