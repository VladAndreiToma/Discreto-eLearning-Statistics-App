import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";

export default function ParticleDistributions(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 4 - Particle Distributions</h1>
                <div className='mascot'>
                          <RubikCube/>
                        </div>
                <section>
                    <h3>Intro...</h3>
                    <p>In statistical mechanics, the concept of particle distributions describes how particles occupy available energy states in a system. The distribution depends on the type of particles (distinguishable, indistinguishable, fermions, bosons) and the constraints of the system (fixed energy, temperature, particle number).</p>
                    <p>Distributions allow us to compute average energy, pressure, and other macroscopic quantities from microscopic states.</p>
                </section>
                <section>
                    <h3>Maxwell-Boltzmann Distribution</h3>
                    <p>The Maxwell-Boltzmann distribution describes the energy distribution of classical, distinguishable particles in thermal equilibrium at temperature <InlineMath math="T" />.</p>
                    <p>The probability that a particle has energy <InlineMath math="E_i" /> is:
                        <div className="formula">
                            <BlockMath math="P(E_i) = \frac{e^{-E_i / k_B T}}{Z}" />
                        </div>
                        Where <InlineMath math="Z" /> is the partition function:
                        <div className="formula">
                            <BlockMath math="Z = \sum_i e^{-E_i / k_B T}" />
                        </div>
                    </p>
                    <p>
                        For a continuous distribution of energies, the number of particles with energy between <InlineMath math="E" /> and <InlineMath math="E + dE" /> is:
                        <div className="formula">
                            <BlockMath math="f(E) \, dE = \frac{2 \pi}{(\pi k_B T)^{3/2}} \sqrt{E} \, e^{-E / k_B T} \, dE" />
                        </div>
                        This is the familiar Maxwell-Boltzmann distribution of energies in a 3D ideal gas.
                    </p>
                </section>
                <section>
                    <h3>Fermi-Dirac Distribution</h3>
                    <p>
                        For fermions (particles obeying the Pauli exclusion principle), the Fermi-Dirac distribution gives the probability that a state of energy <InlineMath math="E_i" /> is occupied:
                        <div className="formula">
                            <BlockMath math="f_{FD}(E_i) = \frac{1}{e^{(E_i - \mu)/k_B T} + 1}" />
                        </div>
                        Where:
                        <InlineMath math="\mu" /> = chemical potential
                        <InlineMath math="T" /> = temperature
                    </p>
                    <p>
                        At absolute zero (<InlineMath math="T = 0" />), all states with <InlineMath math="E_i < \mu" /> are occupied and all states with <InlineMath math="E_i > \mu" /> are empty.
                    </p>
                </section>
                <section>
                    <h3>Bose-Einstein Distribution</h3>
                    <p>
                        For bosons (particles that can occupy the same state), the Bose-Einstein distribution gives the occupation probability:
                        <div className="formula">
                            <BlockMath math="f_{BE}(E_i) = \frac{1}{e^{(E_i - \mu)/k_B T} - 1}" />
                        </div>
                    </p>
                    <p>
                        Bosons can accumulate in the same state, which leads to phenomena like Bose-Einstein condensation at low temperatures.
                    </p>
                </section>
                <section>
                    <h3>Classical Limit</h3>
                    <p>
                        In the high-temperature or low-density limit, both Fermi-Dirac and Bose-Einstein distributions reduce to the Maxwell-Boltzmann distribution:
                        <div className="formula">
                            <BlockMath math="f(E_i) \approx e^{-(E_i - \mu)/k_B T}" />
                        </div>
                        This corresponds to classical behavior, where quantum statistics are negligible.
                    </p>
                </section>
                <section>
                    <h3>Average Energy</h3>
                    <p>
                        The average energy of a particle in a given distribution is computed as:
                        <div className="formula">
                            <BlockMath math="\langle E \rangle = \sum_i E_i P(E_i)" />
                        </div>
                        Or for a continuous spectrum:
                        <div className="formula">
                            <BlockMath math="\langle E \rangle = \int_0^\infty E f(E) \, dE" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Key Points</h3>
                    <ul>
                        <li>Particle distributions describe how particles occupy energy states.</li>
                        <li>Maxwell-Boltzmann: classical, distinguishable particles.</li>
                        <li>Fermi-Dirac: fermions, obey Pauli exclusion principle.</li>
                        <li>Bose-Einstein: bosons, multiple occupancy allowed.</li>
                        <li>At high temperatures / low densities, all distributions converge to Maxwell-Boltzmann.</li>
                        <li>Distributions allow computation of macroscopic observables like average energy, entropy, and pressure.</li>
                    </ul>
                </section>
            </div>
        </div>
    )
}