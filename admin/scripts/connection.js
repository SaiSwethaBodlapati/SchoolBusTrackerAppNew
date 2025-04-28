const socket = io("http://localhost:8000", {
    auth: {
        id: localStorage.getItem('email'),
        role: "admin"
    }
});  