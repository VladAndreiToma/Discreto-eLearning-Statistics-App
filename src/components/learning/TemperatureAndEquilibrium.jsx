import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";

export default function TemperatureAndEquilibrium(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 6 - Temperature and Equilibrium</h1>
                <div className='mascot'>
                          <RubikCube/>
                        </div>
                <section>
                    <p>In statistical mechanics, temperature and equilibrium are central concepts that link microscopic particle behavior to macroscopic observables.</p>
                    <ul>
                        <li>Temperature measures how energy is distributed among particles.</li>
                        <li>Equilibrium describes a state where macroscopic quantities (energy, pressure, particle number) remain constant over time, even though microscopic particles are constantly moving and exchanging energy.</li>
                    </ul>
                </section>   
                <section>
                    <h3>Temperature and Microstates</h3>
                    <p>
                        Consider a system with Ω(E) microstates at energy <InlineMath math="E" />. The entropy is defined by Boltzmann’s formula:
                        <div className="formula">
                            <BlockMath math="S(E) = k_B \ln \Omega(E)"/>
                        </div>
                        The temperature is defined as:
                        <div className="formula">   
                            <BlockMath math="\frac{1}{T} = \frac{\partial S}{\partial E}" />    
                        </div>
                        This shows that temperature is related to how rapidly the number of accessible microstates grows with energy.
                    </p>
                </section>
                <section>
                    <h3>Thermal Equilibrium</h3>
                    <p>
                        Two systems in thermal contact (able to exchange energy) reach equilibrium when their temperatures are equal:
                        <div className="formula">
                            <BlockMath math="T_A = T_B" />
                        </div>
                        At equilibrium, the total entropy is maximized:
                        <div className="formula">
                            <BlockMath math="S_\text{total} = S_A + S_B \quad \Rightarrow \quad \delta S_\text{total} = 0" />
                        </div>
                        This condition defines the most probable distribution of energy between the systems.
                    </p>
                </section>
                <section>
                    <h3>Canonical Ensemble Perspective</h3>
                    <p>
                        In a canonical ensemble, a system in contact with a heat bath at temperature <InlineMath math="T" /> has probabilities for microstates:
                        <div className="formula">
                            <BlockMath math="P(E_i) = \frac{e^{-E_i / k_B T}}{Z}" />  
                        </div>
                        Where the partition function is:
                        <div className="formula">
                            <BlockMath math="Z = \sum_i e^{-E_i / k_B T}" />
                        </div>
                        The average energy of the system is:
                        <div className="formula">
                            <BlockMath math="\langle E \rangle = \sum_i E_i P(E_i)" />
                        </div>
                        And energy fluctuations are related to heat capacity:
                        <div className="formula">
                            <BlockMath math="\sigma_E^2 = \langle E^2 \rangle - \langle E \rangle^2 = k_B T^2 C_V" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Equilibrium and Distribution Functions</h3>
                    <p>At equilibrium, distribution functions describe how particles occupy energy states:</p>
                    <ul>
                        <li>Maxwell-Boltzmann (classical): <InlineMath math="f(E_i) \propto e^{-E_i / k_B T}" /></li>
                        <li>Fermi-Dirac (fermions): <InlineMath math="f_{FD}(E_i) = \frac{1}{e^{(E_i - \mu)/k_B T} + 1}" /></li>
                        <li>Bose-Einstein (bosons): <InlineMath math="f_{BE}(E_i) = \frac{1}{e^{(E_i - \mu)/k_B T} - 1}" /></li>
                    </ul>
                    <p>The distributions ensure macroscopic observables are stable while individual particles continue to fluctuate microscopically.</p>
                </section>
                <section>
                    <h3>Key Points</h3>
                    <ul>
                        <li>Temperature reflects the spread of energy among microstates.</li>
                        <li>Thermal equilibrium occurs when temperatures equalize and total entropy is maximized.</li>
                        <li>Canonical ensembles allow us to calculate average energies and fluctuations.</li>
                        <li>Equilibrium distributions depend on particle type (classical, fermion, boson) and constraints.</li>
                        <li>Understanding equilibrium is crucial for linking microscopic motion to macroscopic thermodynamic behavior.</li>
                    </ul>
                    <p></p>
                </section>
            </div>
        </div>
    )
}