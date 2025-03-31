const token = localStorage.getItem('token');
const email = localStorage.getItem('email');

if(!token || !email){
    window.location.href = '/index.html'
}

function logout(){
    alert('Logging out...');
    localStorage.clear();
    window.location.reload(true);
}
