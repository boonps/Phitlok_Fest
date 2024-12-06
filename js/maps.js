const map = L.map("map").setView([17.15092976291246, 100.83179957549375], 13);

const tiles = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
}).addTo(map);

function onMapClick(e) {
  popup
    .setLatLng(e.latlng)
    .setContent(`You clicked the map at ${e.latlng.toString()}`)
    .openOn(map);
}

map.on("click", onMapClick);

// Add GeoJSON Layer
const geojsonLayer = L.geoJSON(geojsonPlaces, {
  onEachFeature: function (feature, layer) {
    if (feature.properties && feature.properties.place) {
      layer.bindPopup(`<b>Place:</b> ${feature.properties.place}`);
    }
  },
});

// Add GeoJSON Layer to the map
geojsonLayer.addTo(map);

// Adjust the map view to fit the GeoJSON layer
map.fitBounds(geojsonLayer.getBounds());
