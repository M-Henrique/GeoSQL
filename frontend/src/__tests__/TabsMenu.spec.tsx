import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import '@testing-library/jest-dom/extend-expect';

import { StaticRouter } from 'react-router-dom';

import TabsMenu from '../components/TabsMenu';

describe('Testing tabs menu component', () => {
   beforeEach(() => {
      render(<TabsMenu selectedTab="query" />, { wrapper: StaticRouter });
   });

   it('should be able to navigate to query page', () => {
      expect(screen.getByRole('link', { name: /CONSULTA/i }).getAttribute('href')).toEqual(
         '/query'
      );
   });

   it('should be able to navigate to results page', () => {
      expect(screen.getByRole('link', { name: /RESULTADOS/i }).getAttribute('href')).toEqual(
         '/results'
      );
   });

   it('should be able to navigate to map page', () => {
      expect(screen.getByRole('link', { name: /MAPA/i }).getAttribute('href')).toEqual('/map');
   });

   it('should style selected tab differently', () => {
      expect(screen.getByRole('link', { name: /CONSULTA/i })).toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /RESULTADOS/i })).not.toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /MAPA/i })).not.toHaveClass('selectedTab');

      cleanup();
      render(<TabsMenu selectedTab="results" />, { wrapper: StaticRouter });

      expect(screen.getByRole('link', { name: /CONSULTA/i })).not.toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /RESULTADOS/i })).toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /MAPA/i })).not.toHaveClass('selectedTab');

      cleanup();
      render(<TabsMenu selectedTab="map" />, { wrapper: StaticRouter });

      expect(screen.getByRole('link', { name: /CONSULTA/i })).not.toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /RESULTADOS/i })).not.toHaveClass('selectedTab');
      expect(screen.getByRole('link', { name: /MAPA/i })).toHaveClass('selectedTab');
   });
});
