import NavBar from "../../navigation_templates/NavBar";
import { BlockMath,InlineMath } from "react-katex";
import 'katex/dist/katex.min.css';
import RubikCube from "../helpers/RubikCube";

export default function StatisticalEnsembles(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 3 - Statistical Ensembles</h1>
                <div className='mascot'>
                          <RubikCube/>
                        </div>
                <section>
                    <h3>Introduction</h3>
                    <p>In statistical mechanics, an ensemble is a large collection of virtual copies of a system, considered all at once, each representing a possible microstate the system could be in. Ensembles allow us to compute macroscopic thermodynamic properties as averages over microstates.</p>
                </section>
                <section>
                    <h3>Microcanonical Ensemble (NVE)</h3>
                    <p>
                        The microcanonical ensemble describes an isolated system with fixed number of particles N, volume V, and energy E. All microstates compatible with these constraints are equally probable.
                        <div className="formula">
                            <BlockMath math="P_i = \frac{1}{\Omega(E, N, V)}" />
                        </div>
                        Entropy of the system:
                        <div className="formula">
                            <BlockMath math="S(E, N, V) = k_B \ln \Omega(E, N, V)" />
                        </div>
                        Here, Ω(E, N, V) is the total number of microstates at fixed energy E.
                    </p>
                </section>
                <section>
                    <h3>Canonical Ensemble (NVT)</h3>
                    <p>The canonical ensemble describes a system in thermal contact with a heat bath at temperature T. Energy can fluctuate, but particle number N and volume V are fixed.
                        <div className="formula">
                            <BlockMath math="P_i = \frac{e^{-E_i / k_B T}}{Z}" />
                            <BlockMath math="Z = \sum_i e^{-E_i / k_B T}" />
                        </div>
                        <InlineMath math="E_i"/> = energy of microstate i<br/>  
                        Z = canonical partition function<br/>
                        <div className="formula">
                            <BlockMath math="F = -k_B T \ln Z" />
                        </div>
                        Where F is the Helmholtz free energy. Average energy of the system:
                        <div className="formula">
                            <BlockMath math="\langle E \rangle = \sum_i P_i E_i = \frac{\sum_i E_i e^{-E_i/k_B T}}{Z}" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Grand Canonical Ensemble (μVT)</h3>
                    <p>
                        The grand canonical ensemble describes a system that can exchange both energy and particles with a reservoir. Temperature T, volume V, and chemical potential μ are fixed.
                        <div className="formula">
                            <BlockMath math="P_i = \frac{e^{-(E_i - \mu N_i)/ k_B T}}{\Xi}" />
                            <BlockMath math="\Xi = \sum_i e^{-(E_i - \mu N_i)/ k_B T}" />
                        </div>
                        <l>μ = chemical potential</l><br/>  
                        <l><InlineMath math="N_i"/> = number of particles in microstate i</l><br/> 
                        <l>Ξ = grand canonical partition function</l>
                    </p>
                </section>
                <section>
                    <h3>Ensemble Averages</h3>
                    <p>In any ensemble, the average value of an observable A is given by:
                        <div className="formula">
                            <BlockMath math="\langle A \rangle = \sum_i P_i A_i" />
                        </div>
                        Or for continuous systems:
                        <div className="formula">
                            <BlockMath math="\langle A \rangle = \int A(x) P(x) \, dx" />
                        </div>
                    </p>
                </section>
                <section>
                    <h3>Connection to Thermodynamics</h3>
                    <p>
                        Each ensemble connects to thermodynamics through characteristic potentials:
                    </p>
                    <ul>
                        <li><b>Microcanonical ensemble:</b> <InlineMath math="S(E, V, N) = k_B \ln \Omega" /> → fundamental thermodynamic relation</li>
                        <li><b>Canonical ensemble:</b> <InlineMath math="F = -k_B T \ln Z" /> → Helmholtz free energy</li>
                        <li><b>Grand canonical ensemble:</b> <InlineMath math="\Omega = -k_B T \ln \Xi" /> → includes chemical potential <InlineMath math="\mu" /></li>
                    </ul>
                    <div style={{display:"flex", flexDirection:"row", justifyContent:"center", width:'100%', gap:'2rem'}}>
                        <div className="formula">
                            <BlockMath math="P = - \left( \frac{\partial F}{\partial V} \right)_T" />
                        </div>
                        <div className="formula">
                            <BlockMath math="N = \left( \frac{\partial \ln \Xi}{\partial (\beta \mu)} \right)_{V,T}" />
                        </div>
                    </div>
                </section>
                <section>
                    <h3>Key Takeaways</h3>
                    <ul>
                        <li>Ensembles provide a statistical framework to compute thermodynamic properties.</li>
                        <li>The choice of ensemble depends on which macroscopic quantities are fixed — <InlineMath math="E, V, N, T, \mu" />.</li>
                        <li>Partition functions encode all the thermodynamic information of the ensemble.</li>
                        <li>Average values of observables are computed as weighted sums or integrals over all microstates.</li>
                    </ul>
                    <p></p>
                </section>
                <div style={{height:'50vh'}}>
                    <RubikCube/>
                </div>
            </div>
        </div>
    )
}