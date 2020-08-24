import React from 'react';
import { Link } from 'react-router-dom';

import { FiDatabase, FiList, FiMap } from 'react-icons/fi';

import Logo from '../../assets/images/logoGeosqlplus210x56.png';

import './styles.css';

interface TabsMenuProps {
   selectedTab: string;
}

const TabsMenu: React.FC<TabsMenuProps> = ({ selectedTab }) => {
   return (
      <nav id="tabsMenu" className="firstContainer container">
         <Link to="/">
            <img id="logo" src={Logo} alt="Logo GeoSQL" />
         </Link>

         <div id="tabs" className="container">
            <Link to="/query" className={selectedTab === 'query' ? 'tab selectedTab' : 'tab'}>
               <FiDatabase className="tabIcon" />
               CONSULTA
            </Link>
            <Link to="/results" className={selectedTab === 'results' ? 'tab selectedTab' : 'tab'}>
               <FiList className="tabIcon" />
               RESULTADOS
            </Link>
            <Link to="/map" className={selectedTab === 'map' ? 'tab selectedTab' : 'tab'}>
               <FiMap className="tabIcon" />
               MAPA
            </Link>
         </div>
      </nav>
   );
};

export default TabsMenu;
