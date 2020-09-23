import React, { useCallback, useEffect, useRef, useState } from 'react';

import {
   FaList,
   FaShapes,
   FaGripLines,
   FaEyeSlash,
   FaDownload,
   FaTrash,
   FaCaretDown,
   FaSquare,
   FaPlay,
   FaStar,
   FaCircle,
   FaEye,
} from 'react-icons/fa';

import { SlideDown } from 'react-slidedown';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat } from 'ol/proj';

import TabsMenu from '../../../components/TabsMenu';

import 'ol/ol.css';
import 'react-slidedown/lib/slidedown.css';

import './styles.css';

export default function WorldMap(props: any) {
   const [map, setMap] = useState<Map>();
   const mapElement = useRef<HTMLDivElement | null>(null);

   const [showSubtitle, setShowSubtitle] = useState(true);

   const [isPolygonMenuVisible, setIsPolygonMenuVisible] = useState(false);
   const [isStrokeMenuVisible, setIsStrokeMenuVisible] = useState(false);
   const [isLabelMenuVisible, setIsLabelMenuVisible] = useState(false);
   const [isLayerVisible, setIsLayerVisible] = useState(true);

   const polygonMenu = useCallback(() => {
      setIsPolygonMenuVisible(!isPolygonMenuVisible);
      setIsStrokeMenuVisible(false);
      setIsLabelMenuVisible(false);
   }, [isPolygonMenuVisible]);

   const strokeMenu = useCallback(() => {
      setIsStrokeMenuVisible(!isStrokeMenuVisible);
      setIsPolygonMenuVisible(false);
      setIsLabelMenuVisible(false);
   }, [isStrokeMenuVisible]);

   const labelMenu = useCallback(() => {
      setIsLabelMenuVisible(!isLabelMenuVisible);
      setIsPolygonMenuVisible(false);
      setIsStrokeMenuVisible(false);
   }, [isLabelMenuVisible]);

   useEffect(() => {
      const initialMap = new Map({
         // ts-ignore utilizado para permitir a alocação do mapa em uma div.
         //@ts-ignore
         target: mapElement.current,
         layers: [
            new TileLayer({
               source: new OSM(),
            }),
         ],
         view: new View({
            center: fromLonLat([-57.41, -15]),
            zoom: 4.5,
         }),
      });

      setMap(initialMap);
   }, []);

   const array = [1, 2, 3];
   return (
      <div id="mapContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="map" />
         </header>

         <section id="mainContainer" className="container">
            <div ref={mapElement} id="map"></div>
            <div id="subtitleContainer" className="container">
               <button
                  id="toggleSubtitle"
                  className="container"
                  onClick={() => setShowSubtitle(!showSubtitle)}
               >
                  <FaList id="toggleSubtitleIcon" />
               </button>
               <SlideDown>
                  {showSubtitle && (
                     <ul id="layersContainer" className="container">
                        {array.map((value, index) => (
                           <li key={index} className="layer container">
                              <div className="buttons container">
                                 <div className="customizePolygon customization">
                                    <button className="togglePolygonMenu" onClick={polygonMenu}>
                                       <FaShapes />
                                       <FaCaretDown />
                                    </button>
                                    {isPolygonMenuVisible && (
                                       <div className="polygonMenu menu container">
                                          <input type="color" className="colorPicker" />
                                          <input
                                             type="range"
                                             className="sizePicker"
                                             min={0}
                                             max={10}
                                             step={0.1}
                                          />
                                          <div className="polygonShapesPicker container">
                                             <button className="shape">
                                                <FaSquare />
                                             </button>
                                             <button className="shape">
                                                <FaPlay />
                                             </button>
                                             <button className="shape">
                                                <FaStar />
                                             </button>
                                             <button className="shape">
                                                <FaCircle />
                                             </button>
                                          </div>
                                       </div>
                                    )}
                                 </div>

                                 <div className="customizeStroke customization">
                                    <button className="toggleStrokeMenu" onClick={strokeMenu}>
                                       <FaGripLines />
                                       <FaCaretDown />
                                    </button>
                                    {isStrokeMenuVisible && (
                                       <div className="strokeMenu menu container">
                                          <input type="color" className="colorPicker" />
                                          <input
                                             type="range"
                                             className="sizePicker"
                                             min={0}
                                             max={10}
                                             step={0.1}
                                          />
                                       </div>
                                    )}
                                 </div>

                                 <div className="customizeLabel customization">
                                    <button className="toggleLabelMenu" onClick={labelMenu}>
                                       Rótulo <FaCaretDown />
                                    </button>
                                    {isLabelMenuVisible && (
                                       <ul className="labelMenu menu container">
                                          <li>Oi</li>
                                          <li>Oi</li>
                                          <li>Oi</li>
                                       </ul>
                                    )}
                                 </div>

                                 {isLayerVisible ? (
                                    <button
                                       className="toggleVisibility"
                                       style={{ background: 'var(--color-primary-dark)' }}
                                       onClick={() => setIsLayerVisible(!isLayerVisible)}
                                    >
                                       <FaEyeSlash />
                                    </button>
                                 ) : (
                                    <button
                                       className="toggleVisibility"
                                       onClick={() => setIsLayerVisible(!isLayerVisible)}
                                    >
                                       <FaEye />
                                    </button>
                                 )}

                                 <button className="download">
                                    <FaDownload />
                                 </button>

                                 <button className="delete">
                                    <FaTrash />
                                 </button>
                              </div>
                              <p className="text">Camada: 0</p>
                           </li>
                        ))}
                     </ul>
                  )}
               </SlideDown>
            </div>
         </section>
      </div>
   );
}
