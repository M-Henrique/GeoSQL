import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';

import Query from './pages/Query';
import Results from './pages/Results';
import WorldMap from './pages/WorldMap';

function Routes() {
   return (
      <BrowserRouter>
         <Route path="/" exact component={Landing}></Route>
         <Route path="/about" exact component={About}></Route>
         <Route path="/contact" exact component={Contact}></Route>
         <Route path="/query" exact component={Query}></Route>
         <Route path="/results" exact component={Results}></Route>
         <Route path="/map" exact component={WorldMap}></Route>
      </BrowserRouter>
   );
}

export default Routes;
