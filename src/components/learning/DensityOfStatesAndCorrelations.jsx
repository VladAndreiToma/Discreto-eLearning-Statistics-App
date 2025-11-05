import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";


export default function DensityOfStatesAndCorrelations(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 10 - Density of States and Correlations</h1>
                <div className='mascot'>
                    <RubikCube/>
                </div>
                <section>
                    In statistical mechanics, the density of states (DOS) describes how many microscopic energy levels are available to a system within a given energy interval.
                    If <InlineMath math="g(E)" /> represents the density of states, then the number of available states between energies <InlineMath math="E" /> and <InlineMath math="E + dE" /> is:
                    <div class="formula"> <BlockMath math="d\Omega = g(E)\, dE" /> </div>
                    Thus, <InlineMath math="g(E)" /> determines how many configurations contribute to a specific energy range.
                </section>
                <section>
                    <h3>What is the Density of States?</h3>
                    For a continuous energy spectrum, the density of states is defined as:
                    <div class="formula"> <BlockMath math="g(E) = \frac{d\Omega(E)}{dE}" /> </div>
                    where <InlineMath math="\Omega(E)" /> is the total number of microstates with energy less than or equal to <InlineMath math="E" />.
                    For discrete systems, <InlineMath math="g(E)" /> can be approximated by counting the number of levels per small energy interval.
                </section>
                <section>
                    <h3>Example of Ideal Gas</h3>
                    In a 3D ideal gas, the number of available momentum states grows with the volume of a sphere in momentum space. The corresponding density of states is proportional to <InlineMath math="E^{1/2}" />:
                    <div class="formula"> <BlockMath math="g(E) \propto E^{1/2}" /> </div>
                    Hence, at higher energies, more quantum states are available for the particles to occupy.
                </section>
                <section>
                    <h3>Normalization and Probability Distribution</h3>
                    <p>
                        If <InlineMath math="f(E)" /> represents the occupation probability for a given energy (for example, Maxwell–Boltzmann, Fermi–Dirac, or Bose–Einstein distributions), then the total number of particles is obtained by:
                        <div class="formula"> <BlockMath math="N = \int_0^\infty f(E)\, g(E)\, dE" /> </div>
                        and the total energy of the system is:
                        <div class="formula"> <BlockMath math="U = \int_0^\infty E\, f(E)\, g(E)\, dE" /> </div>
                        This shows how microscopic distributions combine with the density of states to produce macroscopic observables.
                    </p>
                </section>
                <section>
                    <h3>Correlations Between Particles</h3>
                    <p>
                        In real systems, particles often interact — leading to correlations. The simplest case assumes independent particles, where the joint probability factorizes:
                        <div class="formula"> <BlockMath math="P(E_1, E_2) = P(E_1) \, P(E_2)" /> </div>
                        However, when interactions are present, correlations appear and modify this factorization:
                        <div class="formula"> <BlockMath math="P(E_1, E_2) = P(E_1) \, P(E_2)\,[1 + C(E_1, E_2)]" /> </div>
                        Here <InlineMath math="C(E_1, E_2)" /> is the correlation function, describing the degree of dependence between particles with energies <InlineMath math="E_1" /> and <InlineMath math="E_2" />.
                    </p>
                </section>
                <section>
                    <h3>Two-Point Correlation Function</h3>
                    <p>
                        A more general quantity, used in many-body physics, is the two-point correlation function:
                        <div class="formula"> <BlockMath math="G(r_1, r_2) = \langle n(r_1)\, n(r_2) \rangle - \langle n(r_1) \rangle \langle n(r_2) \rangle" /> </div>
                        This measures how the particle density at position <InlineMath math="r_1" /> is related to that at <InlineMath math="r_2" />.
                        For independent particles, <InlineMath math="G(r_1, r_2) = 0" />.
                        For correlated systems (like liquids, plasmas, or solids), <InlineMath math="G(r_1, r_2) \neq 0" />, revealing spatial structure.
                    </p>
                </section>
                <section>
                    <h3>Importance in Thermmodynamics and Quantum Physics</h3>
                    <ul>
                        <li>In thermodynamics, the density of states links microscopic structure with macroscopic properties like entropy and heat capacity.</li>
                        <li>In quantum physics, it determines how particles fill available energy levels — essential for understanding conductivity, blackbody radiation, and semiconductor behavior.</li>
                        <li>Correlations become critical in explaining phenomena such as phase transitions, collective excitations, and quantum entanglement.</li>
                    </ul>
                </section>
                <section>
                    <h3>Summary</h3>
                    <ul> <li>The density of states <InlineMath math="g(E)" /> measures how many microstates exist per unit energy.</li> <li>Macroscopic quantities like total energy and particle number depend on both <InlineMath math="g(E)" /> and the occupation probability <InlineMath math="f(E)" />.</li> <li>Correlations describe interactions between particles, deviating from ideal independent behavior.</li> <li>The two-point correlation function reveals spatial and energetic dependencies within many-body systems.</li> <li>Together, DOS and correlations form the foundation for statistical, thermodynamic, and quantum descriptions of matter.</li> </ul>
                </section>
            </div>
        </div>
    )
}