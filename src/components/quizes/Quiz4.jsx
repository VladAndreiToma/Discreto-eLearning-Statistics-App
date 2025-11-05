import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #4. Topic: Particle Distributions";

export const questions = [
  {
    question: "What does the Boltzmann distribution describe?",
    answers: [
      "The probability of energy levels at a given temperature",
      "The positions of particles in a box",
      "The velocity of a single particle",
      "The volume of the system"
    ],
    correct: 0
  },
  {
    question: "The probability of a particle being in a state with energy E is proportional to:",
    answers: [
      "E / kT",
      "exp(-E / kT)",
      "ln(E)",
      "1 / E"
    ],
    correct: 1
  },
  {
    question: "Which distribution applies to indistinguishable fermions?",
    answers: [
      "Maxwell-Boltzmann",
      "Fermi-Dirac",
      "Bose-Einstein",
      "Poisson"
    ],
    correct: 1
  },
  {
    question: "Which distribution applies to indistinguishable bosons?",
    answers: [
      "Maxwell-Boltzmann",
      "Fermi-Dirac",
      "Bose-Einstein",
      "Gaussian"
    ],
    correct: 2
  },
  {
    question: "Maxwell-Boltzmann distribution is valid when:",
    answers: [
      "Particles are indistinguishable",
      "Quantum effects are negligible",
      "Particles obey the Pauli exclusion principle",
      "System is at absolute zero"
    ],
    correct: 1
  },
  {
    question: "In a Boltzmann distribution, higher energy states are:",
    answers: [
      "More likely than lower energy states",
      "Equally likely as lower energy states",
      "Less likely than lower energy states",
      "Impossible"
    ],
    correct: 2
  },
  {
    question: "What is the most probable energy in a Maxwell-Boltzmann distribution?",
    answers: [
      "Zero",
      "kT/2",
      "Depends on temperature",
      "Infinity"
    ],
    correct: 2
  },
  {
    question: "Fermi-Dirac statistics are important for:",
    answers: [
      "Photons",
      "Electrons in a metal",
      "Helium-4 atoms",
      "Classical gases"
    ],
    correct: 1
  },
  {
    question: "Bose-Einstein condensation occurs when:",
    answers: [
      "Temperature is very high",
      "Bosons occupy the lowest energy state at low temperature",
      "Fermions fill all available states",
      "All particles have the same velocity"
    ],
    correct: 1
  },
  {
    question: "The chemical potential μ in a distribution determines:",
    answers: [
      "Probability of energy levels",
      "Particle exchange with a reservoir",
      "Volume of the system",
      "Temperature of the system"
    ],
    correct: 1
  },
  {
    question: "At high temperatures, the Fermi-Dirac distribution approaches:",
    answers: [
      "Bose-Einstein distribution",
      "Maxwell-Boltzmann distribution",
      "Gaussian distribution",
      "Poisson distribution"
    ],
    correct: 1
  },
  {
    question: "In classical limits, the occupation number of each state is:",
    answers: [
      "Exactly 1",
      "Large and continuous",
      "Restricted to 0 or 1",
      "Negative"
    ],
    correct: 1
  },
  {
    question: "Which factor ensures normalization of probabilities in Boltzmann distribution?",
    answers: [
      "Partition function Z",
      "Energy E",
      "Temperature T",
      "Volume V"
    ],
    correct: 0
  },
  {
    question: "The Maxwell-Boltzmann speed distribution gives:",
    answers: [
      "Probability of a particle at a given position",
      "Probability of a particle having a given speed",
      "Probability of a particle having a given energy",
      "The total number of particles"
    ],
    correct: 1
  },
  {
    question: "As temperature increases in a Maxwell-Boltzmann gas, the most probable speed:",
    answers: [
      "Decreases",
      "Increases",
      "Remains the same",
      "Becomes zero"
    ],
    correct: 1
  }
];


export default function Quiz4(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    )
}