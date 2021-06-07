/* Contexto que armazena o vetor de Filters, juntamente de suas informações e características, que serão mostradas em mapa. */

import React, { createContext, useCallback, useContext, useState } from 'react';

import { Feature } from 'ol';
import VectorLayer from 'ol/layer/Vector';

import Fill from 'ol/style/Fill';
import RegularShape from 'ol/style/RegularShape';

import LayersContext from '../contexts/layers';

// Interface do array de filtros.
interface IFilter {
   filterID: number;
   layerID: number;

   label?: string;
   type?: string;
   value?: number | string;

   operator?: '<' | '=' | '>';

   color?: string;

   filteredFeatures?: Feature[];
}

interface ContextData {
   filters: Array<IFilter>;

   incrementalID: number;

   handleAddFilter: (layer: VectorLayer, filterID: number) => void;
   handleChangeFilterLabel: (layer: VectorLayer, filter: IFilter, value: string) => void;
   handleChangeFilterOperator: (
      layer: VectorLayer,
      filter: IFilter,
      value: '<' | '=' | '>'
   ) => void;
   handleChangeFilterValue: (layer: VectorLayer, filter: IFilter, value: string) => void;
   handleChangeFilterColor: (layer: VectorLayer, filter: IFilter, value: string) => void;
   handleDeleteFilter: (filterID: number) => void;
}

const FiltersContext = createContext<ContextData>({} as ContextData);

export const FiltersProvider: React.FC = ({ children }) => {
   const { layers } = useContext(LayersContext);
   // Array que armazena os filtros adicionados.
   const [filters, setFilters] = useState<IFilter[]>([]);
   // Estado incremental para gerar a ID de cada filtro.
   const [incrementalID, setIncrementalID] = useState(0);

   const handleAddFilter = useCallback((layer: VectorLayer, filterID: number) => {
      setFilters((prevArray) => [
         ...prevArray,
         { layerID: layer.get('id'), filterID, operator: '=', color: layer.get('color') },
      ]);
      setIncrementalID((prevValue) => prevValue + 1);
   }, []);

   // Função de utilidade para pegar o formato atual da camada (caso aplicável).
   const getShape = useCallback((layer: VectorLayer) => {
      const shapes = [
         { name: 'square', points: 4, radius: layer.get('size'), angle: Math.PI / 4 },
         {
            name: 'triangle',
            points: 3,
            radius: layer.get('size'),
            rotation: Math.PI / 4,
            angle: 0,
         },
         {
            name: 'star',
            points: 5,
            radius: layer.get('size'),
            radius2: layer.get('size') / 3,
            angle: 0,
         },
         { name: 'circle', points: 100, radius: layer.get('size') },
      ];

      const [correctShape] = shapes.filter((format) => format.name === layer.get('shape'));
      return correctShape;
   }, []);

   const handleFilter = useCallback(
      (layer: VectorLayer, filter: IFilter) => {
         const source = layer.getSource();
         const features = source.getFeatures();

         const { points, angle, rotation, radius, radius2 } = getShape(layer);

         switch (filter.operator) {
            case '<':
               filter.filteredFeatures = features.filter(
                  (feature) => feature.get('info')[filter.label!] < filter.value!
               );

               break;

            case '=':
               filter.filteredFeatures = features.filter((feature) =>
                  filter.type === 'string'
                     ? feature.get('info')[filter.label!] === String(filter.value!)
                     : filter.value
               );

               break;

            case '>':
               filter.filteredFeatures = features.filter(
                  (feature) => feature.get('info')[filter.label!] > filter.value!
               );

               break;

            default:
               break;
         }

         features.forEach((feature) => {
            feature.set('filterID', -1);

            filters.forEach((filter) => {
               if (filter.filteredFeatures?.includes(feature)) {
                  feature.set('filterID', filter.filterID);
               }
            });

            const oldStyle = feature.getStyle();

            feature
               .getStyle()!
               //@ts-ignore
               .getFill()
               .setColor(
                  feature.get('filterID') !== -1
                     ? filters.find(({ filterID }) => filterID === feature.get('filterID'))?.color
                     : layer.get('color')
               );
            //@ts-ignore
            feature.getStyle().setImage(
               new RegularShape({
                  fill: new Fill({
                     color:
                        feature.get('filterID') !== -1
                           ? filters.find(({ filterID }) => filterID === feature.get('filterID'))
                                ?.color
                           : layer.get('color'),
                  }),
                  //@ts-ignore
                  stroke: oldStyle.getStroke(),
                  points,
                  angle,
                  rotation,
                  radius,
                  radius2,
               })
            );
         });

         source.changed();
      },
      [getShape, filters]
   );

   const handleChangeFilterLabel = useCallback(
      (layer: VectorLayer, filter: IFilter, value: string) => {
         const newFilters = [...filters];

         newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].label = value;
         newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].type =
            typeof layers
               .filter((layer) => layer.get('id') === filter.layerID)[0]
               .getSource()
               .getFeatures()[0]
               .get('info')[value];

         setFilters([...newFilters]);

         handleFilter(layer, filter);
      },
      [layers, filters, handleFilter]
   );

   const handleChangeFilterOperator = useCallback(
      (layer: VectorLayer, filter: IFilter, value: '<' | '=' | '>') => {
         const newFilters = [...filters];

         newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].operator =
            value;

         setFilters([...newFilters]);

         handleFilter(layer, filter);
      },
      [filters, handleFilter]
   );

   const handleChangeFilterValue = useCallback(
      (layer: VectorLayer, filter: IFilter, value: string) => {
         const newFilters = [...filters];

         isNaN(Number(value))
            ? (newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].value =
                 value)
            : (newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].value =
                 Number(value));

         setFilters([...newFilters]);

         handleFilter(layer, filter);
      },
      [filters, handleFilter]
   );

   const handleChangeFilterColor = useCallback(
      (layer: VectorLayer, filter: IFilter, value: string) => {
         const newFilters = [...filters];

         newFilters.filter((newFilter) => newFilter.filterID === filter.filterID)[0].color = value;

         setFilters([...newFilters]);

         handleFilter(layer, filter);
      },
      [filters, handleFilter]
   );

   const handleDeleteFilter = useCallback(
      (filterID: number) => {
         console.log(filters);
         console.log(filterID);
         console.log(filters.filter((filter) => filter.filterID !== filterID));

         setFilters(filters.filter((filter) => filter.filterID !== filterID));
      },
      [filters]
   );

   return (
      <FiltersContext.Provider
         value={{
            filters,
            incrementalID,
            handleAddFilter,
            handleChangeFilterLabel,
            handleChangeFilterOperator,
            handleChangeFilterValue,
            handleChangeFilterColor,
            handleDeleteFilter,
         }}
      >
         {children}
      </FiltersContext.Provider>
   );
};

export default FiltersContext;
