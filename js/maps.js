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

////////////////////////////////  Fetch & Event Map   ///////////////////////////////////////
// Layers for each category
const layers = {
  mountain: L.featureGroup().addTo(map),
  temple: L.featureGroup().addTo(map),
  landmark: L.featureGroup().addTo(map),
};

// Function to create custom icons with a white circle and shadow
function createCustomIcon(iconUrl) {
  return L.divIcon({
    className: "custom-icon-container",
    html: `
        <div class="circle-shadow"></div>
        <div class="circle"></div>
        <img src="${iconUrl}" alt="Icon" />
      `,
    iconSize: [25, 25],
    iconAnchor: [25, 25],
    popupAnchor: [0, 0],
  });
}

// Fetch Google Sheets CSV and add markers
const csvUrl =
  "https://docs.google.com/spreadsheets/d/e/2PACX-1vS-Ki8I2vTgE7XHpDq_rb1PemFcjOmD2atOKoPhrEyBKDeD3QS2Sl_jYDMExeo16A/pub?gid=870293102&single=true&output=csv";

Papa.parse(csvUrl, {
  download: true,
  header: true,
  complete: function (result) {
    const data = result.data;

    data.forEach((row) => {
      const no = row.No || "";
      const place = row.Place || "";
      const latitude = parseFloat(row.Latitude);
      const longitude = parseFloat(row.Longitude);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        // Determine the icon and category
        let iconUrl = "image/map/landmark.png";
        let category = "landmark";
        if (place.includes("เขา")) {
          iconUrl = "image/map/mountain.png";
          category = "mountain";
        } else if (place.includes("วัด")) {
          iconUrl = "image/map/temple.png";
          category = "temple";
        }

        // Create a marker with a custom icon
        const marker = L.marker([latitude, longitude], {
          icon: createCustomIcon(iconUrl),
        }).bindPopup(`<b>Place:</b> ${place}`);

        // Add marker to the appropriate category layer
        layers[category].addLayer(marker);
      }
    });
    // Adjust the map view to fit all markers
    const allBounds = L.featureGroup([
      layers.mountain,
      layers.temple,
      layers.landmark,
    ]);
    if (allBounds.getBounds().isValid()) {
      map.fitBounds(allBounds.getBounds());
    }
  },
  error: function (error) {
    console.error("Error fetching or parsing the CSV data:", error);
  },
});

// Add toggle functionality to switches
document.querySelectorAll(".menu-links .nav-link").forEach((link) => {
  const checkbox = link.querySelector("input[type='checkbox']");
  const text = link.querySelector(".nav-text").textContent;

  let layerKey = "";
  if (text.includes("ภูเขา")) layerKey = "mountain";
  if (text.includes("วัด")) layerKey = "temple";
  if (text.includes("สถานที่สำคัญ")) layerKey = "landmark";

  checkbox.checked = true; // Ensure all switches are initially on

  checkbox.addEventListener("change", () => {
    if (checkbox.checked) {
      layers[layerKey].addTo(map); // Add the layer to the map
    } else {
      map.removeLayer(layers[layerKey]); // Remove the layer from the map
    }
  });
});
////////////////////////////////  Fetch & Event Map   ///////////////////////////////////////
