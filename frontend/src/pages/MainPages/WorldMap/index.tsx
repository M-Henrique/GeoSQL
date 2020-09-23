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

   const [isPolygonMenuVisible, setIsPolygonMenuVisible] = useState<boolean[]>([]);
   const [isStrokeMenuVisible, setIsStrokeMenuVisible] = useState<boolean[]>([]);
   const [isLabelMenuVisible, setIsLabelMenuVisible] = useState<boolean[]>([]);
   const [isLayerVisible, setIsLayerVisible] = useState<boolean[]>([]);

   const handlePolygonMenuVisibility = useCallback(
      (index) => {
         let polygonMenus = [...isPolygonMenuVisible];
         polygonMenus.fill(false);

         polygonMenus[index] = !isPolygonMenuVisible[index];
         setIsPolygonMenuVisible(polygonMenus);

         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));
      },
      [isLabelMenuVisible, isPolygonMenuVisible, isStrokeMenuVisible]
   );

   const handleStrokeMenuVisibility = useCallback(
      (index) => {
         let strokeMenus = [...isStrokeMenuVisible];
         strokeMenus.fill(false);

         strokeMenus[index] = !isStrokeMenuVisible[index];
         setIsStrokeMenuVisible(strokeMenus);

         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));
      },
      [isLabelMenuVisible, isPolygonMenuVisible, isStrokeMenuVisible]
   );

   const handleLabelMenuVisibility = useCallback(
      (index) => {
         let labelMenus = [...isLabelMenuVisible];
         labelMenus.fill(false);

         labelMenus[index] = !isLabelMenuVisible[index];
         setIsLabelMenuVisible(labelMenus);

         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
      },
      [isLabelMenuVisible, isPolygonMenuVisible, isStrokeMenuVisible]
   );

   const handleLayerVisibility = useCallback(
      (index) => {
         let layerVisibility = [...isLayerVisible];

         layerVisibility[index] = !isLayerVisible[index];
         if (isLayerVisible[index] === undefined) {
            layerVisibility[index] = false;
         }

         setIsLayerVisible(layerVisibility);
      },
      [isLayerVisible]
   );

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
                        {array.map((value, index) => {
                           return (
                              <li key={index} className="layer container">
                                 <div className="buttons container">
                                    <div className="customizePolygon customization">
                                       <button
                                          className="togglePolygonMenu"
                                          onClick={() => handlePolygonMenuVisibility(index)}
                                       >
                                          <FaShapes />
                                          <FaCaretDown />
                                       </button>
                                       {isPolygonMenuVisible[index] && (
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
                                       <button
                                          className="toggleStrokeMenu"
                                          onClick={() => handleStrokeMenuVisibility(index)}
                                       >
                                          <FaGripLines />
                                          <FaCaretDown />
                                       </button>
                                       {isStrokeMenuVisible[index] && (
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
                                       <button
                                          className="toggleLabelMenu"
                                          onClick={() => handleLabelMenuVisibility(index)}
                                       >
                                          Rótulo <FaCaretDown />
                                       </button>
                                       {isLabelMenuVisible[index] && (
                                          <ul className="labelMenu menu container">
                                             <li>Oi</li>
                                             <li>Oi</li>
                                             <li>Oi</li>
                                          </ul>
                                       )}
                                    </div>

                                    {isLayerVisible[index] ||
                                    isLayerVisible[index] === undefined ? (
                                       <button
                                          className="toggleVisibility layerVisible"
                                          onClick={() => handleLayerVisibility(index)}
                                       >
                                          <FaEyeSlash />
                                       </button>
                                    ) : (
                                       <button
                                          className="toggleVisibility"
                                          onClick={() => handleLayerVisibility(index)}
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
                           );
                        })}
                     </ul>
                  )}
               </SlideDown>
            </div>
         </section>
      </div>
   );
}
