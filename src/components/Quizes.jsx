import { Link } from "react-router-dom";
import NavBar from "../navigation_templates/NavBar";
import { FaArrowCircleRight } from "react-icons/fa";

const quizes = [
    "Quiz 1", "Quiz 2", "Quiz 3" , "Quiz 4", "Quiz 5", "Quiz 6", "Quiz 7", "Quiz 8", "Quiz 9"
];

const toSlug = (qname) => {
    return qname.toLowerCase().replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-");
}

export default function Quizes(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="page-scroller">
                {
                    quizes.map((q,idx)=>{
                        const slug = toSlug(q);
                        return(
                            <div key={idx} className="glass-box">
                                <label>{q}</label>
                                <Link to={`/quizes/${slug}`} style={{textDecoration:'none', color:'#eee'}}>
                                    <FaArrowCircleRight style={{width:'1.6rem', height:'1.6rem'}}/>
                                </Link>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )   
}