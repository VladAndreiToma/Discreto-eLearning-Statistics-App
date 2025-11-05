import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";


export default function GasesAndMultiparticleSystems(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 7 - Gases and Multiparticle Systems</h1>
                <div className='mascot'>
                    <RubikCube/>
                </div>
                <section>
                    <p>In statistical mechanics, gases provide an ideal framework to understand many-particle systems.
                        Each gas molecule behaves individually, yet the collective behavior follows well-defined macroscopic laws — pressure, temperature, and energy — that emerge from statistical averages.
                        The microscopic description of a gas allows us to derive thermodynamic quantities from the distribution of microstates.</p>
                </section>
                <section>
                    <h3>The Microstate of a Gas</h3>
                    <p>
                        A microstate of a gas is defined by the complete set of positions and momenta of all particles:
                        <div className="formula">
                            <BlockMath math="\{ \vec{r}_1, \vec{r}_2, \dots, \vec{r}_N ; \vec{p}_1, \vec{p}_2, \dots, \vec{p}_N \}" />
                        </div>
                        A macrostate corresponds to observable quantities such as:
                    </p>
                    <ul>
                        <li>Total number of particles <InlineMath math="N" /></li>
                        <li>Total energy <InlineMath math="E" /></li>
                        <li>Volume <InlineMath math="V" /></li>
                        <li>Pressure <InlineMath math="P" /></li>
                        <li>Temperature <InlineMath math="T" /></li>
                    </ul>
                    <p>
                        The total number of microstates compatible with a macrostate is denoted <InlineMath math="\Omega(E, V, N)" />, and the entropy is:
                        <div className="formula"><BlockMath math="S = k_B \ln \Omega(E, V, N)" /></div>
                    </p>
                </section>
                <section>
                    <h3>Ideal Gas Model</h3>
                    <p>
                        For an ideal gas, the particles are non-interacting and distinguishable only by their state.
                        The total energy is purely kinetic:
                        <div className="formula">
                            <BlockMath math="E = \sum_{i=1}^N \frac{p_i^2}{2m}" />
                        </div>
                        The probability of finding a particle with momentum between <InlineMath math="\vec{p}" /> and <InlineMath math="\vec{p} + d\vec{p}" /> is given by the Maxwell–Boltzmann distribution:
                        <div className="formula">
                            <BlockMath math="f(\vec{p}) = A e^{-\frac{p^2}{2 m k_B T}}" />
                        </div>
                        where <InlineMath math="A" /> is a normalization constant.
                        In terms of velocity magnitude <InlineMath math="v" />, the speed distribution becomes:
                        <div className="formula">
                            <BlockMath math="f(v) = 4\pi \left( \frac{m}{2\pi k_B T} \right)^{3/2} v^2 e^{-\frac{m v^2}{2 k_B T}}" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Mean Quantities</h3>
                    <p>
                        The average kinetic energy per particle is:
                        <div className="formula">
                            <BlockMath math="\langle E_k \rangle = \frac{3}{2} k_B T" />
                        </div>
                        For <InlineMath math="N" /> particles:
                        <div className="formula">
                            <BlockMath math="E_\text{total} = \frac{3}{2} N k_B T" />
                        </div>
                        Using the ideal gas law:
                        <div className="formula">
                            <BlockMath math="P V = N k_B T" />
                        </div>
                        we connect microscopic energy to macroscopic pressure.
                    </p>
                </section>
                <section>
                    <h3>Phase Space and Density of States</h3>
                    <p>
                        The phase space of an N-particle system has 6N dimensions — three for position and three for momentum of each particle.
                        The volume of phase space corresponding to all states with energy less than <InlineMath math="E" /> is:
                        <div className="formula">
                            <BlockMath math="\Gamma(E) = \frac{1}{h^{3N} N!} \int_{H(\vec{r},\vec{p}) \leq E} d^{3N}r \, d^{3N}p" />
                        </div>
                        The density of states is then:
                        <div className="formula">
                            <BlockMath math="\Omega(E) = \frac{\partial \Gamma(E)}{\partial E}" />
                        </div>
                    </p>
                    This provides the link between microscopic dynamics and thermodynamic properties.
                </section>
                <section>
                    <h3>Identical Particles and Quantum Statistics</h3>
                    <p>
                        For indistinguishable particles, classical counting overestimates microstates.
                        We correct this by dividing by <InlineMath math="N!" /> (Gibbs correction):
                        <div className="formula">
                            <BlockMath  math="\Omega(E, V, N) = \frac{1}{N! h^{3N}} \int_{H(\vec{r}, \vec{p}) = E} d^{3N}r \, d^{3N}p" />
                        </div>
                        When quantum effects become important:
                        <ul>
                            <li>Fermions follow the Fermi–Dirac distribution</li>
                            <li>Bosons follow the Bose–Einstein distribution</li>
                        </ul>
                    </p>
                    <p>
                        These lead to exotic phenomena such as degenerate electron gases or Bose–Einstein condensation.
                    </p>
                </section>
                <section>
                    <h3>Key Takeways</h3>
                    <ul>
                        <li>Gases are perfect systems for linking microscopic particle behavior to macroscopic observables.</li>
                        <li>The ideal gas law emerges from statistical averages.</li>
                        <li>The phase-space formulation provides a powerful framework for counting microstates.</li>
                        <li>Quantum corrections are essential for identical particles and extreme conditions.</li>
                        <li>The structure of Ω(E, V, N) encodes all thermodynamic information.</li>
                    </ul>
                    <p></p>
                </section>
            </div>
        </div>
    )
}