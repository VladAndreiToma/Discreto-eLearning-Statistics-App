import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #5. Topic: Energy Distributions";

export const questions = [
  {
    question: "What does the Maxwell-Boltzmann distribution describe?",
    answers: [
      "The probability of energy states for bosons",
      "The probability distribution of particle energies in a classical gas",
      "The distribution of particle positions",
      "The quantum spin orientations"
    ],
    correct: 1
  },
  {
    question: "Which factor affects the shape of the Maxwell-Boltzmann distribution?",
    answers: [
      "Temperature",
      "Volume only",
      "Particle mass only",
      "Pressure only"
    ],
    correct: 0
  },
  {
    question: "At higher temperatures, the Maxwell-Boltzmann distribution:",
    answers: [
      "Becomes narrower",
      "Shifts to higher energies and broadens",
      "Shifts to lower energies",
      "Remains unchanged"
    ],
    correct: 1
  },
  {
    question: "The most probable speed of a particle in an ideal gas:",
    answers: [
      "Equals the average speed",
      "Is less than the average speed",
      "Is greater than the average speed",
      "Is unrelated to temperature"
    ],
    correct: 1
  },
  {
    question: "The Boltzmann factor e^(-E/kT) indicates:",
    answers: [
      "The number of microstates",
      "The relative probability of a particle having energy E at temperature T",
      "The pressure of a gas",
      "The volume fraction of high-energy particles"
    ],
    correct: 1
  },
  {
    question: "In the canonical ensemble, the probability of a state depends on:",
    answers: [
      "Its energy and the system's temperature",
      "Its volume only",
      "Its particle number only",
      "Its entropy only"
    ],
    correct: 0
  },
  {
    question: "The average energy of a classical particle in 1D is:",
    answers: [
      "kT",
      "kT/2",
      "2kT",
      "0"
    ],
    correct: 1
  },
  {
    question: "As temperature increases, the fraction of particles with high energy:",
    answers: [
      "Decreases",
      "Remains constant",
      "Increases",
      "Oscillates"
    ],
    correct: 2
  },
  {
    question: "The density of states g(E) represents:",
    answers: [
      "Number of microstates at energy E",
      "Average energy of a particle",
      "Total energy of the system",
      "Number of particles"
    ],
    correct: 0
  },
  {
    question: "Which distribution describes indistinguishable fermions?",
    answers: [
      "Maxwell-Boltzmann",
      "Fermi-Dirac",
      "Bose-Einstein",
      "Gaussian"
    ],
    correct: 1
  },
  {
    question: "Which distribution describes indistinguishable bosons?",
    answers: [
      "Maxwell-Boltzmann",
      "Fermi-Dirac",
      "Bose-Einstein",
      "Poisson"
    ],
    correct: 2
  },
  {
    question: "In classical limit, both Fermi-Dirac and Bose-Einstein distributions reduce to:",
    answers: [
      "Maxwell-Boltzmann distribution",
      "Poisson distribution",
      "Gaussian distribution",
      "Uniform distribution"
    ],
    correct: 0
  },
  {
    question: "The partition function Z is used to:",
    answers: [
      "Count total microstates",
      "Normalize probabilities of energy states",
      "Measure temperature",
      "Calculate pressure only"
    ],
    correct: 1
  },
  {
    question: "In a system with discrete energy levels, higher energy states are:",
    answers: [
      "More likely to be occupied at low temperatures",
      "Less likely to be occupied at low temperatures",
      "Equally likely at all temperatures",
      "Never occupied"
    ],
    correct: 1
  },
  {
    question: "The Boltzmann distribution explains:",
    answers: [
      "Why all particles have the same energy",
      "Why particle energies spread according to temperature",
      "How particles interact via forces",
      "How volumes expand"
    ],
    correct: 1
  }
];


export default function Quiz5(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    )
}