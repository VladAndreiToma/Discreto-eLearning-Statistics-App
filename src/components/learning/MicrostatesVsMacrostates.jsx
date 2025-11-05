import 'katex/dist/katex.min.css';
import { BlockMath, InlineMath } from 'react-katex';
import NavBar from "../../navigation_templates/NavBar";
import RubikCube from '../helpers/RubikCube';

export default function MicrostatesVsMacrostates() {
  return (
    <div className="page-container">
      <NavBar/>
      <div className="theory-scroller">
        <h1 className="chapter-title">Chapter 1 — Microstates vs Macrostates</h1>
        <div className='mascot'>
          <RubikCube/>
        </div>
        {/* Introduction */}
        <section>
          <h3>Introduction</h3>
          <p>
            In statistical physics and thermodynamics, <b>microstates</b> and <b>macrostates</b> are fundamental concepts
            that help us understand the behavior of a system with many particles.
          </p>
          <ul>
            <li>
              <b>Macrostate</b>: a description of the system using observable, large-scale quantities 
              (e.g., total energy, temperature, pressure, volume).
            </li>
            <li>
              <b>Microstate</b>: the complete description of each particle's exact state, i.e., position and momentum.
            </li>
          </ul>
          <p>
            <i>Intuitive example:</i> Consider a box with 10 red balls and 10 white balls:
          </p>
          <ul>
            <li>Macrostate: “5 red balls on the left, 5 red balls on the right”</li>
            <li>Microstate: “red ball #1 is here, red ball #2 is there, …”</li>
          </ul>
        </section>

        {/* Connection between Microstates and Macrostates */}
        <section>
          <h3>Connection between Microstates and Macrostates</h3>
          <p>
            For a system with <InlineMath math="N" /> particles, the total number of <b>microstates</b> 
            corresponding to a given <b>macrostate</b> is denoted by <InlineMath math="\Omega" />.
          </p>
          <p>
            The <b>Boltzmann entropy formula</b> relates microstates to the system's entropy:
          </p>
          <div className="formula">
            <BlockMath math="S = k_B \ln \Omega" />
          </div>
          <p>
            Where: 
            <ul>
              <li><InlineMath math="S" /> = entropy of the system</li>
              <li><InlineMath math="k_B" /> = Boltzmann constant</li>
              <li><InlineMath math="\Omega" /> = number of microstates corresponding to the macrostate</li>
            </ul>
          </p>
          <p>
            Entropy increases as the number of microstates increases, meaning systems naturally evolve 
            toward macrostates with more microstates (higher probability).
          </p>
        </section>

        {/* Example */}
        <section>
          <h3>Example: Balls in Boxes</h3>
          <p>
            Suppose you have 3 balls (R = red, W = white) and 2 boxes. We want to count the microstates 
            for the macrostate: “1 ball in each box”.
          </p>
          <ul>
            <li>(R in box 1, W in box 2, R in box 2)</li>
            <li>(R in box 2, W in box 1, R in box 1)</li>
            <li>…</li>
          </ul>
          <p>
            Macrostate: “1 ball in each box” → Number of microstates: 
            <InlineMath math="\Omega = 3" />
          </p>
          <p>
            Entropy (using Boltzmann formula):
          </p>
          <div className="formula">
            <BlockMath math="S = k_B \ln 3" />
          </div>
        </section>

        {/* Summary */}
        <section>
          <h3>Summary</h3>
          <ul>
            <li>Microstate: exact state of each particle.</li>
            <li>Macrostate: observable, summarized state of the system.</li>
            <li>Entropy measures the number of microstates corresponding to a macrostate.</li>
            <li>Systems naturally evolve toward macrostates with the most microstates (highest probability).</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
