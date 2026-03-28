const map = L.map("map", {
    center: [30, 0],
    zoom: 3,
    minZoom: 2,
    maxZoom: 18
});

L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
    {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> ' +
            '&copy; <a href="https://carto.com/">CARTO</a>',
        subdomains: "abcd"
    }
).addTo(map);

window.addEventListener("load", function () {
    map.invalidateSize();
});

function createPopupContent(city) {
    return `
        <div class="city-popup">
            <div class="popup-header">
                <img
                    class="popup-icon"
                    src="${city.icon}"
                    alt="${city.name}"
                    onerror="this.src='https://via.placeholder.com/48?text=📷'"
                />
                <div class="popup-info">
                    <span class="popup-date">${city.date}</span>
                    <a
                        class="popup-city-name"
                        href="${city.link}"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        ${city.name} ↗
                    </a>
                </div>
            </div>
        </div>
    `;
}


fetch("resources/cities.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (cities) {
        cities.forEach(function (city) {
            const markerIcon = L.divIcon({
                className: "custom-marker",
                iconSize: [18, 18],
                iconAnchor: [9, 9],
                popupAnchor: [0, -12]
            });

            const marker = L.marker(city.coords, { icon: markerIcon }).addTo(map);

            marker.bindPopup(createPopupContent(city), {
                closeButton: false,
                offset: [0, -4]
            });

            marker.on("mouseover", function () {
                this.openPopup();
            });

            marker.on("mouseout", function () {
                const self = this;
                setTimeout(function () {
                    const popupEl = self.getPopup().getElement();
                    if (popupEl && !popupEl.matches(":hover")) {
                        self.closePopup();
                    }
                }, 300);
            });
        });
    })
    .catch(function (error) {
        console.error("Failed to load cities.json:", error);
    });