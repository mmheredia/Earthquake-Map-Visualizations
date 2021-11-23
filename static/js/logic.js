// Set url variable (Past 30 Days - All Earthquakes)

var earthquake_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson"; 

// Set initial map layer variable

var streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'});

// Set topographic layer

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'});

// Generate the map

var myMap = L.map("map", {

  center: [37.09, -95.71],

  zoom: 5,

  layers: [topo, streets]

});

// Generate map layers using variables set above

var baseMaps = {

  "Topographic Layer": topo,

  "Street Layer": streets
  
};


// Create layer to house earthquakes

let earthquakes = new L.LayerGroup();

d3.json(earthquake_url).then(function (data) {
  
  // Check data 
  
  console.log(data);

  // Create funstion to add earthquake markers that usues coordinates and magnitude to determine color/size

  function addMarkers(feature) {
  
    return {

    fillColor: markerColor(feature.geometry.coordinates[2]),

    color: "black",

    radius: Markersize(feature.properties.mag),

    stroke: true,

    opacity: 1,

    fillOpacity: 0.8,

    weight: 1.0

  };

}
  // Create function to set color of marker depending on earthquake depth using if statement

  function markerColor(depth) {
    
    var color = ""

    if (depth > -10 && depth < 10) {

      color = "#00FF00";

    }

    else if (depth >= 10 && depth < 30) {

      color = "#ADFF2F";

    }

    else if (depth >= 30 && depth < 50) {

      color = "#FFD700";

    }

    else if (depth >= 50 && depth < 70) {

      color = "#DAA520";

    }

    else if (depth >= 70 && depth < 90) {

      color = "#F08080";

    }

    else {

      color = "DC143C";
      
    };

    return color

  }
    
  // Create function to determine marker size based on earthquake magnitude

  function Markersize(mag) {

    return mag * 3.0;

  } 

  // Use pointToLayer to create circle markers

  L.geoJSON(data, {

    pointToLayer: function (feature, latlng) {

        return L.circleMarker(latlng);
        
    },

    // Add pop up feature to each marker to display earthquake info and use addMarkers function

    style: addMarkers,

    onEachFeature: function(feature,layer) {

      // List the place, time, magnitude, and depth of the selected earthquake

      layer.bindPopup(`<h3>${feature.properties.place}</h3><hr><p>${new Date(feature.properties.time)}</p><p>Magnitude: ${feature.properties.mag}</p><p>Depth: ${feature.geometry.coordinates[2]}</p>`);
    
    }
    
}).addTo(earthquakes);


// Create a layer for tectonic plates

let plates = new L.LayerGroup();

var plates_url = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"; 

let lineStyle = {

  color: "#FFFF00",

  weight: 3

}

d3.json(plates_url).then(function(data) {

  L.geoJson(data, {

    style: lineStyle

  }).addTo(plates);

});

// Define overlays 

var overlayMaps = {

  "Tectonic Plates": plates,

  "Earthquakes": earthquakes

};

L.control.layers(baseMaps, overlayMaps, {

  collapsed: false

}).addTo(myMap);

// Create and generate a legend 

var legend = L.control({position: 'bottomright'});

legend.onAdd = function () {

    // Use .create to create and append html element

    var div = L.DomUtil.create('div', 'legend'),

        grades = [-10, 10, 30, 50, 70, 90],

        labels = ["#00FF00", "#ADFF2F", "#FFD700", "#DAA520","#F08080","#DC143C"];

    for (var i = 0; i < grades.length; i++) {

        div.innerHTML +=

            '<i style="background:' + labels[i] + '"></i> ' +

            grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
    }

    return div;

};

legend.addTo(myMap);

});