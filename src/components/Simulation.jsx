import NavBar from "../navigation_templates/NavBar";
import LiveParticleCellBG from "./helpers/LiveParticleCellBG";

import { Link } from "react-router-dom";
import { FaArrowCircleRight } from "react-icons/fa";

const simList = [
    "Inspector Particle",
    "Boltzmann Codex",
    "Ensemble Nexus",
    "Quantum Crowd",
    "ThermoSync",
    "Fluctuation Verse",
    "Density Matrix",
    "Population Surge",
];

const toSlug = (title) =>{
    return title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function Simulation(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="page-scroller">
                {
                    simList.map((name, idx)=>{
                        const slug = toSlug(name);
                        return(
                            <div key={idx} className="glass-box">
                                <label>{idx+1}. {name}</label>
                                <Link to={`/simulation/${slug}`} style={{textDecoration:'none',color:'#eee'}}>
                                    <FaArrowCircleRight style={{width:'1.6rem', height:'1.6rem'}}/> 
                                </Link>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}