import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #7. Topic: Gases and Multiparticle Systems";

export const questions = [
  {
    question: "Which law relates pressure, volume, and temperature for an ideal gas?",
    answers: [
      "Boyle’s Law",
      "Charles’ Law",
      "Ideal Gas Law",
      "Avogadro’s Law"
    ],
    correct: 2
  },
  {
    question: "In an ideal gas, the internal energy depends mainly on:",
    answers: [
      "Pressure",
      "Temperature",
      "Volume",
      "Number of microstates only"
    ],
    correct: 1
  },
  {
    question: "The equipartition theorem states that each quadratic degree of freedom contributes:",
    answers: [
      "kT",
      "kT/2",
      "2kT",
      "0"
    ],
    correct: 1
  },
  {
    question: "For N identical non-interacting particles, the partition function of the system is:",
    answers: [
      "The sum of single-particle partition functions",
      "The product of single-particle partition functions",
      "Equal to 1",
      "Independent of N"
    ],
    correct: 1
  },
  {
    question: "The most probable speed in a Maxwell-Boltzmann distribution depends on:",
    answers: [
      "Particle mass and temperature",
      "Pressure only",
      "Volume only",
      "Number of particles only"
    ],
    correct: 0
  },
  {
    question: "Increasing the number of particles N in a system:",
    answers: [
      "Does not affect total energy",
      "Increases total energy proportionally",
      "Reduces total energy",
      "Changes the temperature"
    ],
    correct: 1
  },
  {
    question: "The multiplicity Ω of a system refers to:",
    answers: [
      "Number of possible microstates for a given macrostate",
      "Total energy of the system",
      "Average speed of particles",
      "Number of particles"
    ],
    correct: 0
  },
  {
    question: "In classical limit, distinguishable particles follow:",
    answers: [
      "Fermi-Dirac statistics",
      "Bose-Einstein statistics",
      "Maxwell-Boltzmann statistics",
      "Pauli exclusion"
    ],
    correct: 2
  },
  {
    question: "The entropy S is related to multiplicity Ω via:",
    answers: [
      "S = k ln Ω",
      "S = Ω/k",
      "S = kΩ^2",
      "S = ln(Ω)/k"
    ],
    correct: 0
  },
  {
    question: "In a gas with N particles, the average kinetic energy per particle is:",
    answers: [
      "3/2 kT",
      "kT",
      "1/2 kT",
      "2 kT"
    ],
    correct: 0
  },
  {
    question: "The pressure of an ideal gas can be derived from:",
    answers: [
      "Momentum transfer of particles on container walls",
      "Volume alone",
      "Temperature alone",
      "Entropy changes"
    ],
    correct: 0
  },
  {
    question: "The canonical ensemble describes a system with:",
    answers: [
      "Fixed N, V, and T",
      "Fixed N, V, and E",
      "Fixed P, T, and V",
      "Variable N only"
    ],
    correct: 0
  },
  {
    question: "Which assumption is made for an ideal gas in statistical mechanics?",
    answers: [
      "No particle interactions",
      "Strong interparticle forces",
      "Particles occupy fixed positions",
      "Energy is quantized in all cases"
    ],
    correct: 0
  },
  {
    question: "The total partition function Z for a system of N non-interacting identical particles is:",
    answers: [
      "Z_1 / N!",
      "Z_1^N / N!",
      "Z_1 + N",
      "Z_1 * N"
    ],
    correct: 1
  },
  {
    question: "At equilibrium, the probability of a system being in a particular microstate:",
    answers: [
      "Is the same for all microstates with equal energy",
      "Depends only on particle mass",
      "Depends on container volume only",
      "Is always zero"
    ],
    correct: 0
  }
];


export default function Quiz7(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    );
}