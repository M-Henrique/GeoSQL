import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Landing from './pages/LandingPages/Landing';
import About from './pages/LandingPages/About';
import Contact from './pages/LandingPages/Contact';

import Query from './pages/MainPages/Query';
import Results from './pages/MainPages/Results';
import WorldMap from './pages/MainPages/WorldMap';
import Help from './pages/MainPages/Help';

function Routes() {
   return (
      <BrowserRouter basename={process.env.BASE_URL}>
         <Route path="/" exact component={Landing}></Route>
         <Route path="/about" exact component={About}></Route>
         <Route path="/contact" exact component={Contact}></Route>
         <Route path="/query" exact component={Query}></Route>
         <Route path="/results" exact component={Results}></Route>
         <Route path="/map" exact component={WorldMap}></Route>
         <Route path="/help" exact component={Help}></Route>
      </BrowserRouter>
   );
}

export default Routes;
