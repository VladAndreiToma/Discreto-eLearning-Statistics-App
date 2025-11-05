import { FaArrowRight } from "react-icons/fa";
import { FaArrowCircleRight } from "react-icons/fa";
import NavBar from "../navigation_templates/NavBar";
import LiveParticleCellBG from "./helpers/LiveParticleCellBG";
import { Link } from "react-router-dom";
import RubikCube from "./helpers/RubikCube";

const courseList = [
    "Microstates vs Macrostates",
    "Boltzman Entropy",
    "Statistical Ensembles",
    "Particle Distributions",
    "Energy Distributions",
    "Temperature and Equilibrium",
    "Gases and Multiparticle Systems",
    "Population Inversion",
    "Entropy and Fluctuations",
    "Density of States and Correlations",
    "Insights and Applications",
]

const toSlug = (title) => {
    return title.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function Learning(){

    return(
        <div className="page-container">
            <NavBar/>
            <div className="page-scroller">
                {
                    courseList.map((topic, idx)=>{
                        const slug = toSlug(topic);
                        return(
                            <div key={idx} className="glass-box">
                                <label>{idx+1}. {topic}</label>
                                <Link to={`/learning/${slug}`} style={{textDecoration:'none', color:"#eee"}}>
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