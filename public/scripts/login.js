const loginForm = document.getElementById('loginForm');
const submitBtn = document.querySelector('.submit-btn');
const roleInputs = document.querySelectorAll('input[name="selector"]');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');

submitBtn.disabled = true;

function checkFormValidity() {
    const roleSelected = Array.from(roleInputs).some(input => input.checked);
    const usernameEntered = usernameInput.value.trim() !== '';
    const passwordEntered = passwordInput.value.trim() !== '';

    submitBtn.disabled = !(roleSelected && usernameEntered && passwordEntered);
}


roleInputs.forEach(input => input.addEventListener('change', checkFormValidity));
usernameInput.addEventListener('input', checkFormValidity);
passwordInput.addEventListener('input', checkFormValidity);

loginForm.addEventListener('submit', async function (event) {
    event.preventDefault();
    const form = new FormData(event.target);
    const selected = document.querySelector('input[name="selector"]:checked');
    form.append('role', selected.value);
    let formData = {};
    form.forEach((value, key) => {
        formData[key] = value;
    });

    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (response.ok) {
            alert('Login successful!');
            console.log(data);
            const token = data.user.token;
            localStorage.setItem('token', token);
            localStorage.setItem('role', 'User');
            localStorage.setItem('email', data.user.username)
            if(selected.value == 'Student') window.location.href = 'dashboard.html';
            else if(selected.value == 'Admin') window.location.href = '/admin';
            else window.location.href = '/driver';

        } else {
            alert(data.error || 'Login failed. Please check your credentials and try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again.');
    }
});

function registerPage(){
    const selected = document.querySelector('input[name="selector"]:checked');
    if(selected.value == 'Student') window.location.href = 'signup.html';
    else if(selected.value == 'Admin') window.location.href = '/admin/signup.html';
    else alert('Driver signup is handled by Admin :) ');
}

function forgot(){
    const selected = document.querySelector('input[name="selector"]:checked');
    if(selected.value == 'Student') window.location.href = 'otpverification.html?role=Student';
    else if(selected.value == 'Admin') window.location.href = 'otpverification.html?role=Admin';
    else window.location.href = 'otpverification.html?role=Driver';
}
