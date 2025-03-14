const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const registerVideo = document.getElementById("register-video");
const registerCanvas = document.getElementById("register-canvas");
const registerCtx = registerCanvas.getContext("2d");

// Start webcam for login and registration
navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
        video.srcObject = stream;
        registerVideo.srcObject = stream;
    })
    .catch(err => console.error("Error accessing webcam", err));

// Function to show the login page
function showLoginPage() {
    document.getElementById("login-page").style.display = "block";
    document.getElementById("register-page").style.display = "none";
    document.getElementById("register-success-page").style.display = "none";
    document.getElementById("login-success-page").style.display = "none";
}

// Function to show the register page
function showRegisterPage() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("register-page").style.display = "block";
    document.getElementById("register-success-page").style.display = "none";
    document.getElementById("login-success-page").style.display = "none";
}

// Function to show the registration success page
function showRegisterSuccessPage() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("register-page").style.display = "none";
    document.getElementById("register-success-page").style.display = "block";
    document.getElementById("login-success-page").style.display = "none";
}

// Function to show the login success page
function showLoginSuccessPage() {
    document.getElementById("login-page").style.display = "none";
    document.getElementById("register-page").style.display = "none";
    document.getElementById("register-success-page").style.display = "none";
    document.getElementById("login-success-page").style.display = "block";
}

// Function to capture an image from the video stream
function captureImage(canvasElement) {
    const ctx = canvasElement.getContext("2d");
    ctx.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    return canvasElement.toDataURL("image/jpeg");
}

// Function to handle login
function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;
    const imageData = captureImage(canvas);

    fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "Login successful") {
            showLoginSuccessPage();
        } else {
            document.getElementById("status").innerText = data.error || "Login failed";
        }
    })
    .catch(error => console.error("Error:", error));
}

// Function to handle registration
function register() {
    const email = document.getElementById("register-email").value;
    const password = document.getElementById("register-password").value;
    const imageData = captureImage(registerCanvas);

    fetch("http://127.0.0.1:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, image: imageData })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === "User registered successfully") {
            showRegisterSuccessPage(); // Redirect to registration success page
        } else {
            document.getElementById("register-status").innerText = data.error || "Registration failed";
        }
    })
    .catch(error => console.error("Error:", error));
}