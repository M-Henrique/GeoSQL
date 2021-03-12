import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import { StaticRouter } from 'react-router-dom';

import LandingHeader from '../components/LandingHeader';

describe('Testing landing header component', () => {
   beforeEach(() => {
      render(<LandingHeader />, { wrapper: StaticRouter });
   });

   it('should be able to navigate to home page', () => {
      expect(screen.getByRole('link', { name: /GeoSQL+/i }).getAttribute('href')).toEqual('/');
   });

   it('should be able to navigate to about page', () => {
      expect(screen.getByRole('link', { name: /Sobre/i }).getAttribute('href')).toEqual('/about');
   });

   it('should be able to navigate to contact page', () => {
      expect(screen.getByRole('link', { name: /Contato/i }).getAttribute('href')).toEqual(
         '/contact'
      );
   });

   it('should be able to navigate to GitHub repository', () => {
      expect(screen.getByRole('link', { name: /Ícone Github/i }).getAttribute('href')).toEqual(
         'https://github.com/M-Henrique/GeoSQL'
      );
   });
});
