import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #3. Topic: Statistical Ensembles";

export const questions = [
  {
    question: "What is a statistical ensemble?",
    answers: [
      "A large collection of virtual copies of a system considered simultaneously",
      "A single isolated particle",
      "A classical thermodynamic equation",
      "A quantum state"
    ],
    correct: 0
  },
  {
    question: "Which of the following is a microcanonical ensemble?",
    answers: [
      "Fixed energy, volume, and particle number",
      "Fixed temperature and volume",
      "Fixed temperature and pressure",
      "Fixed chemical potential"
    ],
    correct: 0
  },
  {
    question: "What is held constant in a canonical ensemble?",
    answers: [
      "Energy, volume, particle number",
      "Temperature, volume, particle number",
      "Temperature, pressure, particle number",
      "Energy, pressure, particle number"
    ],
    correct: 1
  },
  {
    question: "The grand canonical ensemble allows fluctuations in:",
    answers: [
      "Energy only",
      "Particle number only",
      "Both energy and particle number",
      "Neither energy nor particle number"
    ],
    correct: 2
  },
  {
    question: "In statistical ensembles, a macrostate corresponds to:",
    answers: [
      "A single microstate",
      "Many microstates with the same macroscopic properties",
      "A single observable particle",
      "An exact solution of the Schrödinger equation"
    ],
    correct: 1
  },
  {
    question: "The partition function in a canonical ensemble is denoted by:",
    answers: [
      "Ω",
      "Z",
      "S",
      "F"
    ],
    correct: 1
  },
  {
    question: "The probability of a system being in a state with energy E in a canonical ensemble is proportional to:",
    answers: [
      "E / kT",
      "exp(-E / kT)",
      "ln(E)",
      "1 / E"
    ],
    correct: 1
  },
  {
    question: "Which ensemble is most useful for systems exchanging particles with a reservoir?",
    answers: [
      "Microcanonical",
      "Canonical",
      "Grand canonical",
      "Isolated"
    ],
    correct: 2
  },
  {
    question: "In a microcanonical ensemble, all accessible microstates are assumed to have:",
    answers: [
      "Equal probability",
      "Probability proportional to energy",
      "Probability proportional to volume",
      "Random probability"
    ],
    correct: 0
  },
  {
    question: "The canonical ensemble is used when the system can exchange:",
    answers: [
      "Energy only",
      "Particles only",
      "Both energy and particles",
      "Neither energy nor particles"
    ],
    correct: 0
  },
  {
    question: "The Helmholtz free energy F is related to the canonical partition function Z by:",
    answers: [
      "F = kT ln Z",
      "F = -kT ln Z",
      "F = Z / kT",
      "F = kT / Z"
    ],
    correct: 1
  },
  {
    question: "Which ensemble best describes an isolated system with fixed total energy?",
    answers: [
      "Canonical",
      "Grand canonical",
      "Microcanonical",
      "Isothermal"
    ],
    correct: 2
  },
  {
    question: "In statistical mechanics, a macrostate is defined by:",
    answers: [
      "Exact positions and momenta of all particles",
      "A set of macroscopic variables like E, V, N",
      "Quantum numbers of a single particle",
      "The temperature of a single particle"
    ],
    correct: 1
  },
  {
    question: "Fluctuations in energy are smallest in which ensemble for a large system?",
    answers: [
      "Microcanonical",
      "Canonical",
      "Grand canonical",
      "All ensembles equally"
    ],
    correct: 1
  },
  {
    question: "The grand canonical partition function depends on:",
    answers: [
      "Temperature and volume only",
      "Temperature, chemical potential, and volume",
      "Energy only",
      "Number of microstates only"
    ],
    correct: 1
  }
];



export default function Quiz3(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    );
}