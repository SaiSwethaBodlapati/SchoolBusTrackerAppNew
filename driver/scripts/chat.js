
const socket = io("http://localhost:8000", {
    auth: {
        id: localStorage.getItem('email'),
        role: "driver"
    }
});  

var adminList, studentList, senderId;
var admins = [], students = [];
var recipientId, recipientRole;


document.addEventListener('DOMContentLoaded', async () => {

    adminList = document.getElementById('adminList');
    studentList = document.getElementById('studentList');
    senderId = localStorage.getItem('email');

    await fetchAdmins();
    await fetchStudents();

});

socket.onopen = function () {
    console.log("Connected to WebSocket server");
};

socket.on('welcome',({msg}) => {
    console.log(msg)
})

socket.on("receiveMessage", ({ from, message }) => {
    console.log(`Private message received from ${from}: ${message}`);
    if(from == recipientId){
        displayMessage(message, "sender");
    } else {
        notify(from);
    }
    const role = students.some(student => student.username === from) ? 'student' : 'admin';
    moveChatToTop(from, role);
});

function moveChatToTop(userId, role) {
    const listElement = role === 'student' ? studentList : adminList;
    const chatItem = document.getElementById(userId);
    if (chatItem && listElement.firstChild !== chatItem) {
      listElement.removeChild(chatItem);
      listElement.insertBefore(chatItem, listElement.firstChild);
    }
}

function fetchMessages(senderId, recipientId) {
    socket.emit("fetchMessages", { senderId, recipientId }, (messages) => {
        clearMessages();
        if (messages && messages.length > 0) {
            messages.forEach(msg => {
                displayMessage(msg.message, msg.senderId === senderId ? "reply" : "sender");
            });
        }
    });
}


function sendMessage() {
    const inputField = document.getElementById("textMessage");
    const message = inputField.value.trim();

    if (message && recipientId && recipientRole) {
        displayMessage(message, "reply");
        socket.emit('sendMessage', { senderId, recipientId, recipientRole, message });
        inputField.value = "";
        moveChatToTop(recipientId, recipientRole);
    } else {
        alert("Please select a chat to chat")
    }
}

function displayMessage(message, sender) {
    const messageSection = document.getElementById("messages");
    const messageDiv = document.createElement("li");

    messageDiv.classList.add(sender);
    messageDiv.textContent = message;
    messageSection.appendChild(messageDiv);
    messageSection.scrollTop = messageSection.scrollHeight;
}

function clearMessages(){
    const messageSection = document.getElementById("messages");
    messageSection.innerHTML = '';
}


function closeChat() {
    document.getElementById("chat-container").style.display = "none";
}


function displayAdmin(){
    adminList.style.display = "Block";
    studentList.style.display = "None";

    document.querySelector(".select-admin").classList.add("active-select");
    document.querySelector(".select-student").classList.remove("active-select");
}

function displayStudent(){
    adminList.style.display = "None";
    studentList.style.display = "Block";

    document.querySelector(".select-student").classList.add("active-select");
    document.querySelector(".select-admin").classList.remove("active-select");
}

async function fetchAdmins() {
    try {
        const response = await fetch('/driver/admins');
        if (response.ok) {
            let result = await response.json();
            admins = result.admins;
            renderAdmins();
        } else {
            console.error('Failed to fetch admins.');
        }
    } catch (error) {
        console.error('Error fetching admins:', error);
    }
}

async function fetchStudents() {
    try {
        const response = await fetch('/driver/students');
        if (response.ok) {
            let result = await response.json();
            students = result.students;
            renderStudents();
        } else {
            console.error('Failed to fetch students.');
        }
    } catch (error) {
        console.error('Error fetching students:', error);
    }
}

function renderAdmins() {
    adminList.innerHTML = "";
    admins.forEach(admin => {
        let template = `<a class="chat-item" id="${admin.username}" data-role="admin" onclick="initiateChat('${admin.firstName} ${admin.lastName}','${admin.username}','admin')">
                            <img src="./assets/admin_icon.png" alt="Icon">
                            <div>
                                <h3 class="name">${admin.firstName} ${admin.lastName}</h3>
                                <p class="username">${admin.username}</p>
                                <span class="new-msg" id="${admin.username}-notify">New Message</span>
                            </div>
                        </a>`
        adminList.innerHTML += template;
    });
}

function renderStudents() {
    studentList.innerHTML = "";
    students.forEach(student => {
        let template = `<a class="chat-item" id="${student.username}" data-role="student" onclick="initiateChat('${student.firstName} ${student.lastName}','${student.username}', 'student')">
                            <img src="./assets/student_icon.png" alt="Icon">
                            <div>
                                <h3 class="name">${student.firstName} ${student.lastName}</h3>
                                <p class="username">${student.username}</p>
                                <span class="new-msg" id="${student.username}-notify">New Message</span>
                            </div>
                        </a>`
        studentList.innerHTML += template;
    });
}

function notify(userId){
    document.getElementById(`${userId}-notify`).style.display = 'block';
}

function clearNotify(userId){
    document.getElementById(`${userId}-notify`).style.display = 'none';
}

async function initiateChat(recipientChatName, recipientUsername, role){
    document.getElementById('chatName').innerHTML = recipientChatName;
    document.getElementById('Username').innerHTML = recipientUsername;

    recipientId = recipientUsername;
    recipientRole = role;

    clearNotify(recipientUsername);
    await fetchMessages(senderId,recipientUsername);
}