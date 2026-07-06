// =======================================
// KITTYVERSE REGISTRATION
// =======================================

const form = document.querySelector("form");
const button = document.getElementById("submit-btn");
const nameInput = document.getElementById("name-input");
const shelterInput = document.getElementById("shelter-input");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");

// Create error container
const errorDiv = document.createElement("div");
errorDiv.style.color = "#ff4d4d";
errorDiv.style.fontSize = "14px";
errorDiv.style.marginTop = "10px";
errorDiv.style.textAlign = "center";
form.appendChild(errorDiv);

form.addEventListener("submit", async function (e) {
    e.preventDefault();
    errorDiv.textContent = "";

    const name = nameInput.value.trim();
    const shelterName = shelterInput.value.trim() || "Silicon Valley Rescue";
    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!name || !email || !password) {
        errorDiv.textContent = "Please fill in all required fields.";
        return;
    }

    button.innerHTML = "Registering...";
    button.disabled = true;

    try {
        // 1. Call registration API
        const registerResponse = await fetch(`${API_BASE_URL}/api/auth/register`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ name, email, password, role: "admin", shelterName })
        });

        const registerData = await registerResponse.json();

        if (!registerResponse.ok) {
            errorDiv.textContent = registerData.message || "Registration failed.";
            button.innerHTML = "Sign Up";
            button.disabled = false;
            return;
        }

        // 2. Auto-login on successful registration
        button.innerHTML = "Success! Logging in...";
        const loginResponse = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();

        if (loginResponse.ok) {
            localStorage.setItem("kittyverse_token", loginData.token);
            localStorage.setItem("kittyverse_user", JSON.stringify(loginData.user));
            
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        } else {
            errorDiv.textContent = "Registration succeeded, but auto-login failed. Please sign in manually.";
            button.innerHTML = "Sign Up";
            button.disabled = false;
        }
    } catch (error) {
        console.error(error);
        errorDiv.textContent = "Unable to connect to the server. Make sure the backend is running.";
        button.innerHTML = "Sign Up";
        button.disabled = false;
    }
});
