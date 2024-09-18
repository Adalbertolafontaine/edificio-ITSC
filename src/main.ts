import './style.scss';
import 'leaflet/dist/leaflet.css';
import { Mapa } from './mapas.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
<aside class="col-3">
  <div class="card">
    <div class="card-header">
      <h4>Información</h4>
    </div>
    <div class="card-body">
      <h5 class="card-title">Edificios</h5>
      <p class="card-text">Haz clic en un edificio para ver los detalles</p>
      <hr/>
    </div>
  </div>
</aside>
<main id='map' class="col-9 map"></main>
`;

console.log('map');
Mapa();
//setupCounter(document.querySelector<HTMLButtonElement>('#counter')!)
