let originMarker = null;
let destinationMarker = null;
let routeControl = null;
let busMarker = null;
let routeCoordinates = [];
let stopMarkers = [];
let stopCoordinates = [];

const map = L.map('map').setView([25.5937, 78.9629], 5);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    zoomDelta: 0.25,
    zoomSnap: 0,
    attribution: '© OpenStreetMap'
}).addTo(map);


const greenIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const redIcon = L.icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

const busIcon = L.icon({
    iconUrl: './bus.png',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});


const busStopIcon = L.icon({
    iconUrl: './assets/bus-stop.png', 
    iconSize: [25, 25],
    iconAnchor: [12, 12],
    popupAnchor: [0, -10]
});


map.on('click', async (e) => {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (!originMarker) {
        originMarker = L.marker([lat, lng], { icon: greenIcon }).addTo(map)
            .bindPopup('Origin Point').openPopup();
       // alert('Origin point set! Now click to set the destination point.');

        const originAddress = await reverseGeocode(lat, lng);
        if (originAddress) {
            console.log("Origin Address:", originAddress);
            alert(`Origin set at: ${originAddress}`);
        } else {
            alert("Could not fetch origin address.");
        }
    } else if (!destinationMarker) {
        destinationMarker = L.marker([lat, lng], { icon: redIcon }).addTo(map)
            .bindPopup('Destination Point').openPopup();
       // alert('Destination point set! Now click "Create Route" to calculate the route.');

        const destinationAddress = await reverseGeocode(lat, lng);
        if (destinationAddress) {
            console.log("Destination Address:", destinationAddress);
            alert(`Destination set at: ${destinationAddress}`);
        } else {
            alert("Could not fetch destination address.");
        }
    } else {
        
        const stopMarker = L.marker([lat, lng], { icon: busStopIcon }).addTo(map)
            .bindPopup(`Stop ${stopMarkers.length + 1}`).openPopup();
        stopMarkers.push(stopMarker);
        stopCoordinates.push(L.latLng(lat, lng));
      //  alert(`Stop ${stopMarkers.length} added!`);

      const stopAddress = await reverseGeocode(lat, lng);
        if (stopAddress) {
            console.log("Stop Address:", stopAddress);
            alert(`Stop ${stopMarkers.length} added at: ${stopAddress}`);
        } else {
            alert("Could not fetch stop address.");
        }

        updateBusStopsList();
    }
});

document.getElementById("search-location-btn").onclick = async () => {
    const location = document.getElementById("search-location").value;
    if (!location) {
        alert("Please enter a location.");
        return;
    }

    try {
        const response = await axios.get(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location)}`);
        console.log(response)
        if (response.data.length > 0) {
            const { lat, lon } = response.data[0];
            map.setView([lat, lon], 15);
            L.popup()
                .setLatLng([lat, lon])
                .setContent(`<b>Location:</b> ${location}<br>Lat: ${lat}, Lng: ${lon}`)
                .openOn(map);
        } else {
            alert("Location not found. Please try again.");
        }
    } catch (error) {
        console.error(error);
        alert("Error fetching location. Please try again later.");
    }
};


function createRoute() {

    if (!originMarker || !destinationMarker) {
        alert('Please set both origin and destination points on the map.');
        return;
    }
    if (routeControl) {
        map.removeControl(routeControl);
    }
    
    const originLatLng = originMarker.getLatLng();
    const destinationLatLng = destinationMarker.getLatLng();
    const sortedStops = sortStops(originLatLng, [...stopCoordinates], destinationLatLng);
    const waypoints = [
        originLatLng,
        ...sortedStops,
        destinationLatLng
    ];
    routeControl = L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        showAlternatives: false,
        altLineOptions: { styles: [{ color: 'blue', opacity: 0.7, weight: 4 }] },
    }).addTo(map);

    routeControl.on('routesfound', function (e) {
        const routes = e.routes;
        routeCoordinates = routes[0].coordinates;
        alert('Route created! You can now simulate the bus movement.');
        console.log("Route : ", routeCoordinates);

        if (!busMarker) {
            busMarker = L.marker(routeCoordinates[0], { icon: busIcon }).addTo(map);
        }
    });
}


function clearMarkers() {
    if (originMarker) {
        map.removeLayer(originMarker);
        originMarker = null;
    }
    if (destinationMarker) {
        map.removeLayer(destinationMarker);
        destinationMarker = null;
    }
    if (routeControl) {
        map.removeControl(routeControl);
        routeControl = null;
    }
    if (busMarker) {
        map.removeLayer(busMarker);
        busMarker = null;
    }

    stopMarkers.forEach(marker => map.removeLayer(marker));
    stopMarkers = [];
    stopCoordinates = [];
    routeCoordinates = [];
    alert('Markers cleared! You can set new origin and destination points.');
}


async function reverseGeocode(lat, lng) {
    try {
        const response = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const address = response.data.display_name;
        return address;
    } catch (error) {
        console.error("Error fetching address:", error);
        return null;
    }
}


function moveBus() {
    if (routeCoordinates.length === 0) {
        alert('No route found! Please create a route first.');
        return;
    }
    let index = 0;
    function animateBus() {
        if (index < routeCoordinates.length) {
            const currentCoord = routeCoordinates[index];
            busMarker.setLatLng(currentCoord);
            map.setView(currentCoord, map.getZoom());
            const isBusStop = stopCoordinates.some(stop =>
                stop.lat.toFixed(5) === currentCoord.lat.toFixed(5) &&
                stop.lng.toFixed(5) === currentCoord.lng.toFixed(5)
            );
            if (isBusStop) {
                console.log(`Bus stopping at: ${currentCoord.lat}, ${currentCoord.lng}`);
                setTimeout(() => {
                    index++;
                    animateBus();
                }, 3000);
            } else {
                index++;
                setTimeout(animateBus, 1000);
            }
        } else {
            alert('Bus has reached its destination!');
        }
    }
    animateBus();
}


function removeBusStop(stop) {
    const markerIndex = stopMarkers.findIndex(marker => marker.getLatLng().equals(stop));
    if (markerIndex !== -1) {
        map.removeLayer(stopMarkers[markerIndex]);
        stopMarkers.splice(markerIndex, 1);
    }
    const coordIndex = stopCoordinates.findIndex(coord => coord.equals(stop));
    if (coordIndex !== -1) {
        stopCoordinates.splice(coordIndex, 1);
    }
    updateBusStopsList();
}

function updateBusStopsList() {
    const busStopsList = document.getElementById('bus-stops-list');
    busStopsList.innerHTML = '';
    stopCoordinates.forEach(async (stop, index) => {
        let add = await reverseGeocode(stop.lat.toFixed(5), stop.lng.toFixed(5))
        const li = document.createElement('li');
        li.className = 'fade-in';
        li.innerHTML = `
            <span>Stop ${index + 1}: ${add}</span>
            <button onclick="removeBusStop(L.latLng(${stop.lat}, ${stop.lng}))">Remove</button>
        `;
        busStopsList.appendChild(li);
    });
}


function sortStops(origin, stops, destination) {
    const sortedStops = [];
    let currentLocation = origin;
    while (stops.length > 0) {
        let nearestStop = stops[0];
        let nearestDistance = currentLocation.distanceTo(nearestStop);

        for (let i = 1; i < stops.length; i++) {
            const distance = currentLocation.distanceTo(stops[i]);
            if (distance < nearestDistance) {
                nearestStop = stops[i];
                nearestDistance = distance;
            }
        }
        sortedStops.push(nearestStop);
        currentLocation = nearestStop;
        stops = stops.filter(stop => !stop.equals(nearestStop));
    }

    return sortedStops;
}


async function saveRoute() {
    if (!originMarker || !destinationMarker || stopCoordinates.length === 0) {
        alert('Please create a route with at least one stop before saving.');
        return;
    }

    const routeData = {
        routeId: `RT${Math.floor(Math.random() * 1000)}`,
        origin: {
            coordinates: {
                lat: originMarker.getLatLng().lat,
                lng: originMarker.getLatLng().lng
            },
            address: await reverseGeocode(originMarker.getLatLng().lat, originMarker.getLatLng().lng)
        },
        destination: {
            coordinates: {
                lat: destinationMarker.getLatLng().lat,
                lng: destinationMarker.getLatLng().lng
            },
            address: await reverseGeocode(destinationMarker.getLatLng().lat, destinationMarker.getLatLng().lng)
        },
        stops: await Promise.all(stopCoordinates.map(async (stop, index) => ({
            stopId: `S${index + 1}`,
            coordinates: {
                lat: stop.lat,
                lng: stop.lng
            },
            address: await reverseGeocode(stop.lat, stop.lng),
            sequence: index + 1
        }))),
        bus: {
            busId: "B001",
            regNumber: "MY01AB1234"
        },
        pickupTime: "07:30 AM",
        dropTime: "08:30 AM"
    };

    try {
        const response = await axios.post('/admin/addRoute', routeData);
        if (response.status === 201) {
            alert('Route saved successfully!');
            console.log('Route Data:', response.data);
        }
    } catch (error) {
        console.error('Error saving route:', error);
        alert('Failed to save route. Please try again.');
    }
}