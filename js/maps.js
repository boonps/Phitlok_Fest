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

// Function to create custom icons with a white circle and shadow
function createCustomIcon(iconUrl) {
  return L.divIcon({
    className: "custom-icon-container",
    html: `
        <div class="circle"></div>
        <img src="${iconUrl}" alt="Icon" />
      `,
    iconSize: [25, 25],
    iconAnchor: [25, 25],
    popupAnchor: [0, 0],
  });
}

// Add GeoJSON Layer with custom icons
const geojsonLayer = L.geoJSON(geojsonPlaces, {
  pointToLayer: function (feature, latlng) {
    let iconUrl = "image/map/landmark.png"; // Default icon
    if (feature.properties.place.includes("เขา")) {
      iconUrl = "image/map/mountain.png";
    } else if (feature.properties.place.includes("วัด")) {
      iconUrl = "image/map/temple.png";
    }

    return L.marker(latlng, { icon: createCustomIcon(iconUrl) });
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties?.place) {
      layer.bindPopup(`<b>Place:</b> ${feature.properties.place}`);
    }
  },
});

// Add GeoJSON Layer to the map
geojsonLayer.addTo(map);

// Adjust the map view to fit the GeoJSON layer
map.fitBounds(geojsonLayer.getBounds());
