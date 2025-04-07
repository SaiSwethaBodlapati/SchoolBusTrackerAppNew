const step1 = document.querySelector(".step1"),
      step2 = document.querySelector(".step2"),
      step3 = document.querySelector(".step3"),
      emailAddress = document.getElementById("emailAddress"),
      verifyEmail = document.getElementById("verifyEmail"),
      inputs = document.querySelectorAll(".otp-group input"),
      newPassword = document.getElementById('newPassword'),
      confirmPassword = document.getElementById('confirmPassword'),
      nextButton = document.querySelector(".nextButton"),
      verifyButton = document.querySelector(".verifyButton"),
      submitButton = document.querySelector(".submitButton");

const urlParams = new URLSearchParams(window.location.search);
const role = urlParams.get("role");

let OTP="";
window.addEventListener("load", () => {
    step2.style.display = "none";
    step3.style.display = "none";
    nextButton.classList.add("disable");
    verifyButton.classList.add("disable");
    submitButton.classList.add("disable");
});

const validateEmail =(email)=>{
    let re=/\S+@\S+\.\S+/;
    if(re.test(email)){
        nextButton.classList.remove("disable");
    } else{
        nextButton.classList.add("disable");
    }
};

const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000);
};
inputs.forEach((input)=>{
    input.addEventListener("keyup",function(e){
        if(this.value.length>=1){
            e.target.value=e.target.value.substr(0,1);
        }
        let allFilled = Array.from(inputs).every((input) => input.value !== "");
        if (allFilled) {
            verifyButton.classList.remove("disable");
        } else {
            verifyButton.classList.add("disable");
        }
    });
});


nextButton.addEventListener("click", async() => {
    nextButton.innerHTML="&#9889; Sending...";
    try {
        const response = await fetch('/auth/sendOTP', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: emailAddress.value, role: role }),
        });

        const data = await response.json();

        if (response.ok) {
            alert("OTP sent to mail! Please check :) ");
            nextButton.innerHTML="Next";
            step1.style.display="none";
            step2.style.display="block";
            step3.style.display="none";
        } else {
            alert(data.error || 'Login failed. Please check your credentials and try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during login. Please try again.');
    }

});


verifyButton.addEventListener("click", async() => {
    let values="";
    inputs.forEach((input)=>{
        console.log(input.value);
        values+=input.value;
    });
    console.log("OTP : ", values);

    if(values.length == 4) {
        try {
            const response = await fetch('/auth/validateOTP', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email: emailAddress.value, otp : values, role: role }),
            });
    
            const data = await response.json();
    
            if (response.ok) {
                alert("OTP verified ✅");
                step1.style.display="none";
                step2.style.display="none";
                step3.style.display="block";
            } else {
                alert(data.error || 'OTP verification failed. Please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred during OTP verification. Please try again.');
        }
    }

    else {
        verifyButton.classList.add("error-shake");
    }
    setTimeout(() => {
        verifyButton.classList.remove("error-shake");
    }, 5000); 
});

submitButton.addEventListener("click", async() => {
    submitButton.innerHTML="&#9889; Changing...";
    try {
        const response = await fetch('/auth/resetPassword', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username: emailAddress.value, newPassword: newPassword.value, role: role }),
        });

        const data = await response.json();
        console.log(data)
        if (response.ok) {
            alert("New password updated :) ");
            window.location.href = "index.html";
        } else {
            alert(data.error || 'Please try again.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred during password reset. Please try again.');
    }

});

function matchPassword(){
    if(newPassword.value != confirmPassword.value){
        submitButton.classList.add("disable");
        confirmPassword.style.borderColor= "#ff0000";
    } else {
        submitButton.classList.remove("disable");
        confirmPassword.style.borderColor= "#676767";
    }
}

function validatePassword() {
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$#!%*?&])[A-Za-z\d@$#!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword.value)) {
        newPassword.style.borderColor= "#ff0000";
    } else {
        newPassword.style.borderColor= "#676767";
    }
}

function changeMyEmail(){
    step1.style.display="block";
    step2.style.display="none";
    step3.style.display="none";
}