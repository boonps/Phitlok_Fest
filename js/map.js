// <!--============================================ START : Context Menu in Map ===================================================--> //
function CopyCoordinates(e) {
    const coordinates = `${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`; // Format coordinates
    navigator.clipboard
        .writeText(coordinates) // Copy formatted coordinates
        .then(() => showBootstrapAlert(`Copied to clipboard: ${coordinates}`)) // Show Bootstrap alert on success
        .catch((err) => console.error("Failed to copy text: ", err)); // Handle errors
}

function centerMap(e) {
    map.panTo(e.latlng);
}

function zoomIn(e) {
    map.zoomIn();
}

function zoomOut(e) {
    map.zoomOut();
}

function showBootstrapAlert(message) {
    // Create the alert HTML
    const alertHTML = `
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <strong>Notification:</strong> ${message}
      <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  `;

    // Get the container element
    const container = document.querySelector(".alert-container");

    // Insert the alert HTML into the container
    container.innerHTML = alertHTML;

    // Optional: Automatically remove the alert after a delay
    setTimeout(() => {
        const alertElement = document.querySelector(".alert");
        if (alertElement) {
            $(alertElement).fadeOut(600, function() {
                // Use jQuery's fadeOut for smooth effect
                $(this).alert("close"); // Then close the alert
            });
        }
    }, 5000); // Adjust the delay as needed
}

// <!--============================================ END : Context Menu in Map ===================================================--> //

// <!--============================================ START : MAP ===================================================--> //
const map = L.map("map", {
    contextmenu: true,
    contextmenuWidth: 140,
    contextmenuItems: [{
            text: "Copy coordinates",
            callback: CopyCoordinates,
        },
        {
            text: "Center map here",
            callback: centerMap,
        },
        "-",
        {
            text: "Zoom in",
            icon: "js/plugins/Leaflet.contextmenu/src/images/zoom-in.png",
            callback: zoomIn,
        },
        {
            text: "Zoom out",
            icon: "js/plugins/Leaflet.contextmenu/src/images/zoom-out.png",
            callback: zoomOut,
        },
    ],
}).setView([17.15092976291246, 100.83179957549375], 13);

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



// <!--============================================ START : Side Bar Add ===================================================--> //
let sidebar = L.control.sidebar("sidebar", {
    position: "left",
});

map.addControl(sidebar);
// <!--============================================ END : Side Bar Add===================================================--> //

// <!--============================================ START : Event Setting Side Bar ===================================================--> //
let isSidebarVisible = false;

document.addEventListener("DOMContentLoaded", function() {
    // Check if the screen width is larger than 768px
    const isLargerScreen = window.matchMedia("(min-width: 769px)").matches;

    if (isLargerScreen) {
        // Automatically show the sidebar after 1.5 seconds on larger screens
        // setTimeout(function () {
        sidebar.show(); // Ensure this function is defined properly
        isSidebarVisible = true;
        // }, 1500);
    }
});

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
// Define map elements
const bangkokCircle = L.circle([17.15092976291246, 100.83179957549375], {
        color: "red",
        fillColor: "#f03",
        fillOpacity: 0.5,
        radius: 500,
    })
    // .addTo(map)
    .bindPopup("I am Bangkok circle.");

const phitsanulokPolygon = L.polygon([
        [16.8132, 100.2634],
        [16.8212, 100.272],
        [16.832, 100.284],
    ])
    // .addTo(map)
    .bindPopup("I am Phitsanulok polygon.");

const chiangMaiPolygon = L.polygon([
        [18.7883, 98.9853],
        [18.7818, 98.9912],
        [18.79, 99.0063],
    ])
    // .addTo(map)
    .bindPopup("I am Chiang Mai polygon.");



const phuketMarker = L.marker([17.101597995325857, 100.83758760601316])
    .addTo(map)
    .bindPopup("<b>Hello อำเภอนครไทย!</b><br />I am a popup.")
    .openPopup();

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

// Attach event listeners to switches
document
    .getElementById("cbx-bangkok")
    .addEventListener("change", (e) =>
        onSwitchToggle(e, bangkokCircle, "circle")
    );
document
    .getElementById("cbx-phitsanulok")
    .addEventListener("change", (e) =>
        onSwitchToggle(e, phitsanulokPolygon, "polygon")
    );
document
    .getElementById("cbx-chiangmai")
    .addEventListener("change", (e) =>
        onSwitchToggle(e, chiangMaiPolygon, "polygon")
    );

document
    .getElementById("cbx-phuket")
    .addEventListener("change", (e) => onSwitchToggle(e, phuketMarker, "marker"));

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

// Add click events to layers
addClickEventToLayer(bangkokCircle);
addClickEventToLayer(chiangMaiPolygon);
addClickEventToLayer(phitsanulokPolygon);
addClickEventToLayer(phuketMarker);

// <!--============================================ END : Layer in Map ===================================================--> //