import React from 'react';
import { BrowserRouter, Route } from 'react-router-dom';

import Landing from './pages/Landing';
import About from './pages/About';
import Contact from './pages/Contact';

function Routes() {
   return (
      <BrowserRouter>
         <Route path="/" exact component={Landing}></Route>
         <Route path="/about" exact component={About}></Route>
         <Route path="/contact" exact component={Contact}></Route>
      </BrowserRouter>
   );
}

export default Routes;
