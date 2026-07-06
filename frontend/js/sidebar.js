// ==========================================
// KittyVerse - Dynamic Sidebar & Auth Guard
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Session check (Auth Guard)
    const token = localStorage.getItem("kittyverse_token");
    const userStr = localStorage.getItem("kittyverse_user");
    
    // Pages that are accessible without login
    const path = window.location.pathname;
    const isPublicPage = path.endsWith("login.html") || path.endsWith("index.html") || path === "/";

    if (!isPublicPage && (!token || !userStr)) {
        window.location.href = "login.html";
        return;
    }

    // 2. Render unified sidebar inside the <aside> tag
    const sidebar = document.querySelector("aside");
    if (sidebar) {
        // Preserving the current KittyVerse structural layout and classes
        sidebar.className = "h-screen w-64 fixed left-0 top-0 border-r border-outline-variant bg-surface flex flex-col py-8 px-5 z-50 select-none justify-between";

        const getActiveCls = (pages) => {
            const isActive = pages.some(p => path.endsWith(p));
            return isActive 
                ? "flex items-center gap-3.5 px-4.5 py-3 rounded-[20px] font-semibold text-[#FF914D] bg-[#FFF4EB] transition-all duration-200" 
                : "flex items-center gap-3.5 px-4.5 py-3 rounded-[20px] text-secondary hover:bg-[#FFF4EB]/40 hover:text-[#FF914D] transition-colors duration-200";
        };

        // Render Sidebar Layout with specified placeholder logo
        sidebar.innerHTML = `
            <div class="flex flex-col gap-8">
                <!-- Branding Header with circular placeholder logo -->
                <div class="flex items-center gap-3.5 px-2.5 cursor-pointer" onclick="window.location.href='dashboard.html'">
                    <img src="assets/logo.svg" alt="Logo" class="w-10 h-10 shrink-0 bg-[#FFF4EB] rounded-full p-1.5 border border-[#FF914D]/10 shadow-sm">
                    <span class="font-bold text-lg text-text-main tracking-tight">KittyVerse</span>
                </div>

                <!-- Navigation List with increased spacing -->
                <nav class="flex flex-col gap-2">
                    <a class="${getActiveCls(['dashboard.html'])}" href="dashboard.html">
                        <span class="material-symbols-outlined">dashboard</span>
                        <span class="font-label-md text-sm">Dashboard</span>
                    </a>
                    <a class="${getActiveCls(['shelter.html', 'cat-profile.html'])}" href="shelter.html">
                        <span class="material-symbols-outlined">pets</span>
                        <span class="font-label-md text-sm">Shelter Management</span>
                    </a>
                    <a class="${getActiveCls(['analytics.html'])}" href="analytics.html">
                        <span class="material-symbols-outlined">analytics</span>
                        <span class="font-label-md text-sm">Analytics</span>
                    </a>
                    <a class="${getActiveCls(['adoptions.html'])}" href="adoptions.html">
                        <span class="material-symbols-outlined">volunteer_activism</span>
                        <span class="font-label-md text-sm">Adoption</span>
                    </a>
                    <a class="${getActiveCls(['chat.html'])}" href="chat.html">
                        <span class="material-symbols-outlined">smart_toy</span>
                        <span class="font-label-md text-sm">AI Assistant</span>
                    </a>
                    <a class="${getActiveCls(['settings.html'])}" href="settings.html">
                        <span class="material-symbols-outlined">settings</span>
                        <span class="font-label-md text-sm">Settings</span>
                    </a>
                </nav>
            </div>

            <!-- Bottom Section actions -->
            <div class="flex flex-col gap-4 mt-auto">
                <button onclick="window.location.href='add-cat.html'" class="w-full bg-[#FF914D] hover:bg-[#ff8033] text-white py-3 rounded-[20px] font-semibold transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-sm shadow-orange-100">
                    <span class="material-symbols-outlined">add</span>
                    Add Cat
                </button>
                <button id="sidebarLogoutBtn" class="flex items-center justify-center gap-2 text-xs text-secondary hover:text-[#FF914D] transition-colors py-2 px-4 rounded-[12px] hover:bg-orange-50/50 w-fit mx-auto mt-1">
                    <span class="material-symbols-outlined text-[16px]">logout</span>
                    Logout
                </button>
            </div>
        `;

        // Bind logout functionality
        const logoutBtn = document.getElementById("sidebarLogoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("kittyverse_token");
                localStorage.removeItem("kittyverse_user");
                window.location.href = "login.html";
            });
        }
    }

    // 3. Render unified header dynamically
    const header = document.querySelector("header");
    if (header && token && userStr) {
        let currentUser = {};
        try {
            currentUser = JSON.parse(userStr);
        } catch (e) {
            console.error("Failed to parse userStr:", e);
        }
        const defaultAvatar = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23FF914D"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>';

        // Preserve input search query and id if it existed
        const existingSearchInput = header.querySelector("input");
        const placeholderText = existingSearchInput ? (existingSearchInput.placeholder || "Search rescued cats...") : "Search rescued cats...";
        const inputId = existingSearchInput ? (existingSearchInput.id || "searchInput") : "searchInput";
        const inputValue = existingSearchInput ? existingSearchInput.value : "";

        // Standardize classes on header
        header.className = "fixed top-0 right-0 w-[calc(100%-16rem)] z-40 bg-surface/80 backdrop-blur-md flex justify-between items-center h-16 px-lg shadow-sm border-b border-outline-variant/30";

        header.innerHTML = `
            <div class="flex items-center gap-lg flex-1">
                <div class="relative w-full max-w-xl">
                    <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary" data-icon="search">search</span>
                    <input id="${inputId}" class="w-full bg-surface-container border-none rounded-xl pl-10 py-sm focus:ring-2 focus:ring-primary-container text-label-md" placeholder="${placeholderText}" type="text" value="${inputValue}"/>
                </div>
            </div>
            <div class="flex items-center gap-lg">
                <div class="flex items-center gap-md text-secondary">
                    <div class="relative">
                        <button id="notificationBellBtn" class="hover:text-primary transition-all active:scale-95 relative p-1 flex items-center">
                            <span class="material-symbols-outlined" data-icon="notifications">notifications</span>
                            <span id="notificationBadge" class="absolute -top-1 -right-1 bg-error text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full hidden">0</span>
                        </button>
                        <!-- Notifications Dropdown Menu -->
                        <div id="notificationDropdown" class="absolute right-0 mt-2 w-80 bg-white border border-outline-variant rounded-2xl shadow-xl py-2 z-50 hidden">
                            <div class="px-4 py-2 border-b border-outline-variant flex justify-between items-center">
                                <span class="font-label-md font-bold text-on-surface">Notifications</span>
                            </div>
                            <div id="notificationList" class="max-h-64 overflow-y-auto divide-y divide-outline-variant/30">
                                <!-- Rendered dynamically -->
                            </div>
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <button id="profileDropdownBtn" class="h-8 w-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant focus:outline-none flex items-center">
                        <img id="profileAvatarImg" class="w-full h-full object-cover" src=""/>
                    </button>
                    <!-- Profile Dropdown Menu -->
                    <div id="profileDropdown" class="absolute right-0 mt-2 w-48 bg-white border border-outline-variant rounded-2xl shadow-xl py-2 z-50 hidden">
                        <div class="px-4 py-2 border-b border-outline-variant">
                            <p id="profileNameText" class="font-label-md font-bold text-on-surface">Shelter Admin</p>
                            <p id="profileRoleText" class="text-[10px] text-secondary tracking-wider uppercase">Administrator</p>
                        </div>
                        <a href="settings.html" class="block px-4 py-2 text-sm text-secondary hover:bg-surface-container hover:text-primary transition-colors">My Profile</a>
                        <a href="settings.html" class="block px-4 py-2 text-sm text-secondary hover:bg-surface-container hover:text-primary transition-colors">Settings</a>
                        <button id="logoutBtn" class="w-full text-left block px-4 py-2 text-sm text-error hover:bg-red-50 transition-colors">Logout</button>
                    </div>
                </div>
            </div>
        `;

        const profileAvatarImg = document.getElementById("profileAvatarImg");
        const profileNameText = document.getElementById("profileNameText");
        const profileRoleText = document.getElementById("profileRoleText");

        const updateHeaderUI = (user) => {
            if (profileAvatarImg) profileAvatarImg.src = user.avatarUrl || defaultAvatar;
            if (profileNameText) profileNameText.textContent = user.name || "Shelter Admin";
            if (profileRoleText) {
                const roleVal = user.role ? (user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()) : "Administrator";
                profileRoleText.textContent = roleVal.toUpperCase();
            }
        };

        updateHeaderUI(currentUser);

        const profileDropdownBtn = document.getElementById("profileDropdownBtn");
        const profileDropdown = document.getElementById("profileDropdown");
        if (profileDropdownBtn && profileDropdown) {
            profileDropdownBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                profileDropdown.classList.toggle("hidden");
            });
        }

        const logoutBtn = document.getElementById("logoutBtn");
        if (logoutBtn) {
            logoutBtn.addEventListener("click", () => {
                localStorage.removeItem("kittyverse_token");
                localStorage.removeItem("kittyverse_user");
                localStorage.removeItem("kittyverse_theme");
                window.location.href = "login.html";
            });
        }

        const notificationBellBtn = document.getElementById("notificationBellBtn");
        const notificationDropdown = document.getElementById("notificationDropdown");
        if (notificationBellBtn && notificationDropdown) {
            notificationBellBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                notificationDropdown.classList.toggle("hidden");
            });
        }

        window.addEventListener("click", (e) => {
            if (profileDropdown && !profileDropdown.classList.contains("hidden") && !profileDropdownBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
                profileDropdown.classList.add("hidden");
            }
            if (notificationDropdown && !notificationDropdown.classList.contains("hidden") && !notificationBellBtn.contains(e.target) && !notificationDropdown.contains(e.target)) {
                notificationDropdown.classList.add("hidden");
            }
        });

        async function fetchHeaderData() {
            try {
                const profRes = await fetch(`${API_BASE_URL}/api/auth/profile`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (profRes.ok) {
                    const profData = await profRes.json();
                    const user = profData.user;
                    localStorage.setItem("kittyverse_user", JSON.stringify(user));
                    updateHeaderUI(user);
                    const welcomeHeader = document.getElementById("welcomeHeader");
                    if (welcomeHeader) welcomeHeader.textContent = `Good morning, ${user.name || "Shelter Admin"}!`;
                }

                const animRes = await fetch(`${API_BASE_URL}/api/animals`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const animals = animRes.ok ? await animRes.json() : [];

                const adoptionsRes = await fetch(`${API_BASE_URL}/api/adoptions`, {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                const adoptions = adoptionsRes.ok ? await adoptionsRes.json() : [];

                const notificationBadge = document.getElementById("notificationBadge");
                const notificationList = document.getElementById("notificationList");
                if (notificationList) {
                    notificationList.innerHTML = "";
                    let notifications = [];

                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    animals.forEach(cat => {
                        const created = new Date(cat.createdAt);
                        if (created >= sevenDaysAgo) {
                            notifications.push({
                                icon: "pets",
                                title: "New rescue added",
                                desc: `${cat.name} was registered at ${cat.location || 'Shelter'}.`,
                                date: created
                            });
                        }
                        if (cat.adoptionStatus === "Under Treatment") {
                            notifications.push({
                                icon: "medical_services",
                                title: "Cat under treatment",
                                desc: `${cat.name} is undergoing treatment.`,
                                date: new Date(cat.updatedAt)
                            });
                        }
                        if (cat.vaccinationStatus !== "Vaccinated") {
                            notifications.push({
                                icon: "vaccines",
                                title: "Vaccination due",
                                desc: `${cat.name} has a pending vaccination.`,
                                date: new Date(cat.updatedAt)
                            });
                        }
                    });

                    adoptions.forEach(ad => {
                        const adDate = new Date(ad.updatedAt || ad.createdAt);
                        const catName = ad.animal ? ad.animal.name : "Cat";
                        if (ad.status === "pending") {
                            notifications.push({
                                icon: "pending_actions",
                                title: "Pending adoption request",
                                desc: `A new request for ${catName} requires review.`,
                                date: adDate
                            });
                        } else if (ad.status === "approved") {
                            notifications.push({
                                icon: "check_circle",
                                title: "Adoption approved",
                                desc: `Request for ${catName} has been approved.`,
                                date: adDate
                            });
                        }
                    });

                    notifications.sort((a, b) => b.date - a.date);

                    if (notificationBadge) {
                        if (notifications.length > 0) {
                            notificationBadge.textContent = notifications.length;
                            notificationBadge.classList.remove("hidden");
                        } else {
                            notificationBadge.classList.add("hidden");
                        }
                    }

                    const getRelativeTime = (date) => {
                        const now = new Date();
                        const diffMs = now - date;
                        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                        if (diffDays <= 0) return "Today";
                        if (diffDays === 1) return "Yesterday";
                        return `${diffDays} days ago`;
                    };

                    if (notifications.length === 0) {
                        notificationList.innerHTML = `
                            <div class="px-4 py-3 text-center text-xs text-secondary font-medium">
                                No new notifications.
                            </div>
                        `;
                    } else {
                        notifications.forEach(n => {
                            const item = document.createElement("div");
                            item.className = "px-4 py-3 hover:bg-surface-container-low transition-colors flex gap-sm items-start";
                            item.innerHTML = `
                                <span class="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5" data-icon="${n.icon}">${n.icon}</span>
                                <div class="flex-1 min-w-0">
                                    <div class="flex justify-between items-start">
                                        <p class="font-label-sm text-xs font-bold text-on-surface truncate">${n.title}</p>
                                        <span class="text-[9px] text-secondary font-medium shrink-0 ml-2">${getRelativeTime(n.date)}</span>
                                    </div>
                                    <p class="text-[11px] text-secondary mt-0.5 leading-relaxed">${n.desc}</p>
                                </div>
                            `;
                            notificationList.appendChild(item);
                        });
                    }
                }
            } catch (err) {
                console.error("Header data load error:", err);
            }
        }

        fetchHeaderData();
    }
});
