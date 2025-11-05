import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Chapter 6 — Temperature and Equilibrium";

export const questions = [
  {
    question: "What is the zeroth law of thermodynamics?",
    answers: [
      "Energy cannot be created or destroyed",
      "If two systems are each in thermal equilibrium with a third, they are in equilibrium with each other",
      "Entropy of the universe always increases",
      "Heat flows from cold to hot spontaneously"
    ],
    correct: 1
  },
  {
    question: "Temperature is a measure of:",
    answers: [
      "Internal energy per particle",
      "Average kinetic energy of particles",
      "Entropy of the system",
      "Total energy of the system"
    ],
    correct: 1
  },
  {
    question: "Thermal equilibrium occurs when:",
    answers: [
      "Two systems have the same volume",
      "Two systems have the same temperature",
      "Two systems have the same energy",
      "Two systems exchange no particles"
    ],
    correct: 1
  },
  {
    question: "Heat flows spontaneously from:",
    answers: [
      "Cold to hot",
      "Hot to cold",
      "High pressure to low pressure",
      "Low energy to high energy"
    ],
    correct: 1
  },
  {
    question: "The ideal gas law connects which quantities?",
    answers: [
      "Pressure, volume, temperature, and number of particles",
      "Energy, entropy, and temperature",
      "Heat, work, and internal energy",
      "Velocity, mass, and force"
    ],
    correct: 0
  },
  {
    question: "Which of the following defines absolute zero?",
    answers: [
      "Temperature at which volume is zero",
      "Temperature at which pressure is zero",
      "Temperature at which particle motion stops",
      "Temperature at which entropy is infinite"
    ],
    correct: 2
  },
  {
    question: "The equipartition theorem states:",
    answers: [
      "Each degree of freedom contributes kT/2 to average energy",
      "Energy is always equally distributed among particles",
      "Particles move with the same speed",
      "Entropy is proportional to temperature"
    ],
    correct: 0
  },
  {
    question: "Two systems in thermal contact will exchange energy until:",
    answers: [
      "They have equal pressures",
      "They have equal temperatures",
      "They have equal volumes",
      "They have equal energies"
    ],
    correct: 1
  },
  {
    question: "Which quantity remains constant in an isolated system at equilibrium?",
    answers: [
      "Temperature",
      "Entropy",
      "Internal energy",
      "All of the above"
    ],
    correct: 3
  },
  {
    question: "Thermometers work because of:",
    answers: [
      "Direct measurement of energy",
      "Changes in physical property correlated with temperature",
      "Heat capacity of the thermometer",
      "Thermal equilibrium with the universe"
    ],
    correct: 1
  },
  {
    question: "Heat capacity at constant volume is defined as:",
    answers: [
      "dQ/dV",
      "dU/dT",
      "dW/dT",
      "dS/dT"
    ],
    correct: 1
  },
  {
    question: "Thermal contact allows systems to exchange:",
    answers: [
      "Work",
      "Heat",
      "Particles",
      "Entropy"
    ],
    correct: 1
  },
  {
    question: "Temperature is an intensive property because:",
    answers: [
      "It does not depend on the size of the system",
      "It is proportional to the number of particles",
      "It is measured in Kelvin",
      "It always increases in isolated systems"
    ],
    correct: 0
  },
  {
    question: "In equilibrium, which of the following is true?",
    answers: [
      "No net exchange of energy occurs",
      "No particle motion occurs",
      "Entropy decreases",
      "Temperature varies locally"
    ],
    correct: 0
  },
  {
    question: "The Boltzmann constant k relates:",
    answers: [
      "Temperature and energy at particle level",
      "Pressure and volume",
      "Entropy and volume",
      "Work and heat"
    ],
    correct: 0
  }
];


export default function Quiz6(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    )
}