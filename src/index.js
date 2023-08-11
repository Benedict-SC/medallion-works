import React from 'react';
import {
    Route,
    Routes,
    HashRouter
} from "react-router-dom";
//import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import "./styles.css";
import MedallionNavbar from './components/navbar';
import HomePage from './components/home';
import UnitsPage from './components/units';
import MapsPage from './components/maps';
function MedallionWorksApp(){
    return (
        <HashRouter>
            <div>
                <div className="mw-title">Medallion Works content management system</div>
                <MedallionNavbar />
                <Routes id="routingZone">
                    <Route path="/" element={<HomePage />}></Route>
                    <Route path="/unit" element={<UnitsPage />}></Route>
                    <Route path="/map" element={<MapsPage />}></Route>
                </Routes>
            </div>
        </HashRouter>
    );
}
let rootNode = document.getElementById("react-root");
let root = createRoot(rootNode);
root.render(<MedallionWorksApp />);