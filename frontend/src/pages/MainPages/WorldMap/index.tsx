/*------------------------------------------------------------------------------------------------------------------------
|  A tipagem do Openlayers sofre um bug so utilizar a função getStyle,                                                   |
|     da VectorLayer. Apesar de, no arquivo "C:\Apache24\htdocs\TCC\frontend\node_modules\@types\ol\style\Style.d.ts"    |
|        o retorno ser especificado como "Style", por algum motivo esse retorno não é reconhecido, forçando a utilização |
|           de @ts-ignore por diversas vezes ao longo do arquivo,                                                        |
|                                                                                                                        |
|                                                                                                                        |
|                                                                                                                        |
------------------------------------------------------------------------------------------------------------------------*/

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
import Style from 'ol/style/Style';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import RegularShape from 'ol/style/RegularShape';
import Text from 'ol/style/Text';

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

export default function WorldMap() {
   const { layers, setLayers } = useContext(LayersContext);

   const [map, setMap] = useState<Map>();

   const [showSubtitle, setShowSubtitle] = useState(true);

   const [isPolygonMenuVisible, setIsPolygonMenuVisible] = useState<boolean[]>([]);
   const [isStrokeMenuVisible, setIsStrokeMenuVisible] = useState<boolean[]>([]);
   const [isLabelMenuVisible, setIsLabelMenuVisible] = useState<boolean[]>([]);
   const [isLayerVisible, setIsLayerVisible] = useState<boolean[]>((): boolean[] => {
      const layersVisibilities = [...layers].reverse().map((layer) => layer.getVisible());
      return layersVisibilities;
   });

   // Estados de utilidade. São estados utilizados para indicar ao react que o valor dos inputs foi atualizado (utilizando o set), o que  faz com que o react renderize novamente o componente em questão.
   // Ex: ao alterar o input de cor (do polígono ou da linha), usamos o setColor para dizer ao react que o input mudou, fazendo com que ele altere o input visualmente e renderize-o novamente.
   // eslint desativado para evitar os avisos das variáveis inutilizadas
   // eslint-disable-next-line
   const [color, setColor] = useState<string>();
   // eslint-disable-next-line
   const [size, setSize] = useState<number>();
   // eslint-disable-next-line
   const [shape, setShape] = useState<string>();

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

   const handleLabelChange = useCallback(
      (layer: VectorLayer, label: string) => {
         layer
            .getSource()
            .getFeatures()
            .forEach((feature) => {
               //@ts-ignore
               feature.setStyle(
                  new Style({
                     fill: new Fill({
                        color: '#423423',
                     }),
                     stroke: new Stroke({
                        color: '#967076',
                        width: 1,
                     }),
                     text: new Text({
                        text: feature.get('text')['sigla'],
                        fill: new Fill({
                           color: '#fff',
                        }),
                     }),
                  })
               );
            });

         let labelMenus = [...isLabelMenuVisible];
         labelMenus.fill(false);

         setIsLabelMenuVisible(labelMenus);
      },
      [isLabelMenuVisible]
   );

   const handleLayerVisibility = useCallback(
      (index, layer: VectorLayer) => {
         let layerVisibility = [...isLayerVisible];

         layerVisibility[index] = !isLayerVisible[index];
         if (isLayerVisible[index] === undefined) {
            layerVisibility[index] = false;
         }

         setIsLayerVisible(layerVisibility);

         if (layer.get('id') === 0) {
            if (map?.getTarget() === 'map') map.setTarget('');
            else map?.setTarget('map');
         }
         layer.setVisible(layerVisibility[index]);
      },
      [isLayerVisible, map]
   );

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

   const handleLayerStyle = useCallback(
      ({
         layer,
         polygonColor,
         polygonSize,
         polygonShape,
         strokeColor,
         strokeSize,
      }: {
         layer: VectorLayer;
         polygonColor?: boolean;
         polygonSize?: boolean;
         polygonShape?: string;
         strokeColor?: boolean;
         strokeSize?: boolean;
      }) => {
         const features = layer.getSource().getFeatures();
         const oldStyle = features[0].getStyle();
         // Openlayers não disponibiliza métodos para capturar a antiga regularShape da camada, tendo de ser feito um processo manual
         const { points, angle, rotation, radius, radius2 } = getShape(
            layer.get('shape'),
            layer.get('size')
         );

         if (polygonColor) {
            const newColor = (document.getElementById(
               `polygonColorPicker${layer.get('id')}`
            )! as HTMLInputElement).value;

            features.forEach((feature) => {
               feature.setStyle(
                  new Style({
                     fill: new Fill({
                        color: newColor,
                     }),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     //@ts-ignore
                     text: oldStyle.getText(),
                     image: new RegularShape({
                        fill: new Fill({
                           color: newColor,
                        }),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        points,
                        angle,
                        rotation,
                        radius,
                        radius2,
                     }),
                  })
               );
            });

            setColor(newColor);
         }

         if (polygonSize) {
            const newSize = Number(
               (document.getElementById(`polygonSizePicker${layer.get('id')}`)! as HTMLInputElement)
                  .value
            );

            layer.set('size', newSize);

            features.forEach((feature) => {
               feature.setStyle(
                  new Style({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     //@ts-ignore
                     stroke: oldStyle.getStroke(),
                     //@ts-ignore
                     text: oldStyle.getText(),
                     image: new RegularShape({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        points,
                        angle,
                        rotation,
                        radius: newSize,
                        radius2,
                     }),
                  })
               );
            });

            setSize(newSize);
         }

         if (polygonShape) {
            if (polygonShape === 'square') {
               const { points, angle, rotation, radius, radius2 } = getShape(
                  'square',
                  layer.get('size')
               );

               layer.set('shape', 'square');

               features.forEach((feature) => {
                  feature.setStyle(
                     new Style({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        image: new RegularShape({
                           //@ts-ignore
                           fill: oldStyle.getFill(),
                           //@ts-ignore
                           stroke: oldStyle.getStroke(),
                           points,
                           angle,
                           rotation,
                           radius,
                           radius2,
                        }),
                     })
                  );
               });
            }
            if (polygonShape === 'triangle') {
               const { points, angle, rotation, radius, radius2 } = getShape(
                  'triangle',
                  layer.get('size')
               );

               layer.set('shape', 'triangle');

               features.forEach((feature) => {
                  feature.setStyle(
                     new Style({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        image: new RegularShape({
                           //@ts-ignore
                           fill: oldStyle.getFill(),
                           //@ts-ignore
                           stroke: oldStyle.getStroke(),
                           points,
                           angle,
                           rotation,
                           radius,
                           radius2,
                        }),
                     })
                  );
               });
            }
            if (polygonShape === 'star') {
               const { points, angle, rotation, radius, radius2 } = getShape(
                  'star',
                  layer.get('size')
               );

               layer.set('shape', 'star');

               features.forEach((feature) => {
                  feature.setStyle(
                     new Style({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        image: new RegularShape({
                           //@ts-ignore
                           fill: oldStyle.getFill(),
                           //@ts-ignore
                           stroke: oldStyle.getStroke(),
                           points,
                           angle,
                           rotation,
                           radius,
                           radius2,
                        }),
                     })
                  );
               });
            }
            if (polygonShape === 'circle') {
               const { points, angle, rotation, radius, radius2 } = getShape(
                  'circle',
                  layer.get('size')
               );

               layer.set('shape', 'circle');

               features.forEach((feature) => {
                  feature.setStyle(
                     new Style({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        //@ts-ignore
                        stroke: oldStyle.getStroke(),
                        image: new RegularShape({
                           //@ts-ignore
                           fill: oldStyle.getFill(),
                           //@ts-ignore
                           stroke: oldStyle.getStroke(),
                           points,
                           angle,
                           rotation,
                           radius,
                           radius2,
                        }),
                     })
                  );
               });
            }

            setShape(polygonShape);
         }

         if (strokeColor) {
            const newColor = (document.getElementById(
               `strokeColorPicker${layer.get('id')}`
            )! as HTMLInputElement).value;

            features.forEach((feature) => {
               feature.setStyle(
                  new Style({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     stroke: new Stroke({
                        color: newColor,
                        //@ts-ignore
                        width: oldStyle.getStroke().getWidth(),
                     }),
                     //@ts-ignore
                     text: oldStyle.getText(),
                     image: new RegularShape({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        stroke: new Stroke({
                           color: newColor,
                           //@ts-ignore
                           width: oldStyle.getStroke().getWidth(),
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

            setColor(newColor);
         }

         if (strokeSize) {
            const newSize = Number(
               (document.getElementById(`strokeSizePicker${layer.get('id')}`)! as HTMLInputElement)
                  .value
            );

            features.forEach((feature) => {
               feature.setStyle(
                  new Style({
                     //@ts-ignore
                     fill: oldStyle.getFill(),
                     stroke: new Stroke({
                        //@ts-ignore
                        color: oldStyle.getStroke().getColor(),
                        width: newSize,
                     }),
                     //@ts-ignore
                     text: oldStyle.getText(),
                     image: new RegularShape({
                        //@ts-ignore
                        fill: oldStyle.getFill(),
                        stroke: new Stroke({
                           //@ts-ignore
                           color: oldStyle.getStroke().getColor(),
                           width: newSize,
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

            setSize(newSize);
         }
      },
      [getShape]
   );

   const handleLayerDownload = useCallback((layer: VectorLayer) => {
      const geoJson = JSON.stringify(layer.get('geoJson'));

      const file = new Blob([geoJson], { type: 'text/plain' });
      const downloadUrl = URL.createObjectURL(file);

      const downloadLink = document.createElement('a');
      downloadLink.download = `Layer ${layer.get('id')} - GeoJson.json`;
      downloadLink.href = downloadUrl;
      downloadLink.click();
   }, []);

   const handleLayerDelete = useCallback(
      (layer: VectorLayer) => {
         if (layer.get('id') === 0) {
            map?.setTarget('');
         }

         const listWithoutDeletedLayer = list.filter(
            (notDeletedLayer) => notDeletedLayer.get('id') !== layer.get('id')
         );
         setList(listWithoutDeletedLayer);

         const layersWithoutDeletedLayer = layers.filter(
            (notDeletedLayer) => notDeletedLayer.get('id') !== layer.get('id')
         );
         setLayers(layersWithoutDeletedLayer);

         for (let layer of layers) map?.removeLayer(layer);
      },
      [layers, list, map, setLayers]
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
      for (let layer of layers) {
         setList([...layers].reverse());

         map?.removeLayer(layer);
         map?.addLayer(layer);
      }
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
                           ) : layer.get('id') === 0 ? (
                              <li
                                 key={index}
                                 className="layer mapLayer container"
                                 title={layer.get('query')}
                                 draggable="true"
                                 onDragStart={handleOnDragStart}
                                 onDragOver={handleOnDragOver}
                                 onDrop={handleOnDrop}
                                 data-position={index}
                              >
                                 <div className="buttons container">
                                    {isLayerVisible[index] ||
                                    isLayerVisible[index] === undefined ? (
                                       <button
                                          className="toggleVisibility layerVisible"
                                          onClick={() => handleLayerVisibility(index, layer)}
                                       >
                                          <FaEyeSlash />
                                       </button>
                                    ) : (
                                       <button
                                          className="toggleVisibility"
                                          onClick={() => handleLayerVisibility(index, layer)}
                                       >
                                          <FaEye />
                                       </button>
                                    )}

                                    <button
                                       className="delete"
                                       onClick={() => handleLayerDelete(layer)}
                                    >
                                       <FaTrash />
                                    </button>
                                 </div>
                                 <p className="text">Camada: {layer.get('id')}</p>
                              </li>
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
                                             <input
                                                type="color"
                                                id={`polygonColorPicker${layer.get('id')}`}
                                                className="colorPicker"
                                                value={layer
                                                   .getSource()
                                                   .getFeatures()[0]
                                                   .getStyle()
                                                   //@ts-ignore
                                                   .getFill()
                                                   .getColor()}
                                                onChange={() =>
                                                   handleLayerStyle({ layer, polygonColor: true })
                                                }
                                             />
                                             <input
                                                id={`polygonSizePicker${layer.get('id')}`}
                                                type="range"
                                                className="sizePicker"
                                                min={5}
                                                max={15}
                                                step={0.1}
                                                value={layer.get('size')}
                                                onChange={() =>
                                                   handleLayerStyle({ layer, polygonSize: true })
                                                }
                                                draggable="true"
                                                onDragStart={handleInputDrag}
                                             />
                                             <div className="polygonShapesPicker container">
                                                <button
                                                   className={
                                                      layer.get('shape') === 'square'
                                                         ? 'selectedShape shape'
                                                         : 'shape'
                                                   }
                                                   onClick={() =>
                                                      handleLayerStyle({
                                                         layer,
                                                         polygonShape: 'square',
                                                      })
                                                   }
                                                >
                                                   <FaSquare />
                                                </button>
                                                <button
                                                   className={
                                                      layer.get('shape') === 'triangle'
                                                         ? 'selectedShape shape'
                                                         : 'shape'
                                                   }
                                                   onClick={() =>
                                                      handleLayerStyle({
                                                         layer,
                                                         polygonShape: 'triangle',
                                                      })
                                                   }
                                                >
                                                   <FaPlay />
                                                </button>
                                                <button
                                                   className={
                                                      layer.get('shape') === 'star'
                                                         ? 'selectedShape shape'
                                                         : 'shape'
                                                   }
                                                   onClick={() =>
                                                      handleLayerStyle({
                                                         layer,
                                                         polygonShape: 'star',
                                                      })
                                                   }
                                                >
                                                   <FaStar />
                                                </button>
                                                <button
                                                   className={
                                                      layer.get('shape') === 'circle'
                                                         ? 'selectedShape shape'
                                                         : 'shape'
                                                   }
                                                   onClick={() =>
                                                      handleLayerStyle({
                                                         layer,
                                                         polygonShape: 'circle',
                                                      })
                                                   }
                                                >
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
                                             <input
                                                type="color"
                                                id={`strokeColorPicker${layer.get('id')}`}
                                                className="colorPicker" //
                                                value={layer
                                                   .getSource()
                                                   .getFeatures()[0]
                                                   .getStyle()
                                                   //@ts-ignore
                                                   .getStroke()
                                                   .getColor()}
                                                onChange={() =>
                                                   handleLayerStyle({ layer, strokeColor: true })
                                                }
                                             />
                                             <input
                                                id={`strokeSizePicker${layer.get('id')}`}
                                                type="range"
                                                className="sizePicker"
                                                min={1}
                                                max={5}
                                                step={0.1}
                                                //@ts-ignore
                                                value={layer
                                                   .getSource()
                                                   .getFeatures()[0]
                                                   .getStyle()
                                                   //@ts-ignore
                                                   .getStroke()
                                                   .getWidth()}
                                                onChange={() =>
                                                   handleLayerStyle({ layer, strokeSize: true })
                                                }
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
                                             {layer
                                                .get('labels')
                                                .map((label: string, index: number) => (
                                                   <li
                                                      key={index}
                                                      className="label"
                                                      onClick={() =>
                                                         handleLabelChange(layer, 'gid')
                                                      }
                                                   >
                                                      {label}
                                                   </li>
                                                ))}
                                          </ul>
                                       )}
                                    </div>

                                    {isLayerVisible[index] ||
                                    isLayerVisible[index] === undefined ? (
                                       <button
                                          className="toggleVisibility layerVisible"
                                          onClick={() => handleLayerVisibility(index, layer)}
                                       >
                                          <FaEyeSlash />
                                       </button>
                                    ) : (
                                       <button
                                          className="toggleVisibility"
                                          onClick={() => handleLayerVisibility(index, layer)}
                                       >
                                          <FaEye />
                                       </button>
                                    )}

                                    <button
                                       className="download"
                                       onClick={() => handleLayerDownload(layer)}
                                    >
                                       <FaDownload />
                                    </button>

                                    <button
                                       className="delete"
                                       onClick={() => handleLayerDelete(layer)}
                                    >
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
