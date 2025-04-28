
var students = [], routes = [], drivers = [];

document.addEventListener('DOMContentLoaded', async () => {


    const tableBody = document.querySelector('#studentsTable tbody');

    async function fetchStudents() {
        try {
            const response = await fetch('/admin/students');
            if (response.ok) {
                let result = await response.json();
                students = result.students;
                console.log(students)
                renderStudents();
            } else {
                console.error('Failed to fetch students.');
            }
        } catch (error) {
            console.error('Error fetching students:', error);
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

    async function fetchDrivers() {
        try {
            const response = await fetch('/admin/drivers');
            if (response.ok) {
                let result = await response.json();
                drivers = result.drivers;
                
            } else {
                console.error('Failed to fetch drivers.');
            }
        } catch (error) {
            console.error('Error fetching drivers:', error);
        }
    }

    
    function renderStudents() {
        tableBody.innerHTML = '';
        students.forEach((student, index) => {
            const row = document.createElement('tr');
            const matchedRoute = routes.find(route => route.routeId === student.routeId);
            const driverName = matchedRoute?.driver?.name || 'Not Assigned';
            row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.firstName}</td>
            <td>${student.lastName}</td>
            <td>${student.username}</td>
            <td>${student.class}</td>
            <td>${student.addressLine1}, ${student.addressLine2}, ${student.city}</td>
            <td>
                ${
                    student.routeId 
                        ? `${student.routeId} - ${student.busStop} 
                            <button class="unassign-bus-btn" 
                                onclick='if(confirm("Unassign this student from the route?")) removeRouteStudent("${student.studentId}")'>
                                Unassign
                            </button>`
                        : `<button class="assign-bus" data-student-id="${student.studentId}">Assign Bus</button>`
                }
            </td>
            <td>${driverName}</td>
            <td>Idle</td>
        `;

            tableBody.appendChild(row);
        });
    
        document.querySelectorAll('.assign-bus').forEach(button => {
            button.addEventListener('click', openAssignBusPopup);
        });
    }

    window.removeRouteStudent = async (studentId) => {
        if (!studentId) {
            alert('Please select student');
            return;
        }

        console.log(studentId)
    
        try {
            const response = await fetch(`/admin/removeRouteStudent/${studentId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ studentId }),
            });
    
            if (response.ok) {
                await fetchStudents();
            } else {
                alert('Failed to assign route');
            }
        } catch (error) {
            console.error('Error assigning route:', error);
            alert('Error assigning route');
        }
    }
    
    function openAssignBusPopup(event) {
        const studentId = event.target.dataset.studentId;
        const popup = document.createElement('div');
        popup.className = 'popup';
        popup.innerHTML = `
            <div class="popup-content">
                <h3 class='popup-head'>Assign Bus Route</h3>
                <div class="route-options">
                    ${routes.map(route => `
                        <label>
                            <input type="radio" name="routeId" value="${route.routeId}" data-route-index="${routes.indexOf(route)}">
                            ${route.routeId}
                        </label>
                    `).join('')}
                </div>
                <div class="stop-options" style="display: none;">
                    <h4>Select Stop:</h4>
                    <div class="stops-container"></div>
                </div>
                <div class="popup-buttons">
                    <button class="cancel">Cancel</button>
                    <button class="save">Save</button>
                </div>
            </div>
        `;
        document.body.appendChild(popup);
    
        const routeRadios = popup.querySelectorAll('input[name="routeId"]');
        routeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                const routeIndex = e.target.dataset.routeIndex;
                const selectedRoute = routes[routeIndex];
                const stopsContainer = popup.querySelector('.stops-container');
                const stopOptions = popup.querySelector('.stop-options');
                
                stopOptions.style.display = 'block';
                
                stopsContainer.innerHTML = selectedRoute.stops.map(stop => `
                    <label>
                        <input type="radio" name="stopId" value="${stop.stopId}">
                        ${stop.stopId}
                    </label>
                `).join('');
            });
        });
    
        popup.querySelector('.cancel').addEventListener('click', () => popup.remove());
        popup.querySelector('.save').addEventListener('click', () => saveRouteAssignment(studentId, popup));
    }
    
    async function saveRouteAssignment(studentId, popup) {
        const selectedRouteId = popup.querySelector('input[name="routeId"]:checked')?.value;
        const selectedStopId = popup.querySelector('input[name="stopId"]:checked')?.value;
        
        if (!selectedRouteId) {
            alert('Please select a route');
            return;
        }
        
        if (!selectedStopId) {
            alert('Please select a stop');
            return;
        }
    
        try {
            const response = await fetch(`/admin/assignStudentRoute/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    routeId: selectedRouteId,
                    stopId: selectedStopId 
                }),
            });
    
            if (response.ok) {
                popup.remove();
                await fetchStudents();
            } else {
                alert('Failed to assign route and stop');
            }
        } catch (error) {
            console.error('Error assigning route and stop:', error);
            alert('Error assigning route and stop');
        }
    }
    
    

    await fetchRoutes();
    await fetchStudents();
    
   // await fetchDrivers();

});

