
const socket = io("http://localhost:8000", {
    auth: {
        id: localStorage.getItem('email'),
        role: "student"
    }
});  

const driverList = document.getElementById('driverList');
const adminList = document.getElementById('adminList');
const senderId = localStorage.getItem('email');
var drivers = [], admins = [];
var recipientId, recipientRole;


document.addEventListener('DOMContentLoaded', async () => {

    await fetchDrivers();
    await fetchAdmins();

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
    const role = drivers.some(driver => driver.username === from) ? 'driver' : 'admin';
    moveChatToTop(from, role);
});

function moveChatToTop(userId, role) {
    const listElement = role === 'driver' ? driverList : adminList;
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


function displayDriver(){
    driverList.style.display = "Block";
    adminList.style.display = "None";

    document.querySelector(".select-driver").classList.add("active-select");
    document.querySelector(".select-admin").classList.remove("active-select");
}

function displayAdmin(){
    driverList.style.display = "None";
    adminList.style.display = "Block";

    document.querySelector(".select-admin").classList.add("active-select");
    document.querySelector(".select-driver").classList.remove("active-select");
}

async function fetchDrivers() {
    try {
        const response = await fetch('/student/drivers');
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

async function fetchAdmins() {
    try {
        const response = await fetch('/student/admins');
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

function renderDrivers() {
    driverList.innerHTML = "";
    drivers.forEach(driver => {
        let template = `<a class="chat-item" id="${driver.username}" data-role="driver" onclick="initiateChat('${driver.firstName} ${driver.lastName}','${driver.username}','driver')">
                            <img src="./assets/driver_icon.png" alt="Icon">
                            <div>
                                <h3 class="name">${driver.firstName} ${driver.lastName}</h3>
                                <p class="username">${driver.username}</p>
                                <span class="new-msg" id="${driver.username}-notify">New Message</span>
                            </div>
                        </a>`
        driverList.innerHTML += template;
    });
}

function renderAdmins() {
    adminList.innerHTML = "";
    admins.forEach(admin => {
        let template = `<a class="chat-item" id="${admin.username}" data-role="admin" onclick="initiateChat('${admin.firstName} ${admin.lastName}','${admin.username}', 'admin')">
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