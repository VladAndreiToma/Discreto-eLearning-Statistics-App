import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

const quizQuestions = [
  {
    question: "What is a microstate in a thermodynamic system?",
    answers: [
      "A global description of the system using macroscopic quantities",
      "A specific configuration of all particles in the system",
      "A measure of the system's entropy",
      "An equilibrium state of the system",
    ],
    correct: 1,
  },
  {
    question: "What is a macrostate in statistical mechanics?",
    answers: [
      "A single microscopic configuration",
      "A collection of all microstates compatible with macroscopic constraints",
      "A randomly selected energy level",
      "A single particle's motion within the system",
    ],
    correct: 1,
  },
  {
    question: "Which of the following best describes entropy in statistical mechanics?",
    answers: [
      "A measure of the number of accessible microstates",
      "A measure of disorder only in gases",
      "A measure of average kinetic energy",
      "A property that decreases with temperature",
    ],
    correct: 0,
  },
  {
    question: "If two macrostates have different numbers of microstates, which one has higher entropy?",
    answers: [
      "The one with fewer microstates",
      "The one with more microstates",
      "Both have equal entropy",
      "Entropy is unrelated to microstates",
    ],
    correct: 1,
  },
  {
    question: "In the relation S = k_B ln(Ω), what does Ω represent?",
    answers: [
      "The total energy of the system",
      "The number of possible microstates",
      "The macroscopic temperature",
      "The system's volume",
    ],
    correct: 1,
  },
  {
    question: "Two macrostates have Ω₁ = 10⁴ and Ω₂ = 10⁶. Which has greater entropy?",
    answers: [
      "Macrostate 1",
      "Macrostate 2",
      "Both are equal",
      "Cannot be determined",
    ],
    correct: 1,
  },
  {
    question: "What happens to the number of microstates when energy is distributed more evenly among particles?",
    answers: [
      "It decreases",
      "It increases",
      "It remains constant",
      "It becomes infinite",
    ],
    correct: 1,
  },
  {
    question: "Which of the following pairs correspond to microstate/macroscopic variable respectively?",
    answers: [
      "(Position and velocity of each particle) / (Temperature and pressure)",
      "(Entropy) / (Momentum of a single atom)",
      "(Energy level) / (Electron spin)",
      "(Molecular vibration) / (Single molecule orientation)",
    ],
    correct: 0,
  },
  {
    question: "At thermal equilibrium, what can be said about the macrostates and microstates?",
    answers: [
      "The system occupies only one microstate",
      "The system is equally likely to be in any accessible microstate",
      "The number of microstates decreases",
      "Microstates no longer exist",
    ],
    correct: 1,
  },
  {
    question: "Which statement is TRUE about microstates and macrostates?",
    answers: [
      "Each macrostate corresponds to exactly one microstate",
      "Multiple microstates can correspond to the same macrostate",
      "Microstates depend only on pressure and temperature",
      "Macrostates describe individual particles",
    ],
    correct: 1,
  },
];
const quizTitle = "Quiz #1. Topic: Microstates vs Macrostates";

export default function Quiz1() {
   return(
    <div className="page-container">
        <NavBar/>
        <QuizCreator questions={quizQuestions} title={quizTitle}/> 
    </div>
   )
}
