import React from 'react';
import { render, screen } from '@testing-library/react';

import '@testing-library/jest-dom/extend-expect';

import { StaticRouter } from 'react-router-dom';

import Landing from '../pages/LandingPages/Landing';

describe('Testing landing component', () => {
   beforeEach(() => {
      render(<Landing />, { wrapper: StaticRouter });
   });

   it('should be able to navigate to query page', () => {
      expect(screen.getByRole('link', { name: /Iniciar/i }).getAttribute('href')).toEqual('/query');
   });

   it('should be able to navigate to DCC page', () => {
      expect(screen.getByRole('link', { name: /Logo DCC/i }).getAttribute('href')).toEqual(
         'https://www.dcc.ufmg.br/dcc/'
      );
   });

   it('should be able to navigate to CSX page', () => {
      expect(screen.getByRole('link', { name: /Logo CSX/i }).getAttribute('href')).toEqual(
         'https://www.dcc.ufmg.br/dcc/?q=pt-br/LabCS%2BX'
      );
   });

   it('should be able to navigate to UFMG page', () => {
      expect(screen.getByRole('link', { name: /Logo UFMG/i }).getAttribute('href')).toEqual(
         'https://ufmg.br/'
      );
   });
});
