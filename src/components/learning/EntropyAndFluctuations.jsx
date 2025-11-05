import NavBar from "../../navigation_templates/NavBar";
import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import RubikCube from "../helpers/RubikCube";


export default function EntropyAndFluctuations(){
    return(<div className="page-container">
        <NavBar/>
        <div className="theory-scroller">
            <h1 className="chapter-title">Chapter 9 - Entropy and Fluctuations</h1>
            <div className='mascot'>
                <RubikCube/>
            </div>
            <section>
                    In thermodynamics, entropy is a measure of disorder or uncertainty in a system’s microscopic configuration.
                    In statistical mechanics, entropy connects macroscopic thermodynamic quantities to the number of possible microstates.
                    The Boltzmann definition of entropy is given by:
                    <div className='formula'><BlockMath math="S = k_B \ln \Omega" /></div>
                    where <InlineMath math="S" /> is the entropy, <InlineMath math="k_B" /> is the Boltzmann constant, and <InlineMath math="\Omega" /> is the total number of microstates corresponding to a particular macrostate.
            </section>
            <section>
                <h3>Entropy as a Measure of Probability</h3>
                <p>
                    The probability of a macrostate with <InlineMath math="\Omega" /> microstates is proportional to <InlineMath math="\Omega" />.
                    If we express the probability <InlineMath math="P" /> of a given state, we can write:
                    <div className='formula'><BlockMath math="P \propto e^{S / k_B}" /></div>
                    Hence, states with higher entropy are exponentially more probable.
                    For an isolated system, the equilibrium state is the one that maximizes entropy.
                </p>
            </section>
            <section>
                <h3>Fluctuations around Equilibrium</h3>
                <p>
                    Even in equilibrium, a system exhibits small fluctuations in quantities like energy or particle number.
                    However, these fluctuations are typically negligible for macroscopic systems.
                    Let the probability of a small deviation <InlineMath math="\Delta X" /> from equilibrium be:
                    <div className='formula'><BlockMath math="P(\Delta X) \propto e^{-\frac{1}{2} \frac{\partial^2 S}{\partial X^2} \frac{(\Delta X)^2}{k_B}}" /></div>
                    This Gaussian dependence shows that fluctuations are inversely related to system size—larger systems have smaller relative fluctuations.
                </p>
            </section>
            <section>
                <h3>Energy Fluctuations in Canonical Ensemble</h3>
                <p>
                    In the canonical ensemble, where a system exchanges energy with a heat reservoir at temperature <InlineMath math="T" />, the probability of a state with energy <InlineMath math="E_i" /> is:
                    <div className='formula'><BlockMath math="P(E_i) = \frac{e^{-E_i / k_B T}}{Z}" /></div>
                    where <InlineMath math="Z" /> is the partition function defined by:
                    <div className='formula'><BlockMath math="Z = \sum_i e^{-E_i / k_B T}" /></div>
                    The mean energy is:
                    <div className='formula'><BlockMath math="\langle E \rangle = \sum_i E_i P(E_i)" /></div>
                    and the energy fluctuation (variance) is:
                    <div className='formula'><BlockMath math="\langle (\Delta E)^2 \rangle = k_B T^2 C_V" /></div>
                    where <InlineMath math="C_V" /> is the heat capacity at constant volume.
                    This relation demonstrates that systems with higher heat capacity exhibit larger energy fluctuations.
                </p>
            </section>
            <section>
                <h3>Links to Stability</h3>
                <p>
                    The curvature of the entropy function determines system stability.
                    For a stable equilibrium:
                    <div className='formula'><BlockMath math="\frac{\partial^2 S}{\partial E^2} < 0" /></div>
                    which ensures that entropy is at a maximum and small perturbations decay rather than grow.
                </p>
            </section>
            <section>
                <h3>Summary</h3>
                <ul> <li>Entropy quantifies the disorder or uncertainty of a system’s microscopic configuration.</li> <li>Fluctuations in macroscopic quantities arise due to random microscopic variations.</li> <li>The probability of a fluctuation decreases exponentially with the change in entropy.</li> <li>Large systems exhibit negligible fluctuations, while small systems can show significant deviations.</li> <li>Entropy links thermodynamics and statistical mechanics, providing a bridge between macroscopic and microscopic descriptions.</li> </ul>
            </section>
        </div>
    </div>)
}