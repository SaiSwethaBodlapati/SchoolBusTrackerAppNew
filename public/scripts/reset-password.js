document.addEventListener('DOMContentLoaded', function () {
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function (event) {
            event.preventDefault();

            const username = String(document.getElementById('username').value);
            const newPassword = String(document.getElementById('newPassword').value);
            const confirmNewPassword = String(document.getElementById('confirmNewPassword').value);

            if (newPassword !== confirmNewPassword) {
                alert('New passwords do not match. Please try again.');
                return;
            }

            try {
                const response = await fetch('/auth/reset-password', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ 
                        username: username, 
                        newPassword: newPassword 
                    }),
                });

                const data = await response.json();

                if (response.ok) {
                    alert('Password reset successfully!');
                    window.location.href = 'index.html'; 
                } else {
                    console.error('Server responded with error:', data);
                    alert(data.error || 'Password reset failed. Please try again.');
                }
            } catch (error) {
                console.error('Network error or other issue:', error);
                alert('An error occurred during password reset. Please try again.');
            }
        });
    }
});