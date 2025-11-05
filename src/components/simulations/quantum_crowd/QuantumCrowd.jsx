import NavBar from "../../../navigation_templates/NavBar";
import QuantumCrowdWebEngine from "./QuantumCrowdWebEngine";

export default function QuantumCrowd(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Quantum Crowd. Particle Grouping Behavior</h1>
                <QuantumCrowdWebEngine/>
                <h3>Key Fundamental Points</h3>
                <section>
                    The Maxwell Boltzmann distribution puts no restriction of particles and you can see their grouping and the existence in the simulations
                </section>
                <section>
                    The Bose Einstein theory alllow for indistinguishable particles to ocupy the same state which is enphasized as collapsing for heuristic visual interpretations at low temperatures, when the particles tend to have the same energy and the degeneracy increases
                </section>
                <section>
                    While in the Fermi Dirac statistics it is show that fermions cannot occupy the same state even when we want to induce degeneracy by cooling down the system. Fermions always repel each other
                </section>
            </div>
        </div>
    );
}