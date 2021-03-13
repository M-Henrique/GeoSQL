import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import { StaticRouter } from 'react-router-dom';

import TablesContext from '../contexts/tables';
import QueryContext from '../contexts/query';

import Query from '../pages/MainPages/Query';

describe('Testing query component', () => {
   const tablesContextProps = {
      database: '',
      tables: [
         {
            name: 'aerodromo',
         },
         {
            name: 'baciahidro',
         },
         {
            name: 'eixoduto',
         },
      ],
      tablesColumns: [
         {
            table: 'aerodromo',
            name: 'altitude',
         },
         {
            table: 'aerodromo',
            name: 'num_pista',
         },
         {
            table: 'aerodromo',
            name: 'pais',
         },
         {
            table: 'aerodromo',
            name: 'pavimento',
         },
         {
            table: 'aerodromo',
            name: 'uf',
         },
         {
            table: 'baciahidro',
            name: 'areakm2',
         },
         {
            table: 'baciahidro',
            name: 'geom',
         },
         {
            table: 'eixoduto',
            name: 'cod_dest',
         },
         {
            table: 'eixoduto',
            name: 'cod_duto',
         },
      ],
      getTables: jest.fn((database: string) => {
         return new Promise<void>((resolve, reject) => {});
      }),
      loading: false,
   };

   const queryContextProps = {
      firstTime: false,
      query: '',
      setQuery: jest.fn((query) => {}),
      submitQuery: jest.fn((query: string) => {
         return new Promise<void>((resolve, reject) => {});
      }),
      results: [],
      hasGeomValue: false,
      loading: false,
   };

   beforeAll(() => {
      sessionStorage.setItem(
         '@geosql/query-history',
         ['select * from estado', 'select * from refinaria'].join('@geosqlidentifier@')
      );
   });

   afterAll(() => {
      sessionStorage.removeItem('@geosql/query-history');
   });

   beforeEach(() => {
      render(
         <TablesContext.Provider value={tablesContextProps}>
            <QueryContext.Provider value={queryContextProps}>
               <Query />
            </QueryContext.Provider>
         </TablesContext.Provider>,
         { wrapper: StaticRouter }
      );
   });

   it('should display the loading icon while loading', () => {
      cleanup();

      const tablesContextProps = {
         database: '',
         tables: [],
         tablesColumns: [],
         getTables: jest.fn((database: string) => {
            return new Promise<void>((resolve, reject) => {});
         }),
         loading: true,
      };

      render(
         <TablesContext.Provider value={tablesContextProps}>
            <QueryContext.Provider value={queryContextProps}>
               <Query />
            </QueryContext.Provider>
         </TablesContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('loadingContainer')).toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display a message when no tables are set', () => {
      cleanup();

      const tablesContextProps = {
         database: '',
         tables: [],
         tablesColumns: [],
         getTables: jest.fn((database: string) => {
            return new Promise<void>((resolve, reject) => {});
         }),
         loading: false,
      };

      render(
         <TablesContext.Provider value={tablesContextProps}>
            <QueryContext.Provider value={queryContextProps}>
               <Query />
            </QueryContext.Provider>
         </TablesContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('firstTimeContainer')).toBeInTheDocument();
      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display the correct tables (rows) when they are set', () => {
      expect(
         screen.getByRole('row', { name: /altitude num_pista pais pavimento uf/i })
      ).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /areakm2 geom/i })).toBeInTheDocument();
      expect(screen.getByRole('row', { name: /cod_dest cod_duto/i })).toBeInTheDocument();

      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).not.toBeInTheDocument();
   });

   it('should insert query history queries inside the textarea', () => {
      const queries = screen.getAllByRole('listitem');

      expect(queries).toHaveLength(2);

      queries.forEach((query) => {
         fireEvent.click(query);
         expect(queryContextProps.setQuery).toHaveBeenCalledWith(query.innerHTML);
      });
   });

   it('should be able to execute the query', () => {
      const searchButton = screen.getByRole('link', { name: /Pesquisar/i });
      const textarea = screen.getByRole('textbox') as HTMLInputElement;

      textarea.value = 'select * from estado';
      expect(textarea).toHaveValue('select * from estado');

      fireEvent.click(searchButton);
      expect(queryContextProps.submitQuery).toHaveBeenCalledTimes(1);

      expect(searchButton.getAttribute('href')).toEqual('/results');
   });

   it('should be able to save the query', () => {
      const saveButton = screen.getByRole('button', { name: /Salvar/i });
      URL.createObjectURL = jest.fn();

      fireEvent.click(saveButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
   });

   it('should be able to navigate to the help page', () => {
      expect(screen.getByRole('link', { name: /Ajuda/i }).getAttribute('href')).toEqual('/help');
   });

   it('should be able to change the selected database', async () => {
      const select = screen.getByRole('combobox');

      fireEvent.change(select, { target: { value: 'brasil' } });
      fireEvent.change(select, { target: { value: 'minasgerais' } });

      expect(tablesContextProps.getTables).toHaveBeenCalledWith('brasil');
      expect(tablesContextProps.getTables).toHaveBeenNthCalledWith(2, 'minasgerais');
      expect(tablesContextProps.getTables).not.toHaveBeenCalledWith('belohorizonte');

      expect(tablesContextProps.getTables).toHaveBeenCalledTimes(2);
   });
});
