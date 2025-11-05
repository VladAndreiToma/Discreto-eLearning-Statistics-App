import NavBar from "../../../navigation_templates/NavBar";
import DensityMatrixWebEngine from "./DensityMatrixWebEngine";

export default function DensityMatrix(){
    return(
        <div className="page-container">
            <NavBar/>
            <div className="simulation-scroller">
                <h1>Density Matrix. The Hidden Spectrum of the Matter</h1>
                <DensityMatrixWebEngine/>
                <section>
                    See how particles follow different statistics and explore how temperature affects their energy distribution
                </section>
                <section>
                    These graphs show how particles occupy different energy levels depending on temperature and their quantum nature
                </section>
                <section>
                    Watch how particles spread across energy levels - colder systems stay compact, while hot ones spread wide
                </section>
            </div>
        </div>
    )
}