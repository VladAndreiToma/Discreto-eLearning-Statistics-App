import { InlineMath } from "react-katex";
import NavBar from "../../../navigation_templates/NavBar";
import BoltzmannCodexWebEngine from "./BoltzmannCodexWebEngine";

export default function BoltzmannCodex(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Boltzmann Codex - The Core Of Randomness</h1>
                <BoltzmannCodexWebEngine/>
                <section>
                    <h3>Entropy</h3>
                    <p>
                        Entropy is a measure of the degree of disorder in a system. 
                        It is directly linked to the energy of the system observed as a whole from a macrostate, 
                        composed of a mixture of microstates.
                    </p>
                    <p>
                        Boltzmann Entropy is a process of averaging all quantities into an observable, measurable quantity.
                        Entropy <div className="formula"><InlineMath math="S = k_B \sum_i p_i \ln(p_i)"/></div> quantifies how "spread out" or disordered the system is.
                    </p>
                    <p>
                        A system with <InlineMath math="S = 0"/> would correspond to no motion and total order, 
                        but this is impossible in practice because every system has a baseline energy level and 
                        true absolute order cannot exist in the universe.
                    </p>
                </section>
            </div>
        </div>
    )
}
