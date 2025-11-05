import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";

export default function EnergyDistributions(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 5 - Energy Distributions</h1>
                <div className='mascot'>
                    <RubikCube/>
                </div>
                <section>
                    <p>
                        In statistical mechanics, energy distributions describe how the total energy of a system is spread among its particles. Understanding energy distributions allows us to connect microscopic states with macroscopic observables such as temperature, pressure, and entropy.
                    </p>
                </section>
                <section>
                    <h3>Microcanonical Ensemble (Fixed Energy)</h3>
                    <p>
                        In a microcanonical ensemble, the system has:
                        <ul>
                            <li>fixed energy <InlineMath math="E"/></li>
                            <li>fixed number of particles <InlineMath math="N"/></li>
                            <li>fixed volume <InlineMath math="V" /></li>
                        </ul>
                        All accessible microstates have equal probability. The probability of a particle having energy <InlineMath math="E_i" /> is proportional to the number of microstates compatible with the remaining energy:
                        <div className="formula">
                            <BlockMath math="P(E_i) \propto \Omega(E - E_i)" />
                        </div>
                    </p>
                    <p>
                        Where <InlineMath math="\Omega(E)" /> is the number of microstates at energy <InlineMath math="E" />.
                    </p>
                </section>
                <section>
                    <h3>Canonical Ensemble (Fixed Temperature)</h3>
                    <p>
                        For a canonical ensemble, the system is in contact with a heat bath at temperature <InlineMath math="T" />. The probability that a particle has energy <InlineMath math="E_i" /> is given by the Boltzmann factor:
                        <div className="formula">
                             <BlockMath math="P(E_i) = \frac{e^{-E_i / k_B T}}{Z}" />
                        </div>
                    </p>
                    <p>
                        Where the partition function is:
                        <div className="formula">
                            <BlockMath math="Z = \sum_i e^{-E_i / k_B T}" />
                        </div>
                        This ensures the probabilities sum to 1:
                        <div className="formula">
                            <BlockMath math="\sum_i P(E_i) = 1" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Continuous Energy Distribution</h3>
                    <p>
                        For systems with continuous energy spectra, the number of particles with energy between <InlineMath math="E" /> and <InlineMath math="E + dE" /> is:
                        <div className="formula">
                            <BlockMath math="f(E) \, dE = g(E) \frac{e^{-E / k_B T}}{Z} \, dE" />
                        </div>
                        Where:
                        <ul>
                            <li><InlineMath math="g(E)" /> = density of states at energy <InlineMath math="E" /></li>
                            <li><InlineMath math="Z" /> = partition function (normalization factor)</li>
                        </ul>
                    </p>
                    <p>
                        The average energy is:
                        <div className="formula">
                            <BlockMath math="\langle E \rangle = \int_0^\infty E f(E) \, dE" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Energy Fluctuations</h3>
                    <p>
                        The variance of energy in the canonical ensemble is:
                        <div className="formula">
                            <BlockMath math="\sigma_E^2 = \langle E^2 \rangle - \langle E \rangle^2 = k_B T^2 C_V" />
                        </div>
                       Where <InlineMath math="C_V" /> is the heat capacity at constant volume. 
                        This shows that energy fluctuates around the mean, and the magnitude of fluctuations depends on temperature and heat capacity.
                    </p>
                </section>
                <section>
                    <h3>Key Points</h3>
                    <ul>
                        <li>Energy distributions connect microstates with macroscopic observables.</li>
                        <li>Microcanonical ensemble: fixed energy, equal probability for all microstates.</li>
                        <li>Canonical ensemble: fixed temperature, probabilities weighted by Boltzmann factor.</li>
                        <li>Continuous distributions require density of states <InlineMath math="g(E)" /> for proper normalization.</li>
                        <li>Average energy and fluctuations can be computed from the distribution.</li>
                    </ul>
                    <p></p>
                </section>
            </div>
        </div>
    )   
}