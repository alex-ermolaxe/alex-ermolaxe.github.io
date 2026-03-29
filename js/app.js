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

const modalOverlay = document.getElementById("modalOverlay");
const modalClose   = document.getElementById("modalClose");
const modalBody    = document.getElementById("modalBody");
const listBtn      = document.getElementById("listBtn");

function openModal(cities) {
    const sorted = [...cities].sort(function (a, b) {
        return extractYear(a.date) - extractYear(b.date);
    });

    const groups = {};
    sorted.forEach(function (city) {
        const year = extractYear(city.date);
        if (!groups[year]) groups[year] = [];
        groups[year].push(city);
    });

    let html = "";
    Object.keys(groups).forEach(function (year) {
        html += `<div class="year-group">
                    <div class="year-label">${year}</div>`;

        groups[year].forEach(function (city) {
            html += `
                <a class="city-row" href="${city.link}" target="_blank" rel="noopener noreferrer">
                    <img
                        class="city-row-img"
                        src="${city.icon}"
                        alt="${city.name}"
                        onerror="this.src='https://via.placeholder.com/40?text=📷'"
                    />
                    <div class="city-row-info">
                        <span class="city-row-name">${city.name} ↗</span>
                        <span class="city-row-date">${city.date}</span>
                    </div>
                </a>`;
        });

        html += `</div>`;
    });

    modalBody.innerHTML = html;
    modalOverlay.classList.add("active");
}

function closeModal() {
    modalOverlay.classList.remove("active");
}

function extractYear(dateStr) {
    const match = dateStr.match(/\d{4}/);
    return match ? parseInt(match[0]) : 0;
}

modalClose.addEventListener("click", closeModal);

modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeModal();
});

document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeModal();
});

let citiesData = [];

fetch("resources/cities.json")
    .then(function (response) {
        return response.json();
    })
    .then(function (cities) {
        citiesData = cities;

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

        listBtn.addEventListener("click", function () {
            openModal(citiesData);
        });
    })
    .catch(function (error) {
        console.error("Failed to load cities.json:", error);
    });