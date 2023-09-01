const addressInput = document.getElementById('addressInput');
const searchButton = document.getElementById('searchButton');
const historyList = document.getElementById('historyList');
const mapDiv = document.getElementById('map');

let map;
let searchHistory = [];

function initMap(lat, lng) {
    if (map) {
        map.remove();
    }

    map = L.map(mapDiv).setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    L.marker([lat, lng]).addTo(map);
}

function updateHistoryList() {
    historyList.innerHTML = '';
    searchHistory.slice(0, 20).forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#'; // Set the link's href to '#' to prevent page reload
        link.textContent = item;
        link.addEventListener('click', () => {
            addressInput.value = item; // Set the input value to the clicked address
            searchButton.click(); // Trigger the search button click event
        });
        li.appendChild(link);
        historyList.appendChild(li);
    });
}

searchButton.addEventListener('click', () => {
    const address = addressInput.value;

    // Fetch latitude and longitude from geocoding API
    const apiUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address + ', Hamburg')}&format=json&limit=1`;

    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lng = parseFloat(data[0].lon);

                // Initialize the map using initMap
                initMap(lat, lng);

                // Add a custom icon for the address map
                const addressIcon = L.icon({
                    iconUrl: 'logo-ff-poeseldorf.png', // Path to your custom marker icon
                    iconSize: [48, 48],
                });

                L.marker([lat, lng], { icon: addressIcon }).addTo(map);

                // Fetch water hydrants using Overpass API
                const overpassApiUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["emergency"="fire_hydrant"](around:1000,${lat},${lng});out;`;

                fetch(overpassApiUrl)
                    .then(response => response.json())
                    .then(overpassData => {
                        // Process the returned water hydrant data here
                        console.log('Water hydrants:', overpassData);
                        // You can extract coordinates and display markers on the map
                        overpassData.elements.forEach(element => {
                            if (element.lat && element.lon) {
                                const marker = L.marker([element.lat, element.lon]);
                                marker.addTo(map); // Add marker to the map
                                // You can customize the marker's appearance or tooltip here
                            }
                        });
                    })
                    .catch(error => {
                        console.error('An error occurred:', error);
                    });

                // ... (rest of the code remains the same)
            } else {
                console.error('Geocoding API error: No results found');
                window.alert('Geocoding API error: No results found. Please try again with a valid Hamburg address!');
            }
        })
        .catch(error => {
            console.error('An error occurred:', error);
        });
});
