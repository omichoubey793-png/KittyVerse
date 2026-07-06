// =======================================
// KITTYVERSE LOGIN
// =======================================

const form = document.querySelector("form");
const button = document.getElementById("submit-btn");
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

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        errorDiv.textContent = "Please fill in all fields.";
        return;
    }

    button.innerHTML = "Signing In...";
    button.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem("kittyverse_token", data.token);
            localStorage.setItem("kittyverse_user", JSON.stringify(data.user));
            
            button.innerHTML = "Success! Redirecting...";
            
            setTimeout(() => {
                window.location.href = "dashboard.html";
            }, 500);
        } else {
            errorDiv.textContent = data.message || "Invalid credentials.";
            button.innerHTML = "Sign In";
            button.disabled = false;
        }
    } catch (error) {
        console.error(error);
        errorDiv.textContent = "Unable to connect to the server. Make sure the backend is running.";
        button.innerHTML = "Sign In";
        button.disabled = false;
    }
});