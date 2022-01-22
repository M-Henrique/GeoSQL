import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';

import {
   FaList,
   FaShapes,
   FaGripLines,
   FaEyeSlash,
   FaDownload,
   FaTrash,
   FaCaretDown,
   FaEye,
   FaPaintBrush,
   FaChartPie,
   FaTimes,
} from 'react-icons/fa';

import { SlideDown } from 'react-slidedown';

import ReactTooltip from 'react-tooltip';

import Map from 'ol/Map';
import View from 'ol/View';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import { fromLonLat, toLonLat } from 'ol/proj';
import VectorSource from 'ol/source/Vector';
import VectorLayer from 'ol/layer/Vector';
import Overlay from 'ol/Overlay';
import { Coordinate, toStringHDMS } from 'ol/coordinate';
import Select from 'ol/interaction/Select';

import TablesContext from '../../../contexts/tables';
import LayersContext, { IFilter, IFilterSubtitle } from '../../../contexts/layers';

import TabsMenu from '../../../components/TabsMenu';

import PolygonMenu from '../../../components/SubtitleComponents/PolygonMenu';
import StrokeMenu from '../../../components/SubtitleComponents/StrokeMenu';
import LabelMenu from '../../../components/SubtitleComponents/LabelMenu';

import 'ol/ol.css';
import 'react-slidedown/lib/slidedown.css';

import './styles.css';

// Interface para ajudar na detecção e controle da funcionalidade de drag da legenda.
interface DnDProps {
   draggedFrom: number | null;
   draggedTo: number | null;

   isDragging: boolean;

   originalOrder: VectorLayer<VectorSource<any>>[];
   updatedOrder: VectorLayer<VectorSource<any>>[];
}

export default function WorldMap() {
   const { database } = useContext(TablesContext);
   const {
      layers,
      setLayers,

      handleIntervalFilter,
      handlePercentileFilter,
      handleCategoryFilter,

      handleChangeSpecificFeatures,

      handleEraseFilter,
   } = useContext(LayersContext);

   // Estado que mantém o mapa em si.
   const [map, setMap] = useState<Map>();

   // Estado que indica se a legenda deve ser exibida ou não.
   const [showSubtitle, setShowSubtitle] = useState(true);
   // Estado que indica se a legenda dos filtros deve ser exibida ou não.
   const [showFilterSubtitle, setShowFilterSubtitle] = useState<boolean[]>((): boolean[] => {
      const visibilities: boolean[] = [];
      layers.forEach(() => visibilities.push(true));
      return visibilities;
   });

   // Flags para controlar qual menu de qual camada está aberto (na legenda).
   const [isPolygonMenuVisible, setIsPolygonMenuVisible] = useState<boolean[]>([]);
   const [isStrokeMenuVisible, setIsStrokeMenuVisible] = useState<boolean[]>([]);
   const [isLabelMenuVisible, setIsLabelMenuVisible] = useState<boolean[]>([]);
   const [isFilterColorMenuVisible, setIsFilterColorMenuVisible] = useState<boolean[]>([]);

   // Estado inicial criado a partir da configuração de visualização das camadas, para que, ao mudar de página, o ícone de visibilidade continue de acordo com a visiblidade da respectiva camada.
   const [isLayerVisible, setIsLayerVisible] = useState<boolean[]>((): boolean[] => {
      const layersVisibilities = [...layers].reverse().map((layer) => layer.getVisible());
      return layersVisibilities;
   });

   // Estado de utilidade. Estado utilizado para indicar ao react que o valor de um input foi atualizado (utilizando o set), o que faz com que o react renderize novamente o componente em questão.
   const [flag, setFlag] = useState<boolean>(false);

   /*----------------------------- Funções responsáveis por aplicar o zoom e o centro ao mapa baseados no banco selecionado -------------------------------------------*/
   const handleMapCenter = useCallback((): Coordinate => {
      const databaseName = database.replace('geosql_', '');

      switch (databaseName) {
         case 'brasil':
         case 'br_rodovias':
            return fromLonLat([-50.809373, -18.022386]);
         case 'minasgerais':
            return fromLonLat([-45.00894, -19.264079]);
         case 'belohorizonte':
            return fromLonLat([-43.951818, -19.936346]);
         default:
            return fromLonLat([35.083466, 4.561883]);
      }
   }, [database]);

   const handleMapZoom = useCallback((): number => {
      const databaseName = database.replace('geosql_', '');

      switch (databaseName) {
         case 'brasil':
         case 'br_rodovias':
            return 4.9;
         case 'minasgerais':
            return 7;
         case 'belohorizonte':
            return 11.95;
         default:
            return 1.5;
      }
   }, [database]);

   /*----------------------------------------- Função que fecha o popup --------------------------------------------------*/
   const handleClosePopup = useCallback(() => {
      // Seleciona a overlay e o select do mapa, além do X que fecha o popup.
      const overlay = map?.getOverlayById('overlay');
      const popupCloser = document.getElementById('popupCloser');
      const select = map
         ?.getInteractions()
         .getArray()
         .filter((interaction) => interaction.getProperties().id)[0] as Select;

      // Limpa as seleções, apaga o overlay e o X.
      select.getFeatures().clear();
      //@ts-ignore
      overlay?.setPosition(undefined);
      popupCloser?.blur();
   }, [map]);

   /*----------------------- Estados e funções relativos à funcionalidade de drag das camadas na legenda (referência: https://dev.to/florantara/creating-a-drag-and-drop-list-with-react-hooks-4c0i) -----------------------*/

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

   const handleOnDragStart = useCallback(
      (event) => {
         // Remove a visibilidade de todos os menus, para evitar inconsistências no drag.
         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));

         //Acessamos o elemento "data-position" do elemento sendo draggado.
         const initialPosition = Number(event.currentTarget.dataset.position);

         setDragAndDrop({
            ...dragAndDrop,

            draggedFrom: initialPosition,
            isDragging: true,
            originalOrder: list,
         });

         // Apenas para o Firefox.
         event.dataTransfer.setData('text/html', '');
      },
      [dragAndDrop, isLabelMenuVisible, isPolygonMenuVisible, isStrokeMenuVisible, list]
   );

   const handleOnDragOver = useCallback(
      (event) => {
         event.preventDefault();

         // Garante que o objeto seja "dragável" apenas sobre a legenda.
         if (event.currentTarget.tagName === 'LI') {
            let newList = dragAndDrop.originalOrder;
            const draggedFrom = dragAndDrop.draggedFrom;
            const draggedTo = Number(event.currentTarget.dataset.position);
            const itemDragged = newList[draggedFrom!];
            const remainingItems = newList.filter((item, index) => index !== draggedFrom);

            // Reposicionamento do elemento na lista.
            newList = [
               ...remainingItems.slice(0, draggedTo),
               itemDragged,
               ...remainingItems.slice(draggedTo),
            ];

            // Checagem se os elementos são de fato diferentes, para evitar renders desnecessários.
            if (draggedTo !== dragAndDrop.draggedTo) {
               // Atualiza a ordem do array de layers, reposicionando as mesmas em mapa.
               setLayers([...newList].reverse());

               setDragAndDrop({
                  ...dragAndDrop,

                  updatedOrder: newList,
                  draggedTo: draggedTo,
               });
            }
         }
      },
      [dragAndDrop, setLayers]
   );

   const handleOnDrop = useCallback(() => {
      setDragAndDrop({
         ...dragAndDrop,
         draggedFrom: null,
         draggedTo: null,
         isDragging: false,
      });
   }, [dragAndDrop]);

   /*------------------------------ Funções de controle sobre os menus que estão abertos --------------------------------------------*/

   const handlePolygonMenuVisibility = useCallback(
      (index) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         // Alterna a visibilidade apenas do menu referente à camada selecionada visível.
         let polygonMenus = [...isPolygonMenuVisible];
         polygonMenus.fill(false);

         polygonMenus[index] = !isPolygonMenuVisible[index];
         setIsPolygonMenuVisible(polygonMenus);

         // Remove a visibilidade dos outros menus.
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));
         setIsFilterColorMenuVisible(isFilterColorMenuVisible.fill(false));
      },
      [
         handleClosePopup,
         isLabelMenuVisible,
         isPolygonMenuVisible,
         isStrokeMenuVisible,
         isFilterColorMenuVisible,
      ]
   );

   const handleStrokeMenuVisibility = useCallback(
      (index) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         let strokeMenus = [...isStrokeMenuVisible];
         strokeMenus.fill(false);

         strokeMenus[index] = !isStrokeMenuVisible[index];
         setIsStrokeMenuVisible(strokeMenus);

         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));
         setIsFilterColorMenuVisible(isFilterColorMenuVisible.fill(false));
      },
      [
         handleClosePopup,
         isLabelMenuVisible,
         isPolygonMenuVisible,
         isStrokeMenuVisible,
         isFilterColorMenuVisible,
      ]
   );

   const handleLabelMenuVisibility = useCallback(
      (index) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         let labelMenus = [...isLabelMenuVisible];
         labelMenus.fill(false);

         labelMenus[index] = !isLabelMenuVisible[index];
         setIsLabelMenuVisible(labelMenus);

         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsFilterColorMenuVisible(isFilterColorMenuVisible.fill(false));
      },
      [
         handleClosePopup,
         isLabelMenuVisible,
         isPolygonMenuVisible,
         isStrokeMenuVisible,
         isFilterColorMenuVisible,
      ]
   );

   const handleFilterColorMenuVisibility = useCallback(
      (index) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         let filterColorMenus = [...isFilterColorMenuVisible];
         filterColorMenus.fill(false);

         filterColorMenus[index] = !isFilterColorMenuVisible[index];
         setIsFilterColorMenuVisible(filterColorMenus);

         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));
      },
      [
         handleClosePopup,
         isLabelMenuVisible,
         isPolygonMenuVisible,
         isStrokeMenuVisible,
         isFilterColorMenuVisible,
      ]
   );

   /*----------------------------------------- Funções referentes às outras funcionalidades da legenda --------------------------------------------------*/

   const handleLayerVisibility = useCallback(
      (index, layer: VectorLayer<VectorSource<any>>) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         // Alterna a visibilidade apenas da camada selecionada.
         let layerVisibility = [...isLayerVisible];

         layerVisibility[index] = !isLayerVisible[index];
         if (isLayerVisible[index] === undefined) {
            layerVisibility[index] = false;
         }

         setIsLayerVisible(layerVisibility);

         // Caso a camada selecionada seja referente ao mapa, torna o mapa invisível.
         if (layer.get('id') === 0) {
            if (map?.getTarget() === 'map') map.setTarget('');
            else map?.setTarget('map');
         }

         // Alterna a visibilidade da camada em mapa.
         layer.setVisible(layerVisibility[index]);
      },
      [handleClosePopup, isLayerVisible, map]
   );

   const handleLayerDownload = useCallback(
      (layer: VectorLayer<VectorSource<any>>) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         const geoJson = JSON.stringify(layer.get('geoJson'));

         // Cria um arquivo com as informações geoJson da camada.
         const file = new Blob([geoJson], { type: 'application/json' });
         const downloadUrl = URL.createObjectURL(file);

         // Cria um link de download na DOM e clica para realizar o download.
         const downloadLink = document.createElement('a');
         downloadLink.download = `Layer ${layer.get('id')} - GeoJson.json`;
         downloadLink.href = downloadUrl;
         downloadLink.click();
      },
      [handleClosePopup]
   );

   const handleLayerDelete = useCallback(
      (layer: VectorLayer<VectorSource<any>>) => {
         // Fecha possíveis popups abertas (caso haja uma aberta, o app crasha ao tentar modificar uma camada).
         handleClosePopup();

         // Caso seja a camada referente ao mapa.
         if (layer.get('id') === 0) {
            map?.setTarget('');
         }

         // Atualiza a legenda.
         const listWithoutDeletedLayer = list.filter(
            (notDeletedLayer) => notDeletedLayer.get('id') !== layer.get('id')
         );
         setList(listWithoutDeletedLayer);

         // Atualiza o array de camadas.
         const layersWithoutDeletedLayer = layers.filter(
            (notDeletedLayer) => notDeletedLayer.get('id') !== layer.get('id')
         );
         setLayers(layersWithoutDeletedLayer);

         // Remove todas as layers para que possam ser renderizadas novamente, para evitar duplicação de adição de camadas.
         for (let layer of layers) map?.removeLayer(layer);
      },
      [handleClosePopup, layers, list, map, setLayers]
   );

   // Função que realiza a submissão dos filtros para o contexto
   const handleSubmitFilter = useCallback(
      (layerID: number) => {
         handleClosePopup();

         const { value: filterType } = document.getElementById(
            `filterTypeSelect${layerID}`
         ) as HTMLSelectElement;

         switch (filterType) {
            case 'Intervalos':
               handleIntervalFilter(layerID);

               break;

            case 'Percentil':
               handlePercentileFilter(layerID);

               break;

            case 'Categoria':
               handleCategoryFilter(layerID);

               break;

            default:
               break;
         }

         setFlag(!flag);
      },
      [handleClosePopup, handleIntervalFilter, handlePercentileFilter, handleCategoryFilter, flag]
   );

   // Função que impede o usuário de digitar valores não numéricos nos inputs textuais dos filtros numéricos (intervalos e percentil)
   const checkNumericalDigit = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
      switch (e.key) {
         case '1':
         case '2':
         case '3':
         case '4':
         case '5':
         case '6':
         case '7':
         case '8':
         case '9':
         case '0':
            break;

         default:
            e.preventDefault();
            break;
      }
   }, []);

   // Função de utilidade para impedir que o arrasto do mouse ao selecionar o conteúdo do input de texto inicie um drag da camada.
   const handleInputDrag = useCallback((event) => {
      event.preventDefault();
      event.stopPropagation();
   }, []);

   /*----------------------------------------- Função que realiza o update visual da legenda após o drag --------------------------------------------------*/

   const isInitialMount = useRef(true);
   useEffect(() => {
      if (isInitialMount.current) {
         isInitialMount.current = false;
      } else {
         setList(dragAndDrop.updatedOrder);
      }

      return () => {};
   }, [dragAndDrop]);

   /*------------------------------------- Função que monta o mapa e adiciona as funcionalidades de popup e seleção de features ------------------------------------*/
   useEffect(() => {
      // Elementos do popup.
      const container = document.getElementById('popup')!;
      const content = document.getElementById('popupContent')!;

      // Overlay que permite o popup aparecer acima do mapa.
      const overlay = new Overlay({
         id: 'overlay',
         element: container,
         autoPan: true,
         autoPanAnimation: {
            duration: 250,
         },
      });

      // Seleção das features.
      const select = new Select();
      select.set('id', 'select');

      // O mapa em si.
      const initialMap = new Map({
         target: 'map',
         layers: [
            new TileLayer({
               source: new OSM(),
            }),
         ],
         view: new View({
            center: handleMapCenter(),
            zoom: handleMapZoom(),
         }),
         overlays: [overlay],
      });

      initialMap?.addInteraction(select);

      // Interação de clique para gerar o popup.
      initialMap.on('singleclick', function (event) {
         setIsPolygonMenuVisible(isPolygonMenuVisible.fill(false));
         setIsStrokeMenuVisible(isStrokeMenuVisible.fill(false));
         setIsLabelMenuVisible(isLabelMenuVisible.fill(false));

         const coordinate = event.coordinate;
         const hdms = toStringHDMS(toLonLat(coordinate));
         const feature = initialMap.getFeaturesAtPixel(event.pixel)[0];

         content.innerHTML = '<p>Você clicou aqui:</p><code>' + hdms + '</code>';

         if (feature) {
            let featureInfo = '<br><br><ul>';

            for (let [label, value] of Object.entries(feature.get('info'))) {
               featureInfo += `<li><span>${label.toUpperCase()}:</span> ${value}</li>`;
            }

            featureInfo += '</ul>';
            content.innerHTML += featureInfo;
         }

         overlay.setPosition(coordinate);
      });

      setMap(initialMap);

      // Desmonte do componente (para evitar que o select permaneça após sair da página)
      return () => {
         select.getFeatures().clear();
      };
      // Necessário para evitar loops infinitos na criação do mapa
      // eslint-disable-next-line react-hooks/exhaustive-deps
   }, []);

   /*--------------------------------- Função que realiza a renderização das layers no mapa ------------------------------------*/
   useEffect(() => {
      for (let layer of layers) {
         setList([...layers].reverse());

         map?.removeLayer(layer);
         map?.addLayer(layer);
      }

      return () => {};
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

            <div id="popup">
               <button id="popupCloser" onClick={handleClosePopup}>
                  X
               </button>
               <div id="popupContent"></div>
            </div>

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
                                       <>
                                          <button
                                             data-tip="Alternar visibilidade"
                                             data-background-color="rgb(59, 59, 59)"
                                             className="toggleVisibility layerVisible"
                                             onClick={() => handleLayerVisibility(index, layer)}
                                          >
                                             <FaEyeSlash />
                                          </button>
                                          <ReactTooltip place="left" type="dark" effect="solid" />
                                       </>
                                    ) : (
                                       <>
                                          <button
                                             data-tip="Alternar visibilidade"
                                             data-background-color="rgb(59, 59, 59)"
                                             className="toggleVisibility"
                                             onClick={() => handleLayerVisibility(index, layer)}
                                          >
                                             <FaEye />
                                          </button>
                                          <ReactTooltip place="left" type="dark" effect="solid" />
                                       </>
                                    )}

                                    <button
                                       data-tip="Excluir camada"
                                       data-background-color="rgb(59, 59, 59)"
                                       className="delete"
                                       onClick={() => handleLayerDelete(layer)}
                                    >
                                       <FaTrash />
                                    </button>
                                    <ReactTooltip place="left" type="dark" effect="solid" />
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
                                          data-tip="Alterar cor, tamanho ou forma"
                                          data-background-color="rgb(59, 59, 59)"
                                          className="togglePolygonMenu"
                                          onClick={() => handlePolygonMenuVisibility(index)}
                                       >
                                          <FaShapes />
                                          <FaCaretDown />
                                       </button>
                                       <ReactTooltip place="left" type="dark" effect="solid" />

                                       {isPolygonMenuVisible[index] && (
                                          <PolygonMenu layer={layer} />
                                       )}
                                    </div>

                                    <div className="customizeStroke customization">
                                       <button
                                          data-tip="Alterar cor ou grossura do contorno"
                                          data-background-color="rgb(59, 59, 59)"
                                          className="toggleStrokeMenu"
                                          onClick={() => handleStrokeMenuVisibility(index)}
                                       >
                                          <FaGripLines />
                                          <FaCaretDown />
                                       </button>
                                       <ReactTooltip place="left" type="dark" effect="solid" />

                                       {isStrokeMenuVisible[index] && <StrokeMenu layer={layer} />}
                                    </div>

                                    <div className="customizeLabel customization">
                                       <button
                                          data-tip="Alterar tamanho, cor ou conteúdo do rótulo exibido"
                                          data-background-color="rgb(59, 59, 59)"
                                          className="toggleLabelMenu"
                                          onClick={() => handleLabelMenuVisibility(index)}
                                       >
                                          Rótulo <FaCaretDown />
                                       </button>
                                       <ReactTooltip place="left" type="dark" effect="solid" />

                                       {isLabelMenuVisible[index] && <LabelMenu layer={layer} />}
                                    </div>

                                    {isLayerVisible[index] ||
                                    isLayerVisible[index] === undefined ? (
                                       <>
                                          <button
                                             data-tip="Alternar visibilidade"
                                             data-background-color="rgb(59, 59, 59)"
                                             className="toggleVisibility layerVisible"
                                             onClick={() => handleLayerVisibility(index, layer)}
                                          >
                                             <FaEyeSlash />
                                          </button>
                                          <ReactTooltip place="left" type="dark" effect="solid" />
                                       </>
                                    ) : (
                                       <>
                                          <button
                                             data-tip="Alternar visibilidade"
                                             data-background-color="rgb(59, 59, 59)"
                                             className="toggleVisibility"
                                             onClick={() => handleLayerVisibility(index, layer)}
                                          >
                                             <FaEye />
                                          </button>
                                          <ReactTooltip place="left" type="dark" effect="solid" />
                                       </>
                                    )}

                                    <button
                                       data-tip="Baixar camada (geoJSON)"
                                       data-background-color="rgb(59, 59, 59)"
                                       className="download"
                                       onClick={() => handleLayerDownload(layer)}
                                    >
                                       <FaDownload />
                                    </button>
                                    <ReactTooltip place="left" type="dark" effect="solid" />

                                    <button
                                       data-tip="Excluir camada"
                                       data-background-color="rgb(59, 59, 59)"
                                       data-event-off="mouseleave"
                                       className="delete"
                                       onClick={() => handleLayerDelete(layer)}
                                    >
                                       <FaTrash />
                                       <ReactTooltip place="left" type="dark" effect="solid" />
                                    </button>
                                 </div>

                                 <p className="text">Camada: {layer.get('id')}</p>

                                 <div className="filterContainer container">
                                    <select
                                       name={`filterTypeSelect${layer.get('id')}`}
                                       id={`filterTypeSelect${layer.get('id')}`}
                                       className="filterTypeSelect"
                                       value={(layer.get('filter') as IFilter).type}
                                       onChange={({ target: { value } }) => {
                                          (layer.get('filter') as IFilter).type = value;
                                          (layer.get('filter') as IFilter).label = '';
                                          (layer.get('filter') as IFilter).value = '';

                                          setFlag(!flag);
                                       }}
                                       data-tip="Selecionar tipo do filtro"
                                       data-background-color="rgb(59, 59, 59)"
                                    >
                                       <option value=""></option>
                                       {['Intervalos', 'Percentil', 'Categoria'].map(
                                          (op: string) => (
                                             <option key={op} value={op}>
                                                {op}
                                             </option>
                                          )
                                       )}
                                    </select>
                                    <ReactTooltip place="left" type="dark" effect="solid" />

                                    <select
                                       name={`filterLabelSelect${layer.get('id')}`}
                                       id={`filterLabelSelect${layer.get('id')}`}
                                       value={(layer.get('filter') as IFilter).label}
                                       onChange={({ target: { value } }) => {
                                          (layer.get('filter') as IFilter).label = value;

                                          setFlag(!flag);
                                       }}
                                       data-tip="Selecionar rótulo do filtro"
                                       data-background-color="rgb(59, 59, 59)"
                                    >
                                       <option value=""></option>
                                       {layer.get('labels').map((label: string) =>
                                          layer.get('filter').type !== 'Categoria' ? (
                                             !isNaN(
                                                Number(
                                                   layer.getSource().getFeatures()[0].get('info')[
                                                      label
                                                   ]
                                                )
                                             ) && (
                                                <option key={label} value={label}>
                                                   {label}
                                                </option>
                                             )
                                          ) : (
                                             <option key={label} value={label}>
                                                {label}
                                             </option>
                                          )
                                       )}
                                    </select>
                                    <ReactTooltip place="left" type="dark" effect="solid" />

                                    {document.getElementById(
                                       `filterTypeSelect${layer.get('id')}`
                                    ) &&
                                       (
                                          document.getElementById(
                                             `filterTypeSelect${layer.get('id')}`
                                          ) as HTMLSelectElement
                                       ).value !== 'Categoria' && (
                                          <>
                                             <input
                                                id={`filterValueInput${layer.get('id')}`}
                                                type="text"
                                                style={{ paddingLeft: '0.2rem' }}
                                                draggable="true"
                                                onDragStart={handleInputDrag}
                                                value={(layer.get('filter') as IFilter).value}
                                                maxLength={2}
                                                onKeyPress={(e) => {
                                                   checkNumericalDigit(e);
                                                }}
                                                onChange={({ target: { value } }) => {
                                                   (layer.get('filter') as IFilter).value = value;

                                                   setFlag(!flag);
                                                }}
                                                data-tip="Inserir valor do filtro (e.g nº de intervalos)"
                                                data-background-color="rgb(37, 37, 37)"
                                             />
                                             <ReactTooltip
                                                place="left"
                                                type="dark"
                                                effect="solid"
                                             />
                                          </>
                                       )}

                                    <div className="customizeFilters customization">
                                       <button
                                          data-tip="Aplicar cores ao filtro"
                                          data-background-color="rgb(59, 59, 59)"
                                          onClick={() => handleFilterColorMenuVisibility(index)}
                                       >
                                          <FaPaintBrush />
                                       </button>
                                       <ReactTooltip place="left" type="dark" effect="solid" />

                                       {isFilterColorMenuVisible[index] && (
                                          <div className="filterColorPickersMenu menu container">
                                             <div>
                                                <span>Preenchimento</span>

                                                <input
                                                   id={`filterFillColorPicker${layer.get('id')}`}
                                                   type="color"
                                                   className="filterFillColorPicker"
                                                   value={
                                                      (layer.get('filter') as IFilter).fillColor
                                                   }
                                                   onChange={({ target: { value } }) => {
                                                      (layer.get('filter') as IFilter).fillColor =
                                                         value;

                                                      setFlag(!flag);
                                                   }}
                                                />

                                                <div>
                                                   <input
                                                      type="checkbox"
                                                      id={`randomFilterFillColor${layer.get('id')}`}
                                                      name={`randomFilterFillColor${layer.get(
                                                         'id'
                                                      )}`}
                                                      checked={
                                                         (layer.get('filter') as IFilter)
                                                            .isFillColorRandom
                                                      }
                                                      onChange={({ target: { checked } }) => {
                                                         (
                                                            layer.get('filter') as IFilter
                                                         ).isFillColorRandom = checked;

                                                         setFlag(!flag);
                                                      }}
                                                   />
                                                   <label
                                                      htmlFor={`randomFilterFillColor${layer.get(
                                                         'id'
                                                      )}`}
                                                   >
                                                      Cores aleatórias
                                                   </label>
                                                </div>
                                             </div>

                                             <div>
                                                <span>Contorno</span>

                                                <input
                                                   id={`filterStrokeColorPicker${layer.get('id')}`}
                                                   type="color"
                                                   className="filterStrokeColorPicker"
                                                   value={
                                                      (layer.get('filter') as IFilter).strokeColor
                                                   }
                                                   onChange={({ target: { value } }) => {
                                                      (layer.get('filter') as IFilter).strokeColor =
                                                         value;

                                                      setFlag(!flag);
                                                   }}
                                                />

                                                <div>
                                                   <input
                                                      type="checkbox"
                                                      id={`randomStrokeFilterColor${layer.get(
                                                         'id'
                                                      )}`}
                                                      name={`randomStrokeFilterColor${layer.get(
                                                         'id'
                                                      )}`}
                                                      checked={
                                                         (layer.get('filter') as IFilter)
                                                            .isStrokeColorRandom
                                                      }
                                                      onChange={({ target: { checked } }) => {
                                                         (
                                                            layer.get('filter') as IFilter
                                                         ).isStrokeColorRandom = checked;

                                                         setFlag(!flag);
                                                      }}
                                                   />
                                                   <label
                                                      htmlFor={`randomStrokeFilterColor${layer.get(
                                                         'id'
                                                      )}`}
                                                   >
                                                      Cores aleatórias
                                                   </label>
                                                </div>
                                             </div>
                                          </div>
                                       )}
                                    </div>

                                    <button
                                       id="submitFilter"
                                       onClick={() => handleSubmitFilter(layer.get('id'))}
                                       data-tip="Submeter filtragem"
                                       data-background-color="rgb(59, 59, 59)"
                                    >
                                       <FaChartPie />
                                    </button>
                                    <ReactTooltip place="left" type="info" effect="solid" />

                                    <FaTimes
                                       id="filterErase"
                                       onClick={() => {
                                          handleEraseFilter(layer.get('id'));

                                          setFlag(!flag);
                                       }}
                                       data-tip="Remover filtro"
                                       data-background-color="rgb(59, 59, 59)"
                                    />
                                    <ReactTooltip place="left" type="info" effect="solid" />
                                 </div>

                                 <button
                                    id="toggleSubtitle"
                                    className="container"
                                    style={{ margin: 0, marginBottom: '0.2rem', padding: '0.2rem' }}
                                    onClick={() => {
                                       let newShowFilterSubtitle = [...showFilterSubtitle];

                                       newShowFilterSubtitle[index] = !newShowFilterSubtitle[index];
                                       setShowFilterSubtitle(newShowFilterSubtitle);
                                    }}
                                    data-tip="Alternar visibilidade da legenda de filtro"
                                    data-background-color="rgb(59, 59, 59)"
                                 >
                                    <FaList id="toggleSubtitleIcon" size={30} />
                                 </button>
                                 <ReactTooltip place="left" type="info" effect="solid" />

                                 <SlideDown>
                                    {showFilterSubtitle[index] &&
                                       layer.get('filterSubtitle').length > 0 && (
                                          <ul className="filterSubtitleContainer">
                                             {layer
                                                .get('filterSubtitle')
                                                .map(
                                                   (
                                                      {
                                                         type,
                                                         minValue,
                                                         maxValue,
                                                         categoryValue,
                                                         fillColor,
                                                         strokeColor,
                                                         filteredFeatures,
                                                      }: IFilterSubtitle,
                                                      index: number
                                                   ) => (
                                                      <li key={index}>
                                                         <div>
                                                            <span>{`${type} ${index + 1}:`}</span>{' '}
                                                            {`${
                                                               minValue || minValue === 0
                                                                  ? `${minValue}${
                                                                       type === 'Percentil'
                                                                          ? '%'
                                                                          : ''
                                                                    } - `
                                                                  : ''
                                                            }${
                                                               type === 'Percentil' &&
                                                               maxValue &&
                                                               maxValue > 100
                                                                  ? 100
                                                                  : maxValue || maxValue === 0
                                                                  ? maxValue
                                                                  : ''
                                                            }${type === 'Percentil' ? '%' : ''} ${
                                                               categoryValue ? categoryValue : ''
                                                            } `}
                                                         </div>

                                                         <div>
                                                            <input
                                                               type="color"
                                                               value={fillColor}
                                                               onChange={({
                                                                  target: { value },
                                                               }) => {
                                                                  handleChangeSpecificFeatures(
                                                                     layer.get('id'),
                                                                     filteredFeatures,
                                                                     value,
                                                                     strokeColor
                                                                  );

                                                                  setFlag(!flag);
                                                               }}
                                                            />
                                                            <input
                                                               type="color"
                                                               value={strokeColor}
                                                               onChange={({
                                                                  target: { value },
                                                               }) => {
                                                                  handleChangeSpecificFeatures(
                                                                     layer.get('id'),
                                                                     filteredFeatures,
                                                                     fillColor,
                                                                     value
                                                                  );

                                                                  setFlag(!flag);
                                                               }}
                                                            />
                                                         </div>
                                                      </li>
                                                   )
                                                )}
                                          </ul>
                                       )}
                                 </SlideDown>

                                 <ReactTooltip place="left" type="info" effect="solid" />
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
