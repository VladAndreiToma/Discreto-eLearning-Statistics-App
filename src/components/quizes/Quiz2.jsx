import NavBar from "../../navigation_templates/NavBar";
import QuizCreator from "./QuizCreator";

const  quiz2Questions = [
    {
      question: "What does the formula S = k · ln(Ω) express?",
      answers: [
        "The relationship between entropy and the number of possible microstates",
        "The ideal gas law",
        "The energy–frequency relationship",
        "Ohm’s law for gases"
      ],
      correct: 0
    },
    {
      question: "What does the symbol Ω represent in Boltzmann’s equation?",
      answers: [
        "The volume of the system",
        "The number of microstates compatible with the given macrostate",
        "The pressure of the gas",
        "The absolute temperature"
      ],
      correct: 1
    },
    {
      question: "How does entropy vary with the disorder of the system?",
      answers: [
        "It decreases as disorder increases",
        "It remains constant regardless of disorder",
        "It increases as disorder increases",
        "It is inversely proportional to temperature"
      ],
      correct: 2
    },
    {
      question: "The Boltzmann constant has an approximate value of:",
      answers: [
        "1.6×10⁻¹⁹ J/K",
        "6.63×10⁻³⁴ J·s",
        "8.617×10⁻⁵ eV/K",
        "9.81 m/s²"
      ],
      correct: 2
    },
    {
      question: "When a system is in thermodynamic equilibrium, its entropy is:",
      answers: [
        "At its minimum possible value",
        "At its maximum possible value for the given conditions",
        "Zero",
        "Negative"
      ],
      correct: 1
    },
    {
      question: "Entropy is a quantity that is:",
      answers: [
        "Extensive — depends on the system size",
        "Intensive — independent of the system size",
        "Dimensionless",
        "Impossible to measure"
      ],
      correct: 0
    }
  ];

const title = "Quiz #2. Topic: Boltzmann Entropy";



export default function Quiz2(){
    return(
        <div className="page-container">
            <NavBar/>
            <QuizCreator questions={quiz2Questions} title={title}/>
        </div>
    )
}