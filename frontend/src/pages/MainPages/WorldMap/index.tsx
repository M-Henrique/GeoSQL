import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

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
import VectorLayer from 'ol/layer/Vector';

import LayersContext from '../../../contexts/layers';

import TabsMenu from '../../../components/TabsMenu';

import 'ol/ol.css';
import 'react-slidedown/lib/slidedown.css';

import './styles.css';

interface DnDProps {
   draggedFrom: number | null;
   draggedTo: number | null;
   isDragging: boolean;
   originalOrder: VectorLayer[];
   updatedOrder: VectorLayer[];
}

export default function WorldMap(props: any) {
   const { layers } = useContext(LayersContext);

   const [map, setMap] = useState<Map>();

   const [showSubtitle, setShowSubtitle] = useState(true);

   const [isPolygonMenuVisible, setIsPolygonMenuVisible] = useState<boolean[]>([]);
   const [isStrokeMenuVisible, setIsStrokeMenuVisible] = useState<boolean[]>([]);
   const [isLabelMenuVisible, setIsLabelMenuVisible] = useState<boolean[]>([]);
   const [isLayerVisible, setIsLayerVisible] = useState<boolean[]>([]);

   const initialDnDState: DnDProps = {
      draggedFrom: null,
      draggedTo: null,
      isDragging: false,
      originalOrder: layers,
      updatedOrder: layers,
   };
   const [dragAndDrop, setDragAndDrop] = useState(initialDnDState);
   // Reverse para correto display na legenda (últimas camadas por cima)
   const [list, setList] = useState([...layers].reverse());

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

   const handleLabelChange = useCallback(() => {
      let labelMenus = [...isLabelMenuVisible];
      labelMenus.fill(false);

      setIsLabelMenuVisible(labelMenus);
   }, [isLabelMenuVisible]);

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

   const handleOnDragStart = useCallback(
      (event) => {
         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));

         // We'll access the "data-position" attribute
         // of the current element dragged
         const initialPosition = Number(event.currentTarget.dataset.position);

         setDragAndDrop({
            // we spread the previous content
            // of the hook variable
            // so we don't override the properties
            // not being updated
            ...dragAndDrop,

            draggedFrom: initialPosition, // set the draggedFrom position
            isDragging: true,
            originalOrder: list, // store the current state of "list"
         });

         // Note: this is only for Firefox.
         // Without it, the DnD won't work.
         // But we are not using it.
         event.dataTransfer.setData('text/html', '');
      },
      [dragAndDrop, isLabelMenuVisible, isPolygonMenuVisible, isStrokeMenuVisible, list]
   );

   // Função de utilidade para impedir que o arrasto do input de slider inicie um drag da camada.
   const handleInputDrag = useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
   }, []);

   const handleOnDragOver = useCallback(
      (event) => {
         event.preventDefault();

         if (event.currentTarget.tagName === 'LI') {
            // Store the content of the original list in this variable that we'll update
            let newList = dragAndDrop.originalOrder;

            // index of the item being dragged
            const draggedFrom = dragAndDrop.draggedFrom;

            // index of the drop area being hovered
            const draggedTo = Number(event.currentTarget.dataset.position);

            // get the element that's at the position of "draggedFrom"
            const itemDragged = newList[draggedFrom!];

            // filter out the item being dragged
            const remainingItems = newList.filter((item, index) => index !== draggedFrom);

            // update the list
            newList = [
               ...remainingItems.slice(0, draggedTo),
               itemDragged,
               ...remainingItems.slice(draggedTo),
            ];

            // since this event fires many times
            // we check if the targets are actually
            // different:
            if (draggedTo !== dragAndDrop.draggedTo) {
               setDragAndDrop({
                  ...dragAndDrop,

                  // save the updated list state
                  // we will render this onDrop
                  updatedOrder: newList,
                  draggedTo: draggedTo,
               });
            }
         }
      },
      [dragAndDrop]
   );

   const handleOnDrop = useCallback(() => {
      // and reset the state of the DnD
      setDragAndDrop({
         ...dragAndDrop,
         draggedFrom: null,
         draggedTo: null,
         isDragging: false,
      });
   }, [dragAndDrop]);

   const isInitialMount = useRef(true);
   useEffect(() => {
      if (isInitialMount.current) {
         isInitialMount.current = false;
      } else {
         setList(dragAndDrop.updatedOrder);
      }
   }, [dragAndDrop]);

   useEffect(() => {
      const initialMap = new Map({
         target: 'map',
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

   useEffect(() => {
      for (let layer of layers) map?.addLayer(layer);
   }, [layers, map]);

   return (
      <div
         id="mapContainer"
         className="firstContainer container"
         onDrop={handleOnDrop}
         onDragOver={handleOnDragOver}
      >
         <header>
            <TabsMenu selectedTab="map" />
         </header>

         <section id="mainContainer" className="container">
            <div id="map"></div>
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
                        {list.map((layer, index) => {
                           return dragAndDrop && dragAndDrop.draggedTo === Number(index) ? (
                              <li
                                 key={index}
                                 className="layer container dropArea"
                                 draggable="true"
                                 onDragStart={handleOnDragStart}
                                 onDragOver={handleOnDragOver}
                                 onDrop={handleOnDrop}
                                 data-position={index}
                              ></li>
                           ) : (
                              <li
                                 key={index}
                                 className="layer container"
                                 title={layer.get('query')}
                                 draggable="true"
                                 onDragStart={handleOnDragStart}
                                 onDragOver={handleOnDragOver}
                                 onDrop={handleOnDrop}
                                 data-position={index}
                              >
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
                                                draggable="true"
                                                onDragStart={handleInputDrag}
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
                                                draggable="true"
                                                onDragStart={handleInputDrag}
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
                                             <li className="label" onClick={handleLabelChange}>
                                                Oi
                                             </li>
                                             <li className="label" onClick={handleLabelChange}>
                                                Oi
                                             </li>
                                             <li className="label" onClick={handleLabelChange}>
                                                Oi
                                             </li>
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
                                 <p className="text">Camada: {layer.get('id')}</p>
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
