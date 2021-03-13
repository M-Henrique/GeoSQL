import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';

import 'jest-canvas-mock';
import '@testing-library/jest-dom/extend-expect';

import { StaticRouter } from 'react-router-dom';

import QueryContext from '../contexts/query';

import Results from '../pages/MainPages/Results';

describe('Testing Results component', () => {
   const queryContextProps = {
      firstTime: false,
      query: '',
      setQuery: jest.fn((query) => {}),
      submitQuery: jest.fn((query: string) => {
         return new Promise<void>((resolve, reject) => {});
      }),
      results: [
         {
            gid: 1,
            uf: 'RS',
            municipio: 'Canoas',
            nome: 'Refinaria Alberto Pasqualini',
            cod_refina: 'REF001',
            sigla: 'REFAP',
            geocodigo: 4304606,
            geometria: 'ST_Point',
            geojson:
               '{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:4678"}},"coordinates":[-51.180861358,-29.925635861]}',
         },
         {
            gid: 2,
            uf: 'PR',
            municipio: 'Araucária',
            nome: 'Refinaria Presidente Getulio Vargas',
            cod_refina: 'REP001',
            sigla: 'REPAR',
            geocodigo: 4101804,
            geometria: 'ST_Point',
            geojson:
               '{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:4678"}},"coordinates":[-49.392211102,-25.573437459]}',
         },
         {
            gid: 3,
            uf: 'SP',
            municipio: 'Cubatão',
            nome: 'Refinaria Presidente Bernardes',
            cod_refina: 'RPB001',
            sigla: 'RPBC',
            geocodigo: 3513504,
            geometria: 'ST_Point',
            geojson:
               '{"type":"Point","crs":{"type":"name","properties":{"name":"EPSG:4678"}},"coordinates":[-46.362120058,-23.819001458]}',
         },
      ],
      hasGeomValue: false,
      loading: false,
   };

   beforeEach(() => {
      URL.createObjectURL = jest.fn();

      render(
         <QueryContext.Provider value={queryContextProps}>
            <Results />
         </QueryContext.Provider>,
         { wrapper: StaticRouter }
      );
   });

   it('should display the loading icon while loading', () => {
      cleanup();

      const queryContextProps = {
         firstTime: false,
         query: '',
         setQuery: jest.fn((query) => {}),
         submitQuery: jest.fn((query: string) => {
            return new Promise<void>((resolve, reject) => {});
         }),
         results: [],
         hasGeomValue: false,
         loading: true,
      };

      render(
         <QueryContext.Provider value={queryContextProps}>
            <Results />
         </QueryContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('loadingContainer')).toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).not.toBeInTheDocument();
      expect(document.getElementById('errorContainer')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display a message when seeing for the first time', () => {
      cleanup();

      const queryContextProps = {
         firstTime: true,
         query: '',
         setQuery: jest.fn((query) => {}),
         submitQuery: jest.fn((query: string) => {
            return new Promise<void>((resolve, reject) => {});
         }),
         results: [],
         hasGeomValue: false,
         loading: false,
      };

      render(
         <QueryContext.Provider value={queryContextProps}>
            <Results />
         </QueryContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).toBeInTheDocument();
      expect(document.getElementById('errorContainer')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display a message when there are no results', () => {
      cleanup();

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

      render(
         <QueryContext.Provider value={queryContextProps}>
            <Results />
         </QueryContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).toBeInTheDocument();
      expect(document.getElementById('errorContainer')).not.toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display the error when the query resulted in an error', () => {
      cleanup();

      const queryContextProps = {
         firstTime: false,
         query: '',
         setQuery: jest.fn((query) => {}),
         submitQuery: jest.fn((query: string) => {
            return new Promise<void>((resolve, reject) => {});
         }),
         results: 'ERRO' as any,
         hasGeomValue: false,
         loading: false,
      };

      render(
         <QueryContext.Provider value={queryContextProps}>
            <Results />
         </QueryContext.Provider>,
         { wrapper: StaticRouter }
      );

      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).not.toBeInTheDocument();
      expect(document.getElementById('errorContainer')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
   });

   it('should display the correct resulting rows', () => {
      expect(
         screen.getByRole('row', {
            name: /gid uf municipio nome cod_refina sigla geocodigo geometria/i,
         })
      ).toBeInTheDocument();

      expect(
         screen.getByRole('row', {
            name: /1 RS Canoas Refinaria Alberto Pasqualini REF001 REFAP 4304606 ST_Point/i,
         })
      ).toBeInTheDocument();
      expect(
         screen.getByRole('row', {
            name: /2 PR Araucária Refinaria Presidente Getulio Vargas REP001 REPAR 4101804 ST_Point/i,
         })
      ).toBeInTheDocument();
      expect(
         screen.getByRole('row', {
            name: /3 SP Cubatão Refinaria Presidente Bernardes RPB001 RPBC 3513504 ST_Point/i,
         })
      ).toBeInTheDocument();

      expect(document.getElementById('loadingContainer')).not.toBeInTheDocument();
      expect(document.getElementById('firstTimeContainer')).not.toBeInTheDocument();
      expect(document.getElementById('errorContainer')).not.toBeInTheDocument();
   });

   it('should be able to download results in JSON format', () => {
      const jsonDownloadButton = screen.getByRole('button', { name: /JSON/i });

      fireEvent.click(jsonDownloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
   });

   it('should be able to download results in PDF format', () => {
      expect(screen.getByRole('button', { name: /PDF/i })).toBeInTheDocument();
   });

   it('should be able to download results in TXT format', () => {
      const txtDownloadButton = screen.getByRole('button', { name: /TXT/i });

      fireEvent.click(txtDownloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
   });

   it('should be able to download results in CSV format', () => {
      const csvDownloadButton = screen.getByRole('button', { name: /CSV/i });

      fireEvent.click(csvDownloadButton);

      expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
   });
});
