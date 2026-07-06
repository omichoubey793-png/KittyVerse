// =====================================
// KittyVerse - Add Rescue Cat Controller
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("kittyverse_token");
    if (!token) {
        window.location.href = "login.html";
        return;
    }

    const form = document.querySelector("form");
    const fileInput = document.getElementById("catImage");
    const dropZone = document.querySelector(".group.cursor-pointer");
    const toast = document.getElementById("toast");

    // 1. Photo Upload Preview Interaction
    if (dropZone && fileInput) {
        // Prevent default click propagation since input is hidden inside dropZone
        fileInput.addEventListener("click", (e) => {
            e.stopPropagation();
        });

        // Trigger input click on dropZone click
        dropZone.addEventListener("click", () => {
            fileInput.click();
        });

        // Drag and drop events
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("bg-primary-container/5", "border-primary");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("bg-primary-container/5", "border-primary");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("bg-primary-container/5", "border-primary");
            
            if (e.dataTransfer.files.length > 0) {
                fileInput.files = e.dataTransfer.files;
                handleFileSelect(e.dataTransfer.files[0]);
            }
        });

        fileInput.addEventListener("change", (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });
    }

    function handleFileSelect(file) {
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (event) => {
                dropZone.innerHTML = `
                    <img class="w-full h-full object-cover rounded-[20px]" src="${event.target.result}" alt="Preview"/>
                    <div class="absolute bottom-md right-md bg-black/60 backdrop-blur-sm text-white px-md py-xs rounded-full font-label-sm text-label-sm hover:bg-black/80 transition-colors">
                        Change Photo
                    </div>
                `;
            };
            reader.readAsDataURL(file);
        }
    }

    // 2. Form Submission Flow
    if (form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector("button[type='submit']");
            const originalHTML = submitBtn.innerHTML;

            // Form data values
            const name = document.getElementById("catName").value.trim();
            const breed = document.getElementById("catBreed").value.trim();
            const gender = document.getElementById("catGender").value;
            const age = document.getElementById("catAge").value;
            const color = document.getElementById("catColor").value.trim();
            const description = document.getElementById("catDescription").value.trim();

            if (!name || !breed || !gender || !age || !color || !description) {
                alert("Please fill in all required fields.");
                return;
            }

            // Loader feedback
            submitBtn.innerHTML = `
                <svg class="animate-spin h-5 w-5 text-on-primary-container" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving Case...
            `;
            submitBtn.disabled = true;

            const formData = new FormData();
            formData.append("name", name);
            formData.append("species", "Cat");
            formData.append("breed", breed);
            formData.append("gender", gender);
            formData.append("age", age);
            formData.append("color", color);
            formData.append("description", description);
            formData.append("healthStatus", "Healthy"); // default initial health status

            if (fileInput.files.length > 0) {
                formData.append("image", fileInput.files[0]);
            }

            try {
                const response = await fetch(`${API_BASE_URL}/api/animals`, {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    },
                    body: formData
                });

                if (response.ok) {
                    // Show Toast Notification
                    if (toast) {
                        toast.classList.remove("translate-y-24", "opacity-0");
                        toast.classList.add("translate-y-0", "opacity-100");
                    }

                    setTimeout(() => {
                        window.location.href = "shelter.html";
                    }, 2000);
                } else {
                    const data = await response.json();
                    alert(`Failed to save rescue: ${data.message || "Unknown error"}`);
                    submitBtn.innerHTML = originalHTML;
                    submitBtn.disabled = false;
                }
            } catch (error) {
                console.error("Form submit error:", error);
                alert("Network error: Could not connect to database.");
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }
        });
    }

    // Cancel Button click handler
    const cancelBtn = document.querySelector("header button") || document.querySelector("footer button[type='button']");
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            if (confirm("Are you sure you want to discard this intake form? All progress will be lost.")) {
                window.location.href = "shelter.html";
            }
        });
    }
});
