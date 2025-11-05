import NavBar from "../../navigation_templates/NavBar";
import RubikCube from "../helpers/RubikCube";

export default function PopulationInversion(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="theory-scroller">
                <h1 className="chapter-title">Chapter 8 - Population Inversion</h1>
                <div className='mascot'>
                          <RubikCube/>
                        </div>
                <section>
                    Under normal thermal equilibrium, most atoms reside in the ground state, with only a few occupying higher energy levels.
                    For laser operation, however, we require the opposite situation — more atoms in an excited state than in the ground state.
                    This non-equilibrium condition is called:
                    <div class="formula"> <strong>Population Inversion</strong> = N<sub>excited</sub> &gt; N<sub>ground</sub> </div>
                    This inversion is the fundamental prerequisite for light amplification through stimulated emission.
                </section>
                <section>
                    <h3>Boltzmann Distribution and Thermal Equilibrium</h3>
                    <p>In thermal equilibrium, the population of energy levels follows the Boltzmann distribution:</p>
                    <div class="formula"> N<sub>i</sub> = N<sub>0</sub> e<sup>-E<sub>i</sub> / kT</sup> </div>
                    where:
                    <ul>
                        <li>N<sub>i</sub> → number of atoms in level i</li>
                        <li>E<sub>i</sub> → energy of that level</li>
                        <li>k → Boltzmann constant</li>
                        <li>Thus, higher-energy states are exponentially less populated, making population inversion impossible in equilibrium — it must be created artificially.</li>
                    </ul>
                </section>
                <section>
                    <h3>Achieving Population Inversion</h3>
                    <p>
                        To achieve inversion, energy must be pumped into the system to excite atoms faster than they can decay.
                        There are several common pumping mechanisms:
                        <table className="pumping-table">
                            <thead>
                                <tr>
                                <th>Pumping Method</th>
                                <th>Description</th>
                                <th>Example</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                <td>Optical pumping</td>
                                <td>Light source excites atoms</td>
                                <td>Ruby laser</td>
                                </tr>
                                <tr>
                                <td>Electrical discharge</td>
                                <td>Electrons excite gas atoms</td>
                                <td>He–Ne laser</td>
                                </tr>
                                <tr>
                                <td>Chemical pumping</td>
                                <td>Exothermic reactions transfer energy</td>
                                <td>HF laser</td>
                                </tr>
                            </tbody>
                        </table>
                    </p>
                </section>
                <section>
                    <h3>The 3-Level and 4-Level Laser Systems</h3>
                    <p>Modelation using three energy levels</p>
                    <h4>3-Level System</h4>
                    <ul>
                        <li>Atoms are pumped from E₁ → E₃</li>
                        <li>They quickly decay to E₂ (metastable state)</li>
                        <li>Laser transition: E₂ → E₁</li>
                    </ul>
                    <p>Efficiency is low since more than half the atoms must be excited to achieve inversion.</p>
                    <h4>5-Level System</h4>
                    <ul>
                        <li>Pumping excites atoms E₁ → E₄</li>
                        <li>Fast decay to E₃ (metastable)</li>
                        <li>Laser transition: E₃ → E₂</li>
                        <li>E₂ → E₁ decays rapidly</li>
                    </ul>
                    <p>This system achieves inversion more easily since the lower laser level is almost empty.</p>
                </section>
                <section>
                    <h3>Summary</h3>
                    <p>Population inversion is the core concept enabling laser action, requiring:

A non-equilibrium energy distribution

An external pumping mechanism

A metastable state for accumulation of excited atoms

When combined with stimulated emission and optical feedback, population inversion leads to coherent light amplification — the foundation of LASER technology.</p>
                </section>
            </div>
        </div>
    )
}