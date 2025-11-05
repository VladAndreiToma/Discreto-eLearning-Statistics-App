import { FaArrowAltCircleRight, FaSearchPlus } from "react-icons/fa";
import NavBar from "../navigation_templates/NavBar";
import { Link } from "react-router-dom";
import { FaBookOpenReader } from "react-icons/fa6";

const news = [
  {
    title: "Emergent order from mixed chaos at low temperature",
    abstract: "This paper explores a novel connection between a thermodynamic and a dynamical systems perspective on emergent dynamical order. We provide evidence for a conjecture that Hamiltonian systems with mixed chaos spontaneously find regular behavior when minimally coupled to a thermal bath at sufficiently low temperature.",
    published: "04 Nov 2025",
    journal: "Nature",
    link: 'https://www.nature.com/articles/s41598-025-22877-4'
  },
  {
    title: "Neurophysiological correlates to the human brain complexity through q-statistical analysis of electroencephalogram",
    abstract: "The prospects of assessing neural complexity (NC) by q-statistics of the systemic organization of different types and levels of brain activity were studied. In 70 adult subjects, NC was assessed via the parameter q of q-statistics, applied to the ongoing EEG and of 20 scalp points (channels).",
    published: "20 October 2025",
    journal: "Nature",
    link: "https://www.nature.com/articles/s41598-025-21156-6"
  }
];

export default function News() {
  return (
    <div className="page-container">
      <NavBar />
      <div className="page-scroller">
        {news.map((item, index) => (
          <div key={index} className="glass-box">
            <h3>{item.title}</h3>
            <p>{item.abstract.split(".")[0]}.</p> {/* doar prima propoziție din abstract */}
            <p>
              <strong>{item.published}</strong> | <em>{item.journal}</em>
            </p>
            <Link to={item.link} style={{textDecoration:'none', color:'#eee'}}>
                <FaBookOpenReader style={{width:'1.8rem', height:'1.8rem'}}/> 
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
