// Create the 'street' tile layer as a second background of the map
let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// Create the 'basemap' and 'overlaymap' tile layers that will be used in our map.
let baseMap = {
  "Street Map": street
};

let layers = {
  earthquakes: new L.LayerGroup(),
  tecPlates: new L.LayerGroup()
};

let overlayMaps = {
  "Earthquakes": layers.earthquakes,
  "Tectonic Plates": layers.tecPlates
};

// Create the map object with center and zoom options.
let myMap = L.map("map", {
  center: [40.00, -100.00],
  zoom: 4,
  layers: [street, layers.earthquakes, layers.tecPlates]
});

// Add a control to the map that will allow the user to change which layers are visible.
L.control.layers(baseMap, overlayMaps, {
  collapsed: false
}).addTo(myMap);

// Make a request that retrieves the earthquake geoJSON data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function (data) {

  // This function returns the style data for each of the earthquakes we plot on
  // the map. Pass the magnitude and depth of the earthquake into two separate functions
  // to calculate the color and radius.
  function styleInfo(feature) {
    return {
        stroke: true,
        fillOpacity: 1,
        color: "black",
        fillColor: getColor(feature.geometry.coordinates[2]),
        radius: getRadius(feature.properties.mag)
    };
  }

  // This function determines the color of the marker based on the depth of the earthquake.
  function getColor(depth) {
    if (depth < 10 && depth >= -10) return "green";
    else if (depth < 30 && depth >= 10) return "greenyellow";
    else if (depth < 50 && depth >= 30) return "yellow";
    else if (depth < 70 && depth >= 50) return "orange";
    else if (depth < 90 && depth >= 70) return "orangered";
    else return "red";
  }

  // This function determines the radius of the earthquake marker based on its magnitude.
  function getRadius(magnitude) {
    return Math.sqrt(magnitude) * 10;
  }

  // Add a GeoJSON layer to the map once the file is loaded.
  L.geoJson(data, {

    // Turn each feature into a circleMarker on the map.
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng);
    },

    // Set the style for each circleMarker using our styleInfo function.
    style: styleInfo,

    // Create a popup for each marker to display the magnitude and location of the earthquake after the marker has been created and styled
    onEachFeature: function (feature, layer) {
        layer.bindPopup("<h3>(M)agnitude - Location:<br>" + feature.properties.title + "<br><h3>Depth:<br>" + feature.geometry.coordinates[2]);
    }
  }).addTo(layers.earthquakes)

    // Create a legend control object.
    let legend = L.control({
      position: "bottomright"
  });

    // Then add all the details for the legend
    legend.onAdd = function () {
      let div = L.DomUtil.create("div", "info legend");

      // Initialize depth intervals and colors for the legend
      let depths = [-10, 10, 30, 50, 70, 90];
      let colors = ["green", "greenyellow", "yellow", "orange", "orangered", "red"];

      // Loop through our depth intervals to generate a label with a colored square for each interval.
      for (let i = 0; i < depths.length; i++) {
          div.innerHTML +=
              "<i style='background:" + colors[i] + "'></i> " +
              depths[i] + (depths[i + 1] ? "&ndash;" + depths[i + 1] + "<br>" : "+");
      }

      return div;
  };

    // Add legend to map.
    legend.addTo(myMap);

  // Make a request to get our Tectonic Plate geoJSON data.
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function (plate_data) {
    // Save the geoJSON data, along with style information, to the tectonic_plates layer.
    let tecPlateData = L.geoJson(plate_data, {
      style: function(feature) {
        return {
          color: "orange",
          fillColor: "orange",
          FillOpacity: 1,
          weight: 1.5
        };
      }
    }).addTo(layers.tecPlates);
  });
});
