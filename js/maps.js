const map = L.map("map").setView([17.15092976291246, 100.83179957549375], 13);

////////////////////////////////  Switch BaseMap   ///////////////////////////////////////
new L.basemapsSwitcher(
  [
    {
      layer: L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map), //DEFAULT MAP
      icon: "./image/map/osm.png",
      name: "OSM Map",
    },
    {
      layer: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
        }
      ),
      icon: "./image/map/gray.png",
      name: "Gray Map",
    },
    {
      layer: L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
        attribution: "Map data: &copy; Google Map",
      }),
      icon: "./image/map/satt.png",
      name: "Satellite",
    },
  ],
  { position: "bottomleft" }
).addTo(map);
////////////////////////////////  Switch BaseMap   ///////////////////////////////////////

// function onMapClick(e) {
//   popup
//     .setLatLng(e.latlng)
//     .setContent(`You clicked the map at ${e.latlng.toString()}`)
//     .openOn(map);
// }

// map.on("click", onMapClick);

// Define custom icons
const icons = {
  mountain: L.icon({
    iconUrl: "./image/map/mountain.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  temple: L.icon({
    iconUrl: "./image/map/temple.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
  landmark: L.icon({
    iconUrl: "./image/map/landmark.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  }),
};

// Add GeoJSON Layer with custom icons
const geojsonLayer = L.geoJSON(geojsonPlaces, {
  pointToLayer: function (feature, latlng) {
    let icon = icons.landmark; // Default icon
    if (feature.properties.place.includes("เขา")) {
      icon = icons.mountain;
    } else if (feature.properties.place.includes("วัด")) {
      icon = icons.temple;
    }

    return L.marker(latlng, { icon });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties?.place) {
      layer.bindPopup(`<b>ชื่อสถานที่:</b> ${feature.properties.place}`);
    }
  },
});

// Add GeoJSON Layer to the map
geojsonLayer.addTo(map);

// Adjust the map view to fit the GeoJSON layer
map.fitBounds(geojsonLayer.getBounds());
