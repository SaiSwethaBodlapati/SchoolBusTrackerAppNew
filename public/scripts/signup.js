document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('registerForm');
        const errorSpan = document.getElementById('error');

        form.addEventListener('submit', async function (event) {
            event.preventDefault();
            const form = new FormData(event.target);
            let formData = {};
            form.forEach((value, key) => {
                formData[key] = value;
            });

            // Password validation
            const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
            if (!passwordRegex.test(formData.password)) {
                displayError(
                    'Password must be at least 8 characters long, contain at least 1 letter, 1 number, and 1 special character.'
                );
                return;
            }

            if (formData.password !== formData.confirmPassword) {
                displayError('Passwords do not match. Please try again.');
                return;
            }

            // Username validation
            const userRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!userRegex.test(formData.username)) {
                displayError('Please enter a valid email address as username.');
                return;
            }

            try {
                const response = await fetch('/auth/register/Student', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Registration completed successfully!');
                    window.location.href = 'index.html';
                } else {
                    console.error('Server responded with error:', data);
                    alert(data.error || 'Registration failed. Please try again.');
                }
            } catch (error) {
                console.error('Network error or other issue:', error);
                alert('An error occurred during registration. Please check the console for details.');
            }
        });

        function displayError(msg){
            errorSpan.style.display = "block";
            errorSpan.innerHTML = msg;
            setTimeout(function() {
                errorSpan.style.display = "none";
            }, 5000);
        }

});
