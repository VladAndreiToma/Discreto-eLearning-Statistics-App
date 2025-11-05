import * as THREE from 'three';
import { useState, useEffect, useRef } from 'react';
import NavBar from '../../../navigation_templates/NavBar';
import EnsembleNexusWebEngine from './EnsembleNexusWebEngine';


export default function EnsembleNexus(){
    return(
        <div className='page-container'>
            <NavBar/>
            <div className='simulation-scroller'>
                <h1>Ensemble Nexus. The Theory of Particles</h1>
                <EnsembleNexusWebEngine/>
            </div>
        </div>
    )
}