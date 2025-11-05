import NavBar from "../../../navigation_templates/NavBar";
import ThermoSyncWebEngine from "./ThermoSyncWebEngine";

export default function ThermoSync(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Thermo Sync. Heat Flow and Equilibrium of Reservoirs</h1>
                <ThermoSyncWebEngine/>
            </div>
        </div>
    )
}