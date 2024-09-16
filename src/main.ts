import './style.scss'
//import { setupCounter } from './counter.ts'
import 'leaflet/dist/leaflet.css';
import {Mapa} from './mapas.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<aside class="col-3" >
   <div class="card">
    <div class="card-header">
      <h4>Información</h4>
    </div>
    <div class="card-body">
      <h5 class="card-title">Edificios</h5>
      <p class="card-text">Información sobre las edificaciones del campus ITSC</p>
      <hr/>

      
    </div>
  </div>
   </div>  
</aside>
<main id='map' class="col-9 map"></main>
`

console.log('map')
Mapa();
//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
