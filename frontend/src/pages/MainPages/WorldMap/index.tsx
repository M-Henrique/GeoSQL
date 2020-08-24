import React from 'react';

import TabsMenu from '../../../components/TabsMenu';

import './styles.css';

export default function WorldMap() {
   return (
      <div id="mapContainer" className="firstContainer container">
         <header>
            <TabsMenu selectedTab="map" />
         </header>
      </div>
   );
}
