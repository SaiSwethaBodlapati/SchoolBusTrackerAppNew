
var students = [], routes = [], drivers = [];

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('addDriverForm');
    const tableBody = document.querySelector('#driversTable tbody');

    async function fetchDrivers() {
        try {
            const response = await fetch('/admin/drivers');
            if (response.ok) {
                let result = await response.json();
                drivers = result.drivers;
                renderDrivers();
            } else {
                console.error('Failed to fetch drivers.');
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }

    async function fetchRoutes() {
        try {
            const response = await fetch('/admin/getRoutes');

            if (response.ok) {
                let result = await response.json();
                routes = result.routes;
                 console.log(routes)
                // renderRoutes();
            } else {
                console.error('Failed to fetch students.');
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
            alert('Failed to fetch routes.');
        }
    }

    
    function renderDrivers() {
        tableBody.innerHTML = '';
        drivers.forEach((driver, index) => {
            const matchedRoute = routes.find(route => route.driver && route.driver.driverId === driver.username);
            const routeDisplay = matchedRoute ? `${matchedRoute.routeId} 
            <button class="unassign-route-btn" onclick='if(confirm("Unassign this route?")) removeRouteDriver("${matchedRoute.routeId}")'>
                Unassign
            </button>`
            : `<button class="assign-route" data-driver-id="${driver.username}" data-driver-name="${driver.firstName} ${driver.lastName}">Assign Route</button>`;

            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${driver.firstName}</td>
                <td>${driver.lastName}</td>
                <td>${driver.username}</td>
                <td>${routeDisplay}</td>
                <td class="actions">
                    <button class="delete" onclick="deleteDriver('${driver._id}')">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    
        document.querySelectorAll('.assign-route').forEach(button => {
            button.addEventListener('click', openAssignRoutePopup);
        });
    }
    
    function openAssignRoutePopup(event) {
        const driverId = event.target.dataset.driverId;
        const driverName = event.target.dataset.driverName;

        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3 class='popup-head'>Assign Route</h3>
                <div class="route-options">
                    ${routes.filter(route => !route.driver).map(route => `
                        <label>
                            <input type="radio" name="routeId" value="${route.routeId}">
                            ${route.routeId}
                        </label>
                    `).join('')}
                </div>
                <div class="popup-buttons">
                    <button class="cancel">Cancel</button>
                    <button class="save">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    
        popup.querySelector('.cancel').addEventListener('click', () => popup.remove());
        popup.querySelector('.save').addEventListener('click', () => saveRouteAssignment(driverId, driverName, popup));
    }
    
    async function saveRouteAssignment(driverId, driverName, popup) {
        const selectedRouteId = popup.querySelector('input[name="routeId"]:checked')?.value;
        if (!selectedRouteId) {
            alert('Please select a route');
            return;
        }
    
        try {
            const response = await fetch(`/admin/assignDriverRoute/${selectedRouteId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ driverId, driverName }),
            });
    
            if (response.ok) {
                popup.remove();
                await fetchRoutes();
                await fetchDrivers();
            } else {
                alert('Failed to assign route');
            }
        } catch (error) {
            console.error('Error assigning route:', error);
            alert('Error assigning route');
        }
    }
    
    window.removeRouteDriver = async (routeId) => {
        if (!routeId) {
            alert('Please select a route');
            return;
        }

        console.log(routeId)
    
        try {
            const response = await fetch(`/admin/removeRouteDriver/${routeId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ routeId }),
            });
    
            if (response.ok) {
                await fetchRoutes();
                await fetchDrivers();
            } else {
                alert('Failed to assign route');
            }
        } catch (error) {
            console.error('Error assigning route:', error);
            alert('Error assigning route');
        }
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const firstName = document.getElementById('firstName').value;
        const lastName = document.getElementById('lastName').value;
        const username = document.getElementById('username').value;

        if (firstName && lastName && username) {
            try {
                const response = await fetch('/admin/drivers', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ firstName, lastName, username }),
                });

                if (response.ok) {
                    const result = await response.json();
                    drivers.push(result.driver);
                    renderDrivers();
                    form.reset();
                } else {
                    console.error('Failed to add driver.');
                }
            } catch (error) {
                console.error('Error adding driver:', error);
            }
        }
    });



    window.deleteDriver = async (id) => {
        try {
            const response = await fetch(`/admin/drivers/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                drivers = drivers.filter((driver) => driver._id !== id);
                renderDrivers();
            } else {
                console.error('Failed to delete driver.');
            }
        } catch (error) {
            console.error('Error deleting driver:', error);
        }
    };

    await fetchRoutes();
    await fetchDrivers();
});

