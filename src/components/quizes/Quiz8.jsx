import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #8. Topic: Population Inversion";

export const questions = [
  {
    question: "Population inversion refers to:",
    answers: [
      "More particles in lower energy states than higher",
      "More particles in higher energy states than lower",
      "Equal number of particles in all states",
      "Particles randomly distributed"
    ],
    correct: 1
  },
  {
    question: "Which is required to achieve population inversion in a laser medium?",
    answers: [
      "Thermal equilibrium",
      "Pumping energy",
      "Vacuum",
      "Spontaneous emission only"
    ],
    correct: 1
  },
  {
    question: "In a two-level system, population inversion is:",
    answers: [
      "Easily achieved",
      "Impossible at thermal equilibrium",
      "Achieved by cooling",
      "Achieved by reducing particle number"
    ],
    correct: 1
  },
  {
    question: "Stimulated emission occurs when:",
    answers: [
      "A photon excites a particle to a higher state",
      "A photon is absorbed",
      "A photon induces a particle to emit an identical photon",
      "Particles spontaneously emit photons randomly"
    ],
    correct: 2
  },
  {
    question: "The gain medium in a laser is responsible for:",
    answers: [
      "Absorbing all photons",
      "Amplifying light through stimulated emission",
      "Cooling the system",
      "Preventing emission"
    ],
    correct: 1
  },
  {
    question: "Which type of laser uses population inversion between vibrational levels of molecules?",
    answers: [
      "Gas laser",
      "Solid-state laser",
      "Dye laser",
      "Molecular laser"
    ],
    correct: 3
  },
  {
    question: "Pumping in a laser refers to:",
    answers: [
      "Heating the medium",
      "Injecting energy to excite particles to higher states",
      "Reducing population of excited states",
      "Turning the laser off"
    ],
    correct: 1
  },
  {
    question: "A three-level laser requires:",
    answers: [
      "Population inversion between ground and first excited state",
      "Population inversion between first and second excited state",
      "No pumping",
      "Thermal equilibrium"
    ],
    correct: 1
  },
  {
    question: "The threshold condition of a laser is when:",
    answers: [
      "Gain equals losses in the cavity",
      "Population inversion is zero",
      "All particles are in the ground state",
      "Temperature reaches absolute zero"
    ],
    correct: 0
  },
  {
    question: "Spontaneous emission differs from stimulated emission because:",
    answers: [
      "It emits photons in random directions and phases",
      "It requires external photons",
      "It always decreases energy of the system",
      "It does not follow quantum rules"
    ],
    correct: 0
  },
  {
    question: "Population inversion cannot be sustained without:",
    answers: [
      "A laser cavity",
      "Continuous pumping",
      "Cooling the system",
      "Photon absorption"
    ],
    correct: 1
  },
  {
    question: "The main role of mirrors in a laser cavity is:",
    answers: [
      "Absorb excess photons",
      "Provide feedback to amplify light",
      "Cool the medium",
      "Randomize photon directions"
    ],
    correct: 1
  }
];


export default function Quiz8(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    )
}