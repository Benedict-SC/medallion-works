import React from 'react';
import { useNavigate } from "react-router-dom";
import {
    NavLink
} from "react-router-dom";
function MedallionNavItem({target,text}){
    const navigate = useNavigate();
    function navTo(){
        navigate("/" + target);
    }
    return (
        <div className="nav-item" onClick={navTo}>
            {text}
        </div>
    );
}
export default function MedallionNavbar(){
    return (
        <div className="navbar">
            <MedallionNavItem target="map" text="Edit Maps" />
            <MedallionNavItem target="unit" text="Edit Units" />
        </div>
    );
}