import "leaflet";
import edificaciones from "./edificaciones.json";
import datos_edificaciones from "./informacion.json";

declare let L: any;

const etiquetas = {
  computadoras: "Computadoras",
  compuradoras_dañadas: "Computadoras Dañadas",
  administrativo: "Empleados Administrativos",
  alulas: "Aulas",
  laboratorios: "Laboratorios",
  conserjes: "Conserjes",
};

const Mapa = () => {
  // Inicializar el mapa
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

  // Control de información
  const info = L.control();

  info.onAdd = function (map: L.Map) {
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
              if (key === "laboratorios") {
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
  // Función de estilo de las capas
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

  // Resalta un edificio al pasar el mouse
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

  // Restablece el estilo original
  function resetHighlight(e) {
    geojson.resetStyle(e.target);
    info.update();
  }

  // Zoom al edificio seleccionado
  function zoomToFeature(e) {
    map.fitBounds(e.target.getBounds());
  }

  // Función para mostrar los problemas en el panel de información
  function mostrarProblemas(letraEdificio, problemas) {
    const infoContainer = document.querySelector(".card-body");

    if (!infoContainer) {
      console.error("Contenedor de información no encontrado.");
      return;
    }

    let htmlContent = `<h5 class="card-title">Edificio ${letraEdificio}</h5>`;
    htmlContent += `<p>Problemas reportados en este edificio:</p>`;

    // Iterar sobre los problemas recibidos desde la API
    problemas.forEach((problema) => {
      const listaProblemas = problema.tipoproblema
        .split(";")
        .map((p) => p.trim())
        .filter((p) => p);

      htmlContent += `
        <div>
          <strong>Nivel:</strong> ${problema.nivel} <br/>
          <strong>Tipo:</strong> ${problema.tipoespacio} <br/>
          <strong>Área:</strong> ${problema.nombreespacio} <br/>
          <strong>Problemas:</strong>
          <ul>
      `;

      // Iterar sobre los problemas y mostrarlos en una lista
      listaProblemas.forEach((p) => {
        htmlContent += `<li>${p}</li>`;
      });
      htmlContent += `</ul></div><hr/>`;
    });

    // Actualizar el contenido del panel
    infoContainer.innerHTML = htmlContent;
  }

  // Variable para almacenar el edificio seleccionado
  let edificioSeleccionado: any = null;

  // Función para seleccionar el edificio
  function seleccionarEdificio(layer: any) {
    if (edificioSeleccionado) {
      geojson.resetStyle(edificioSeleccionado); // Restablece el estilo del edificio seleccionado previamente
    }

    // Aplica el estilo de "seleccionado" al nuevo edificio
    layer.setStyle({
      weight: 5,
      color: "#FF0000", // Borde rojo para el edificio seleccionado
      dashArray: "",
      fillOpacity: 0.7,
      fillColor: "#FFEDA0", // Relleno claro
    });

    // Almacenar el edificio seleccionado actualmente
    edificioSeleccionado = layer;
  }
  // Asignar eventos para cada edificio
  function onEachFeature(feature, layer) {
    layer.on({
      mouseover: highlightFeature,
      mouseout: function (e) {
        if (edificioSeleccionado !== e.target) {
          resetHighlight(e); // Restablecer solo si no está seleccionado
        }
      },
      click: function (e) {
        const letraEdificio = feature.properties.Letra;

        // Hacer fetch a la API
        fetch(`https://inframap.itsc.edu.do/api/edificios/${letraEdificio}`)
          .then((response) => {
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
          })
          .then((data) => {
            mostrarProblemas(letraEdificio, data);
            seleccionarEdificio(layer); // Mantener el edificio seleccionado visualmente
          })
          .catch((err) => {
            console.error("Error al obtener los problemas:", err);
          });

        zoomToFeature(e); // Zoom al edificio seleccionado
      },
    });
  }
  // Crear el GeoJSON para los edificios
  const geojson = L.geoJson(edificaciones, {
    style,
    onEachFeature: onEachFeature,
  }).addTo(map);

  // Agregar la atribución del mapa
  map.attributionControl.addAttribution(
    '<a href="https://itsc.edu.do/">ITSC</a>'
  );
};

export { Mapa };