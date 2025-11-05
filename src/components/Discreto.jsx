import NavBar from "../navigation_templates/NavBar";
import RubikCube from "./helpers/RubikCube";

export default function Discreto(){
    return(
        <div className="page-container">
            <NavBar />
            <div className="page-scroller">
                <div style={{position:"absolute",zIndex:2, width:'10rem', height:'10rem', top:'23.5rem', right:'2rem'}}>
                    <RubikCube/>
                </div>
                <div style={{position:"absolute",zIndex:2, width:'10rem', height:'10rem', top:'49em', left:'2rem'}}>
                    <RubikCube/>
                </div>
                <div className="glass-box">
                    <label style={{fontSize:'2rem'}}>Hello! I am <b style={{fontFamily:'orbitron'}}>Discreto</b></label>
                    <label>Your mobile tutor into the statistical fabric of the universe.</label>
                    <label>Together, we will explore randomness, entropy, and the energy hidden in every possible state</label>
                </div>

                <div className="glass-box">
                    <h2>Mission...</h2>
                    <label>To make complex physical systems intuitive and interactive</label>
                    <label>From molecular motion to population inversion, we'll discover every topic in gamifyed way</label>
                    <label>We'll discover how order emerges from chaos</label>
                </div>

                <div className="glass-box">
                    <h2>What I provide?</h2>
                    <ul className="features-list-discreto">
                        <li>
                            <label>⚙️<b>Real-time simulations</b> of different distributions</label>
                            <button></button>
                        </li>
                        <li>📊<b>Interactive entropy and temperature visualizations</b> seen from statistical stochastic view</li>
                        <li>🧩 Step-by-step <b>learning modules and quizzes</b></li>
                        <li>🔬Explorations of <b>many-body and statistical systems</b></li>
                    </ul>
                </div>
            </div>
        </div>
    )
}
