import NavBar from "../../../navigation_templates/NavBar";
import InspectorParticleWebEngine from "./InspectorParticleWebEngine";

export default function InspectorParticle(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Inspector Particle<br/>(Microstates vs Macrostates)</h1>
                <InspectorParticleWebEngine/>
                <h3>Key Fundamental Points</h3>
                <section>Every system can be treated from a closeup perspective where every component behaves in its own proper way thus we say it has its own <b>microstate</b></section>
                <section>But when you look at the ensemble as a whole a new general trend of behavior arises, that is an avarage of the constituents called a <b>macrostate</b></section>
            </div>
        </div>
    )
}