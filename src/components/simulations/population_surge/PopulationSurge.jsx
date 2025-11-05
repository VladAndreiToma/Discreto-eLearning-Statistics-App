import NavBar from "../../../navigation_templates/NavBar";
import PopulationSurgeWebEngine from "./PopulationSurgeWebEngine";

export default function PopulationSurge(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Population Surge. Partition Function Influence</h1>
                <PopulationSurgeWebEngine/>
            </div>
        </div>
    )
}