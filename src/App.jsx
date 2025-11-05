import './App.css';
import { BrowserRouter as Router , Routes, Route} from 'react-router-dom';
import Discreto from './components/Discreto';
import Learning from './components/Learning';
import Simulation from './components/Simulation';
import MicrostatesVsMacrostates from './components/learning/MicrostatesVsMacrostates';
import BoltzmanEntropy from './components/learning/BoltzmanEntropy';
import StatisticalEnsembles from './components/learning/StatisticalEnsembles';
import ParticleDistributions from './components/learning/ParticleDistributions';
import EnergyDistributions from './components/learning/EnergyDistributions';
import TemperatureAndEquilibrium from './components/learning/TemperatureAndEquilibrium';
import GasesAndMultiparticleSystems from './components/learning/GasesAndMultiparticleSystems';
import PopulationInversion from './components/learning/PopulationInversion';
import EntropyAndFluctuations from './components/learning/EntropyAndFluctuations';
import DensityOfStatesAndCorrelations from './components/learning/DensityOfStatesAndCorrelations';
import InsightsAndApplications from './components/learning/InsightsAndApplications';
import InspectorParticle from './components/simulations/inspector_particle/InspectorParticle';
import BoltzmannCodex from './components/simulations/boltzmann_codex/BoltzmannCodex';
import EnsembleNexus from './components/simulations/ensemble_nexus/EnsembleNexus';
import QuantumCrowd from './components/simulations/quantum_crowd/QuantumCrowd';
import ThermoSync from './components/simulations/thermosync/ThermoSync';
import DensityMatrix from './components/simulations/density_matrix/DensityMatrix';
import PopulationSurge from './components/simulations/population_surge/PopulationSurge';
import Quizes from './components/Quizes';
import Quiz1 from './components/quizes/Quiz1';
import Quiz2 from './components/quizes/Quiz2';
import Quiz3 from './components/quizes/Quiz3';
import Quiz4 from './components/quizes/Quiz4';
import Quiz5 from './components/quizes/Quiz5';
import Quiz6 from './components/quizes/Quiz6';
import Quiz7 from './components/quizes/Quiz7';
import Quiz8 from './components/quizes/Quiz8';
import Quiz9 from './components/quizes/Quiz9';
import News from './components/News';

const routes = {
  '' : Discreto,
  learning: Learning,
  simulation: Simulation,
  quizes: Quizes,
  news: News,
}

const boltzmanEntropyPath = '/learning/boltzman-entropy';
const statisticalEnsemblesPath = '/learning/statistical-ensembles';
const particleDistributionsPath = '/learning/particle-distributions';
const enDistPath = '/learning/energy-distributions';
const tempAndEqPath = '/learning/temperature-and-equilibrium';
const gmpPath = '/learning/gases-and-multiparticle-systems';
const piPath = '/learning/population-inversion';
const efPath = '/learning/entropy-and-fluctuations';
const dscPath = '/learning/density-of-states-and-correlations';
const iaPath = '/learning/insights-and-applications';

const simInspectorParticle = '/simulation/inspector-particle';

function App() {
  return(
    <Router>
      <Routes>
        
        {Object.entries(routes).map(([thePath, TheComponent])=>(<Route key={`${thePath}`} path={`/${thePath}`} element={<TheComponent/>}/>))}
        
        {/*adaug childs indep*/}
        <Route path='/learning/microstates-vs-macrostates' element={<MicrostatesVsMacrostates/>}/>
        <Route path={boltzmanEntropyPath} element={<BoltzmanEntropy/>}/>
        <Route path={statisticalEnsemblesPath} element={<StatisticalEnsembles/>}/>
        <Route path={particleDistributionsPath} element={<ParticleDistributions/>}/>
        <Route path={enDistPath} element={<EnergyDistributions/>}/>
        <Route path={tempAndEqPath} element={<TemperatureAndEquilibrium/>}/>
        <Route path={gmpPath} element={<GasesAndMultiparticleSystems/>}/>
        <Route path={piPath} element={<PopulationInversion/>}/>
        <Route path={efPath} element={<EntropyAndFluctuations/>}/>
        <Route path={dscPath} element={<DensityOfStatesAndCorrelations/>}/>
        <Route path={iaPath} element={<InsightsAndApplications/>}/>

        <Route path={simInspectorParticle} element={<InspectorParticle/>}/>
        <Route path='/simulation/boltzmann-codex' element={<BoltzmannCodex/>}/>
        <Route path='/simulation/ensemble-nexus' element={<EnsembleNexus/>}/>
        <Route path='/simulation/quantum-crowd' element={<QuantumCrowd/>}/>
        <Route path='/simulation/thermosync' element={<ThermoSync/>}/>
        <Route path='/simulation/density-matrix' element={<DensityMatrix/>}/>
        <Route path='/simulation/population-surge' element={<PopulationSurge/>}/>

        <Route path='/quizes/quiz-1' element={<Quiz1/>}/>
        <Route path="/quizes/quiz-2" element={<Quiz2/>}/>
        <Route path="/quizes/quiz-3" element={<Quiz3/>}/>
        <Route path="/quizes/quiz-4" element={<Quiz4/>}/>
        <Route path='/quizes/quiz-5' element={<Quiz5/>}/>
        <Route path='/quizes/quiz-6' element={<Quiz6/>}/>
        <Route path='/quizes/quiz-7' element={<Quiz7/>}/>
        <Route path='/quizes/quiz-8' element={<Quiz8/>}/>
        <Route path='/quizes/quiz-9' element={<Quiz9/>}/>

      </Routes>
    </Router>
  )
}

export default App
