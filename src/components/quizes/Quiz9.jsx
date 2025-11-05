import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

export const title = "Quiz #9. Topic: Density of States";

export const questions = [
  {
    question: "The density of states (DOS) in a system describes:",
    answers: [
      "The number of energy levels per unit energy interval",
      "The probability of finding a particle at a certain position",
      "The total energy of the system",
      "The temperature distribution"
    ],
    correct: 0
  },
  {
    question: "For a free electron in a 3D box, the density of states increases with:",
    answers: [
      "Energy",
      "Volume only",
      "Temperature",
      "Magnetic field"
    ],
    correct: 0
  },
  {
    question: "The units of density of states are usually:",
    answers: [
      "1 / Joule",
      "Energy × Volume",
      "Number / Energy",
      "Joule / particle"
    ],
    correct: 2
  },
  {
    question: "In a one-dimensional system, the DOS as a function of energy is:",
    answers: [
      "Constant",
      "Proportional to √E",
      "Proportional to 1/√E",
      "Proportional to E²"
    ],
    correct: 2
  },
  {
    question: "Which of the following affects the density of states in a material?",
    answers: [
      "Dimensionality of the system",
      "Type of particles",
      "Volume of the system",
      "All of the above"
    ],
    correct: 3
  },
  {
    question: "For electrons in a solid, the DOS near the Fermi energy determines:",
    answers: [
      "Optical absorption",
      "Electrical conductivity",
      "Magnetic moment",
      "Pressure"
    ],
    correct: 1
  },
  {
    question: "The integral of the DOS multiplied by the occupation probability gives:",
    answers: [
      "The total number of particles",
      "The total volume",
      "The total temperature",
      "The total entropy"
    ],
    correct: 0
  },
  {
    question: "In 2D electron gas, the density of states as a function of energy is:",
    answers: [
      "Constant",
      "Proportional to √E",
      "Proportional to E²",
      "Decreasing with E"
    ],
    correct: 0
  },
  {
    question: "Van Hove singularities appear in the DOS because:",
    answers: [
      "Energy levels are degenerate",
      "The derivative of energy with respect to momentum vanishes",
      "Temperature is high",
      "The system is in thermal equilibrium"
    ],
    correct: 1
  },
  {
    question: "The DOS is important in statistical physics because:",
    answers: [
      "It determines how particles occupy energy levels",
      "It directly gives the system's temperature",
      "It fixes the volume of the system",
      "It measures the system's velocity distribution"
    ],
    correct: 0
  },
  {
    question: "The 3D free electron DOS is proportional to:",
    answers: [
      "E^(1/2)",
      "E^(3/2)",
      "E",
      "E²"
    ],
    correct: 1
  },
  {
    question: "Why does the DOS differ in 1D, 2D, and 3D systems?",
    answers: [
      "Because the number of allowed k-states depends on dimensionality",
      "Because particles change mass in different dimensions",
      "Because temperature varies with dimension",
      "Because energy is quantized only in 3D"
    ],
    correct: 0
  }
];


export default function Quiz9(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={questions} title={title}/>
        </div>
    );
}