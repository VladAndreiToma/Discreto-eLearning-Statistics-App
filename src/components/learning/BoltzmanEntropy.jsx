import { BlockMath,InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import NavBar from "../../navigation_templates/NavBar";
import RubikCube from "../helpers/RubikCube";

export default function BoltzmanEntropy(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 2. Boltzmann Entropy & Distribution Functions</h1>
                <div className='mascot'>
                    <RubikCube/>
                </div>
                <section>
                    <h3>Introduction</h3>
                    <p>
                        In statistical physics, the Boltzmann entropy formalism provides a quantitative link between
                        the microscopic states of a system and its macroscopic thermodynamic behavior.
                        Entropy S measures the degree of disorder or the number of possible microstates corresponding 
                        to a given macrostate. Entropy is maximal for the most probable macrostate, which corresponds to the largest number of microstates.
                    </p>
                    <div className="formula">
                        <BlockMath math="S = k_B \ln \Omega" />
                    </div>
                </section>
                <section>
                    <h3>Link to microstates and macrostates</h3>
                    <p>Microstate: exact configuration of all particles (positions, momenta, spins, etc.).</p>
                    <p> Macrostate: defined by macroscopic quantities (energy E, number of particles N, volume V, temperature T).</p>
                    <div className="formula">
                        <BlockMath math="S(E, N, V) = k_B \ln \Omega(E, N, V)" />
                    </div>
                </section>
                <section>
                    <h3>Probability of Microstates</h3>
                     <p>
                        The probability <InlineMath math="P_i"/> of a particular microstate i is:
                        <div className="formula">
                            <BlockMath math="P_i = \frac{1}{\Omega}" />
                        </div>
                        If the system can occupy multiple macrostates with different numbers of microstates <InlineMath math="Ω_j"/>, the probability of macrostate j is:
                        <div className="formula">
                            <BlockMath math="P_j = \frac{\Omega_j}{\sum_k \Omega_k}" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Boltzmann Distribution</h3>
                    <p>
                        For a system in thermal equilibrium at temperature T, the Boltzmann distribution gives the probability that a particle has energy E_i. The partition function Z ensures probabilities sum to 1
                        <div className="formula">
                            <BlockMath math="P(E_i) = \frac{e^{-E_i / k_B T}}{Z}" />
                        </div>
                        <div className="formula">
                            <BlockMath math="Z = \sum_i e^{-E_i / k_B T}" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Two-Level System Example</h3>
                    <p>
                        Consider N particles, each can occupy energy levels <InlineMath math="E_0 = 0"/> or <InlineMath math="E_1 = ε"/>.
                        Number of microstates with n particles in excited state:
                        <div className="formula">
                            <BlockMath math="\Omega(n) = \binom{N}{n} = \frac{N!}{n!(N-n)!}" />
                        </div>
                        Entropy for this macrostate:
                        <div className="formula">
                            <BlockMath math="S(n) = k_B \ln \binom{N}{n}" />
                        </div>
                        Probability of energy level <InlineMath math="E_1"/>:
                        <div className="formula">
                            <BlockMath math="P(E_1) = \frac{e^{-\epsilon / k_B T}}{1 + e^{-\epsilon / k_B T}}" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Continuous Systems & Distribution Functions</h3>
                    <p>For continuous energy levels, define a distribution function f(E) such that:
                       <div className="formula">
                            <BlockMath math="\int_0^\infty f(E) \, dE = N" /> 
                       </div>
                       Entropy for a continuous system (Gibbs formula):
                       <div className="formula">
                            <BlockMath math="S = -k_B \int f(E) \ln f(E) \, dE" />
                       </div>
                    </p>
                </section>
                <section>
                    <h3>Summary</h3>
                    <ul>
                        <li>Boltzmann entropy connects microscopic configurations (Ω) with macroscopic thermodynamics.</li>
                        <li>Systems evolve toward macrostates with the largest number of microstates → maximum entropy.</li>
                        <li>Boltzmann distribution describes particle populations at thermal equilibrium.</li>
                        <li>Partition function Z encodes all thermodynamic information: free energy, average energy, probabilities.</li>
                        <li>Distribution functions generalize the concept for continuous systems, like ideal gases.</li>
                    </ul>
                    <p></p>
                </section>
            </div>
        </div>
    )
}