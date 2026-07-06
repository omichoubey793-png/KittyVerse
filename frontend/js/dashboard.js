// ==========================================
// KittyVerse - Dynamic Dashboard Controller
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Session check
    const token = localStorage.getItem("kittyverse_token");
    const userStr = localStorage.getItem("kittyverse_user");

    if (!token || !userStr) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(userStr);

    const welcomeHeader = document.getElementById("welcomeHeader");
    if (welcomeHeader) {
        welcomeHeader.textContent = `Good morning, ${currentUser.name || "Shelter Admin"}!`;
    }

    const recentActivityContainer = document.querySelector(".space-y-xl.relative");
    const priorityVaccinesContainer = document.querySelector(".space-y-md");

    // 2. Fetch and render stats & lists
    async function loadDashboard() {
        try {
            const getRelativeTime = (date) => {
                const now = new Date();
                const diffMs = now - date;
                const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
                if (diffDays <= 0) return "Today";
                if (diffDays === 1) return "Yesterday";
                return `${diffDays} days ago`;
            };

            // Fetch dashboard stats from backend
            const statsRes = await fetch(`${API_BASE_URL}/api/dashboard`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!statsRes.ok) throw new Error("Failed to load dashboard stats.");
            const stats = await statsRes.json();

            // Update KPI values on UI
            const kpiTotalCats = document.getElementById("kpiTotalCats");
            const kpiAvailableCats = document.getElementById("kpiAvailableCats");
            const kpiAdoptedCats = document.getElementById("kpiAdoptedCats");
            const kpiPendingAdoption = document.getElementById("kpiPendingAdoption");
            const kpiUnderTreatment = document.getElementById("kpiUnderTreatment");
            const kpiVaccinatedCats = document.getElementById("kpiVaccinatedCats");
            const kpiNewRescues = document.getElementById("kpiNewRescues");

            if (kpiTotalCats) kpiTotalCats.textContent = stats.totalAnimals;
            if (kpiAvailableCats) kpiAvailableCats.textContent = stats.availableAnimals;
            if (kpiAdoptedCats) kpiAdoptedCats.textContent = stats.adoptedAnimals;
            if (kpiPendingAdoption) kpiPendingAdoption.textContent = stats.pendingAdoptions;
            if (kpiUnderTreatment) kpiUnderTreatment.textContent = stats.underTreatment;
            if (kpiVaccinatedCats) kpiVaccinatedCats.textContent = stats.vaccinated;
            if (kpiNewRescues) kpiNewRescues.textContent = stats.newRescues;

            // Fetch animals list for recent activities & priority list
            const animRes = await fetch(`${API_BASE_URL}/api/animals`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (!animRes.ok) throw new Error("Failed to load rescues.");
            const animals = await animRes.json();

            // Fetch adoptions list for notifications
            const adoptionsRes = await fetch(`${API_BASE_URL}/api/adoptions`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            const adoptions = adoptionsRes.ok ? await adoptionsRes.json() : [];

            // Populate Fanny AI summary widget
            const fannySummaryText = document.getElementById("fannySummaryText");
            if (fannySummaryText) {
                const underTreatment = stats.underTreatment || 0;
                const waitingApproval = stats.pendingAdoptions || 0;
                const availableCats = stats.availableAnimals || 0;
                const pendingVaccinations = animals.filter(a => a.vaccinationStatus !== "Vaccinated").length;
                const occupancyStatus = stats.totalAnimals > 50 ? "Shelter occupancy is high." : "Shelter occupancy is healthy.";
                const criticalAlerts = animals.filter(a => a.healthStatus === "Critical").length;
                const alertText = criticalAlerts > 0 ? `Alert: ${criticalAlerts} critical cases.` : "No critical alerts today.";

                fannySummaryText.innerHTML = `Fanny's dynamic scan: Currently, <strong>${underTreatment}</strong> cats are under treatment, <strong>${waitingApproval}</strong> adoptions are pending approval, and <strong>${availableCats}</strong> cats are available. There are <strong>${pendingVaccinations}</strong> pending vaccinations. ${occupancyStatus} ${alertText}`;
            }

            // Populate Priority Vaccines List
            if (priorityVaccinesContainer) {
                priorityVaccinesContainer.innerHTML = "";
                const dueCats = animals.filter(cat => 
                    cat.vaccinationStatus !== "Vaccinated" ||
                    cat.adoptionStatus === "Under Treatment" ||
                    cat.healthStatus !== "Healthy"
                );

                if (dueCats.length === 0) {
                    priorityVaccinesContainer.innerHTML = `
                        <div class="text-center text-xs text-secondary py-md font-medium">
                            All cats are up to date.
                        </div>
                    `;
                } else {
                    dueCats.slice(0, 3).forEach((cat, index) => {
                        const row = document.createElement("div");
                        row.className = "flex items-center gap-md p-2 rounded-xl hover:bg-orange-50/50 transition-colors";
                        
                        const img = cat.imageUrl || "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=100&auto=format&fit=crop";
                        
                        let checkType = "Routine Checkup";
                        if (cat.vaccinationStatus !== "Vaccinated") {
                            checkType = "Vaccine Due";
                        } else if (cat.adoptionStatus === "Under Treatment") {
                            checkType = "Clinical Treatment";
                        } else if (cat.healthStatus !== "Healthy") {
                            checkType = "Health Inspection";
                        }

                        const priority = cat.healthStatus === "Critical" ? "Critical" : "High Priority";
                        const priorityColor = cat.healthStatus === "Critical" ? "text-error" : "text-amber-600";

                        row.innerHTML = `
                            <img class="w-12 h-12 rounded-xl object-cover" src="${img}" alt="${cat.name}"/>
                            <div class="flex-1">
                                <p class="font-label-md text-sm font-bold">${cat.name}</p>
                                <p class="font-label-sm text-xs text-secondary font-medium">${checkType}</p>
                            </div>
                            <div class="text-right">
                                <span class="block font-label-sm text-xs ${priorityColor} font-bold">${priority}</span>
                                <span class="font-label-sm text-[10px] text-secondary">Tomorrow</span>
                            </div>
                        `;
                        priorityVaccinesContainer.appendChild(row);

                        if (index < Math.min(dueCats.length, 3) - 1) {
                            const sep = document.createElement("div");
                            sep.className = "h-px bg-outline-variant/30";
                            priorityVaccinesContainer.appendChild(sep);
                        }
                    });
                }
            }

            // Populate Recent Activity Feed
            if (recentActivityContainer) {
                recentActivityContainer.innerHTML = `
                    <div class="absolute left-[11px] top-4 bottom-4 w-px bg-outline-variant/30"></div>
                `;

                let events = [];
                animals.forEach(cat => {
                    // Intake event
                    events.push({
                        date: new Date(cat.createdAt),
                        icon: "pets",
                        colorClass: "bg-[#FF914D]",
                        title: `New intake: ${cat.name}`,
                        desc: `${cat.name} (${cat.breed || 'Unknown breed'}) was rescued. Health: ${cat.healthStatus}.`,
                        imageUrl: cat.imageUrl,
                        catId: cat._id
                    });

                    // History events
                    if (cat.history && Array.isArray(cat.history)) {
                        cat.history.forEach(h => {
                            let icon = "info";
                            let colorClass = "bg-primary-container";
                            if (h.status === "Adopted") {
                                icon = "volunteer_activism";
                                colorClass = "bg-green-500";
                            } else if (h.status === "Healthy") {
                                icon = "check_circle";
                                colorClass = "bg-tertiary-container";
                            } else if (h.status === "Under Treatment") {
                                icon = "medical_services";
                                colorClass = "bg-error";
                            }

                            events.push({
                                date: new Date(h.updatedAt),
                                icon: icon,
                                colorClass: colorClass,
                                title: `${cat.name}: ${h.status}`,
                                desc: h.notes || `Status updated to ${h.status}.`,
                                imageUrl: cat.imageUrl,
                                catId: cat._id
                            });
                        });
                    }
                });

                events.sort((a, b) => b.date - a.date);

                if (events.length === 0) {
                    const emptyItem = document.createElement("div");
                    emptyItem.className = "text-center text-xs text-secondary py-lg font-medium";
                    emptyItem.textContent = "No recent intake activities found.";
                    recentActivityContainer.appendChild(emptyItem);
                } else {
                    events.slice(0, 3).forEach((ev, index) => {
                        const item = document.createElement("div");
                        item.className = "flex gap-lg relative transition-all duration-300 hover:translate-x-1";

                        let catWidgetHTML = "";
                        if (index === 0 && ev.imageUrl) {
                            catWidgetHTML = `
                                <div class="flex items-center gap-sm p-sm bg-surface-container rounded-xl w-fit mt-md border border-outline-variant/30">
                                    <img class="w-10 h-10 rounded-lg object-cover" src="${ev.imageUrl}" alt="${ev.title}"/>
                                    <div class="pr-md">
                                        <p class="font-label-sm text-xs font-bold text-text-main">${ev.title.split(':')[0]}</p>
                                        <p class="font-label-sm text-[10px] text-secondary">Intake Activity</p>
                                    </div>
                                </div>
                            `;
                        }

                        item.innerHTML = `
                            <div class="w-6 h-6 rounded-full ${ev.colorClass} flex items-center justify-center z-10 text-white shadow-sm shrink-0">
                                <span class="material-symbols-outlined text-[12px]">${ev.icon}</span>
                            </div>
                            <div class="flex-1 pb-4">
                                <div class="flex justify-between items-start mb-sm">
                                    <h4 class="font-label-md text-sm font-bold">${ev.title}</h4>
                                    <span class="font-label-sm text-xs text-secondary">${getRelativeTime(ev.date)}</span>
                                </div>
                                <p class="font-body-md text-xs text-secondary leading-relaxed">${ev.desc}</p>
                                ${catWidgetHTML}
                            </div>
                        `;
                        recentActivityContainer.appendChild(item);
                    });
                }
            }



        } catch (error) {
            console.error("Dashboard error:", error);
        }
    }

    // Initial Load
    loadDashboard();
});