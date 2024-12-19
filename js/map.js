// <!--============================================ START : MAP ===================================================--> //
const map = L.map("map", {}).setView(
    [17.15092976291246, 100.83179957549375],
    13
);
// <!--============================================ END : MAP ===================================================--> //

// <!--============================================ START : Scale Bar ===================================================--> //
L.control
    .scale({
        position: "bottomleft",
    })
    .addTo(map);
// <!--============================================ END : Scale Bar ===================================================--> //

// <!--============================================ START : Base Map Switch ===================================================--> //
new L.basemapsSwitcher(
    [{
            layer: L.tileLayer("http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map), //DEFAULT MAP
            icon: "/images/map/osm.png",
            name: "OSM Map",
        },
        {
            layer: L.tileLayer(
                "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
                    attribution: "Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",
                }
            ),
            icon: "/images/map/gray.png",
            name: "Gray Map",
        },
        {
            layer: L.tileLayer("https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}", {
                attribution: "Map data: &copy; Google Map",
            }),
            icon: "/images/map/satt.png",
            name: "Satellite",
        },
    ], { position: "bottomleft" }
).addTo(map);
// <!--============================================ END : Base Map Switch ===================================================--> //
////////////////////////////////  Fetch & Event Map   ///////////////////////////////////////
// Layers for each category
const layers = {
    mountain: L.featureGroup().addTo(map),
    temple: L.featureGroup().addTo(map),
    landmark: L.featureGroup().addTo(map),
};

// <!--============================================ START : Side Bar Add ===================================================--> //
let sidebar = L.control.sidebar("sidebar", {
    position: "left",
});

map.addControl(sidebar);
// <!--============================================ END : Side Bar Add===================================================--> //

// <!--============================================ START : Event Setting Side Bar ===================================================--> //
let isSidebarVisible = false;

// Select the button using its class
const settingButton = document.querySelector(".setting-btn");

// Select the close button
const closeButton = document.querySelector(".leaflet-sidebar .close");

// Add event listener to the close button
if (closeButton) {
    closeButton.addEventListener("click", function() {
        sidebar.hide(); // Ensure this function is defined properly
        isSidebarVisible = false; // Set the visibility state to false when the sidebar is closed
        flyToAllLayers(map);
    });
}

// Toggle sidebar visibility
settingButton.addEventListener("click", function() {
    if (isSidebarVisible) {
        sidebar.hide();
        flyToAllLayers(map);
    } else {
        sidebar.show();
    }

    // Toggle the state
    isSidebarVisible = !isSidebarVisible;
});

function flyToAllLayers(map) {
    // Create a bounds object to keep track of all layer bounds
    const bounds = L.latLngBounds();

    // Iterate over each layer in the map
    map.eachLayer((layer) => {
        // Check if the layer has a `getBounds` method (like polygons or circles)
        if (layer.getBounds) {
            bounds.extend(layer.getBounds());
        }
        // Check if the layer is a marker, which has a `getLatLng` method
        else if (layer.getLatLng) {
            bounds.extend(layer.getLatLng());
        }
    });

    // Calculate the center and the zoom level from the combined bounds
    if (bounds.isValid()) {
        const center = bounds.getCenter(); // Get the center of the bounds
        const zoom = map.getBoundsZoom(bounds); // Get the optimal zoom level to fit bounds

        // Fly to the calculated center with the optimal zoom level
        map.flyTo(center, zoom, { animate: true, duration: 2 }); // Adjust duration as needed
    } else {
        console.log("No valid layers found to fly to.");
    }
}

// <!--============================================ END : Event Setting Side Bar ===================================================--> //

// <!--============================================ START : Accordion Side Bar ===================================================--> //
$(function() {
    var Accordion = function(el, multiple) {
        this.el = el || {};
        this.multiple = multiple || false;

        var links = this.el.find(".link");

        links.on("click", { el: this.el, multiple: this.multiple }, this.dropdown);
    };

    Accordion.prototype.dropdown = function(e) {
        var $el = e.data.el;
        ($this = $(this)), ($next = $this.next());

        $next.slideToggle();
        $this.parent().toggleClass("open");

        if (!e.data.multiple) {
            $el.find(".submenu").not($next).slideUp().parent().removeClass("open");
        }
    };

    var accordion = new Accordion($("#accordion"), false);
});
// <!--============================================ END : Accordion Side Bar ===================================================--> //

// <!--============================================ START : Layer in Map ===================================================--> //
// General function to handle switch toggles
function onSwitchToggle(e, layer, type) {
    if (e.target.checked) {
        layer.addTo(map);
        if (type === "marker") {
            map.flyTo(layer.getLatLng(), 13, { duration: 0.5 });
        } else {
            map.flyToBounds(layer.getBounds(), { padding: [50, 50] });
        }
    } else {
        map.removeLayer(layer);
    }
}

// Function to add click event listener to a layer
function addClickEventToLayer(layer) {
    layer.on("click", function(e) {
        const bounds = layer.getBounds ?
            layer.getBounds() :
            L.latLngBounds(layer.getLatLng(), layer.getLatLng());

        // Fly to the layer's bounds or position
        map.flyToBounds(bounds, { padding: [50, 50], animate: true, duration: 2 });
    });
}
// <!--============================================ END : Layer in Map ===================================================--> //

// <!--============================================ START : Fetch & Event Map ===================================================--> //
// Function to create custom icons
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
    complete: function(result) {
        const data = result.data;

        data.forEach((row) => {
            const place = row.Place || "";
            const detail = row.Detail || "";
            const latitude = parseFloat(row.Latitude);
            const longitude = parseFloat(row.Longitude);

            if (!isNaN(latitude) && !isNaN(longitude)) {
                // Determine the icon and category
                let iconUrl = "/images/map/landmark.png";
                let category = "landmark";
                if (place.includes("เขา")) {
                    iconUrl = "/images/map/mountain.png";
                    category = "mountain";
                } else if (place.includes("วัด")) {
                    iconUrl = "/images/map/temple.png";
                    category = "temple";
                }

                // Create a marker with a custom icon
                const marker = L.marker([latitude, longitude], {
                    icon: createCustomIcon(iconUrl),
                }).bindPopup(`<b>Place:</b> ${place}</br><b>Dtail:</b> ${detail}`);

                // Add marker to the appropriate category layer
                layers[category].addLayer(marker);
            }
        });

        // Adjust map view to fit all markers
        const allBounds = L.featureGroup([
            layers.mountain,
            layers.temple,
            layers.landmark,
        ]);
        if (allBounds.getBounds().isValid()) {
            map.fitBounds(allBounds.getBounds());
        }
    },
    error: function(error) {
        console.error("Error fetching or parsing the CSV data:", error);
    },
});

// Attach event listeners to switches
document.getElementById("cbx-mountain").addEventListener("change", (e) => {
    if (e.target.checked) {
        layers.mountain.addTo(map);
    } else {
        map.removeLayer(layers.mountain);
    }
});

document.getElementById("cbx-temple").addEventListener("change", (e) => {
    if (e.target.checked) {
        layers.temple.addTo(map);
    } else {
        map.removeLayer(layers.temple);
    }
});

document.getElementById("cbx-landmark").addEventListener("change", (e) => {
    if (e.target.checked) {
        layers.landmark.addTo(map);
    } else {
        map.removeLayer(layers.landmark);
    }
});

// Ensure all layers are initially added, and checkboxes are checked
document.getElementById("cbx-mountain").checked = true;
document.getElementById("cbx-temple").checked = true;
document.getElementById("cbx-landmark").checked = true;

layers.mountain.addTo(map);
layers.temple.addTo(map);
layers.landmark.addTo(map);
// <!--============================================ END : Fetch & Event Map ===================================================--> //