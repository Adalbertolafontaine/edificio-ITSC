import L from "leaflet";
import edificaciones from "./edificaciones.json";
import datos_edificaciones from "./informacion.json";

const etiquetas = {
  computadoras: "Computadoras",
  compuradoras_dañadas: "Computadoras Dañadas",
  administrativo: "Empleados Administrativos",
  alulas: "Aulas",
  laboratorios: "Laboratorios",
  conserjes: "Conserjes",
};

const Mapa = () => {

  const map: L.Map = L.map("map", {
    center: [18.53422304, -69.80257606],
    maxBounds: [
      [18.53531662, -69.80128572],
      [18.53312946, -69.8038673512719],
    ],
    zoom: 18.2,
    zoomControl: false,
  });

  map.boxZoom.enable();
  map.dragging.disable();

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  const info = L.control();

  info.onAdd = function (map: L.Map) {
    map;
    this._div = L.DomUtil.create("div", "info");
    this.update();
    return this._div;
  };

  info.update = function (props) {
    let contents = "Pase el cursor sobre edificio";
    if (props) {
      let letra = props.Letra;
      contents = `<b>${props.Nombre}</b><br/>(${letra})`;
      
      if (datos_edificaciones[letra]) {
        for (const key in etiquetas) {
          if (Object.prototype.hasOwnProperty.call(etiquetas, key)) {
            let element = datos_edificaciones[letra][key];
            if (element) {
              if(key === 'laboratorios'){
                  element = element.length;
               }
              contents += `<br/>${element} ${etiquetas[key]}`;
            }
          }
        }
      }

      contents += `<br/>${props.niveles} Nivles`;
    }

    this._div.innerHTML = `<h4>Campus ITSC</h4>${contents}`;
  };

  info.addTo(map);

  // get color depending on population density value
  function getColor(d) {
    return d > 1000
      ? "#800026"
      : d > 500
      ? "#BD0026"
      : d > 200
      ? "#E31A1C"
      : d > 100
      ? "#FC4E2A"
      : d > 50
      ? "#FD8D3C"
      : d > 20
      ? "#FEB24C"
      : d > 10
      ? "#FED976"
      : "#FFEDA0";
  }

  function style(feature) {
    return {
      weight: 2,
      opacity: 1,
      color: "white",
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: "#FFEDA0",
    };
  }

  function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
      weight: 5,
      color: "#666",
      dashArray: "",
      fillOpacity: 0.7,
    });

    layer.bringToFront();

    info.update(layer.feature.properties);
  }

  const geojson = L.geoJson(edificaciones, {
    style,
    onEachFeature,
  }).addTo(map);

  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  // Función para mostrar los problemas en el panel de información
  function mostrarProblemas(letraEdificio, problemas) {
    const infoContainer = document.querySelector('.card-body');
  
    if (!infoContainer) {
      console.error("Contenedor de información no encontrado.");
      return;
    }
  
    let htmlContent = `<h5 class="card-title">Edificio ${letraEdificio}</h5>`;
    htmlContent += `<p>Problemas reportados en este edificio:</p>`;
  
    // Iterar sobre los problemas recibidos desde la API
    problemas.forEach(problema => {
      // Separar los problemas en caso de que estén separados por ;
      const listaProblemas = problema.tipoproblema.split(';').map(p => p.trim()).filter(p => p);
  
      htmlContent += `
        <div>
          <strong>Nivel:</strong> ${problema.nivel} <br/>
          <strong>Tipo:</strong> ${problema.tipoespacio} <br/>
          <strong>Área:</strong> ${problema.nombreespacio} <br/>
          <strong>Problemas:</strong> 
          <ul>
      `;
  
      // Iterar sobre los problemas y mostrarlos en una lista
      listaProblemas.forEach(p => {
        htmlContent += `<li>${p}</li>`;
      });
  
      htmlContent += `</ul></div><hr/>`;
    });
  
    // Actualizar el contenido del panel
    infoContainer.innerHTML = htmlContent;
  }

  // Variable para almacenar el edificio seleccionado
let edificioSeleccionado = null;

// Función para mantener visualmente el edificio seleccionado
function seleccionarEdificio(layer) {
  if (edificioSeleccionado) {
    // Restablece el estilo del edificio previamente seleccionado
    geojson.resetStyle(edificioSeleccionado);
  }

  // Aplica el estilo de "seleccionado" al nuevo edificio
  layer.setStyle({
    weight: 5,
    color: "#FF0000",           // Cambia el color del borde para el edificio seleccionado
    dashArray: '',
    fillOpacity: 0.7,
    fillColor: "#FFEDA0"        // Cambia el color de relleno del edificio seleccionado
  });

  // Almacena el edificio actualmente seleccionado
  edificioSeleccionado = layer;
}

function onEachFeature(feature, layer) {
  layer.on({
    mouseover: highlightFeature,
    mouseout: function(e) {
      // Solo restablece el estilo si el edificio no está seleccionado
      if (edificioSeleccionado !== e.target) {
        resetHighlight(e);
      }
    },
    click: function(e) {
      const letraEdificio = feature.properties.Letra;

      // Hacer fetch a la API
      fetch(`http://localhost:3000/api/edificios/${letraEdificio}`)
        .then(response => response.json())
        .then(data => {
          mostrarProblemas(letraEdificio, data);

          // Seleccionar visualmente el edificio en el mapa
          seleccionarEdificio(layer); // Mantener el edificio seleccionado
        })
        .catch(err => {
          console.error('Error al obtener los problemas:', err);
        });

      zoomToFeature(e); // Hacer zoom después de hacer clic
    }
  });
}

  map.attributionControl.addAttribution(
    '<a href="https://itsc.edu.do/">ITSC</a>'
  );
};

export { Mapa };