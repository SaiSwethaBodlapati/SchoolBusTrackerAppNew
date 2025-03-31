
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
                <td>${student.routeId ? student.routeId : '<button class="assign-bus" data-student-id="' + student.studentId + '">Assign Bus</button>'}</td>
                <td>${driverName}</td>
                <td>Idle</td>
            `;
            tableBody.appendChild(row);
        });
    
        document.querySelectorAll('.assign-bus').forEach(button => {
            button.addEventListener('click', openAssignBusPopup);
        });
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
        popup.querySelector('.save').addEventListener('click', () => saveRouteAssignment(studentId, popup));
    }
    
    async function saveRouteAssignment(studentId, popup) {
        const selectedRouteId = popup.querySelector('input[name="routeId"]:checked')?.value;
        if (!selectedRouteId) {
            alert('Please select a route');
            return;
        }
    
        try {
            const response = await fetch(`/admin/assignStudentRoute/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ routeId: selectedRouteId }),
            });
    
            if (response.ok) {
                popup.remove();
                await fetchStudents();
            } else {
                alert('Failed to assign route');
            }
        } catch (error) {
            console.error('Error assigning route:', error);
            alert('Error assigning route');
        }
    }
    

    await fetchRoutes();
    await fetchStudents();
    
   // await fetchDrivers();

});

