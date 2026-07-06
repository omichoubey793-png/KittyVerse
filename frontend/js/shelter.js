// =====================================
// KittyVerse - Shelter Management Logic
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    // DOM selectors
    const searchInput = document.getElementById("searchInput");
    const filterBtns = document.querySelectorAll(".filter-btn");
    const shelterCatsContainer = document.getElementById("shelterCatsContainer");
    
    const cntAll = document.getElementById("cntAll");
    const cntHealthy = document.getElementById("cntHealthy");
    const cntTreatment = document.getElementById("cntTreatment");
    const cntReady = document.getElementById("cntReady");
    const cntAdopted = document.getElementById("cntAdopted");
    const paginationCount = document.getElementById("paginationCount");

    const gridToggleBtn = document.getElementById("gridToggleBtn");
    const listToggleBtn = document.getElementById("listToggleBtn");

    // Profile Drawer DOM Elements
    const overlay = document.getElementById("profileDrawerOverlay");
    const drawer = document.getElementById("profileDrawer");
    const closeBtnTop = document.getElementById("closeDrawerBtnTop");
    const closeBtnBottom = document.getElementById("closeDrawerBtn");
    
    // Header section elements
    const dImage = document.getElementById("drawerCatImage");
    const dName = document.getElementById("drawerCatName");
    const dBreed = document.getElementById("drawerCatBreed");
    const dGender = document.getElementById("drawerCatGender");
    const dAge = document.getElementById("drawerCatAge");
    const dWeight = document.getElementById("drawerCatWeight");
    const dHealth = document.getElementById("drawerCatHealth");
    const dVax = document.getElementById("drawerCatVax");
    const dAdoption = document.getElementById("drawerCatAdoption");

    // Info section elements
    const dInfoRescueDate = document.getElementById("drawerInfoRescueDate");
    const dInfoRescueLocation = document.getElementById("drawerInfoRescueLocation");
    const dInfoShelterID = document.getElementById("drawerInfoShelterID");
    const dInfoMicrochip = document.getElementById("drawerInfoMicrochip");
    const dInfoVolunteer = document.getElementById("drawerInfoVolunteer");
    const dInfoArea = document.getElementById("drawerInfoArea");

    // Medical summary elements
    const dMedCheckup = document.getElementById("drawerMedCheckup");
    const dMedVaxStatus = document.getElementById("drawerMedVaxStatus");
    const dMedNextVax = document.getElementById("drawerMedNextVax");
    const dMedTreatment = document.getElementById("drawerMedTreatment");
    const dMedAllergies = document.getElementById("drawerMedAllergies");
    const dMedDiet = document.getElementById("drawerMedDiet");
    const drawerMedicalTimeline = document.getElementById("drawerMedicalTimeline");
    const drawerAiInsightsContent = document.getElementById("drawerAiInsightsContent");

    // Quick Actions buttons
    const actionEditCat = document.getElementById("actionEditCat");
    const actionExportReport = document.getElementById("actionExportReport");
    const actionScheduleVax = document.getElementById("actionScheduleVax");
    const actionReadyAdoption = document.getElementById("actionReadyAdoption");

    // Add Cat Modal DOM Elements
    const addCatModalOverlay = document.getElementById("addCatModalOverlay");
    const addCatModal = document.getElementById("addCatModal");
    const addCatForm = document.getElementById("addCatForm");
    const cancelAddCatBtn = document.getElementById("cancelAddCatBtn");
    const saveCatBtn = document.getElementById("saveCatBtn");
    const successToast = document.getElementById("successToast");

    // Drag and drop inputs
    const dropZone = document.getElementById("dropZone");
    const catPhotoInput = document.getElementById("catPhotoInput");
    const photoPreviewContainer = document.getElementById("photoPreviewContainer");
    const photoPreview = document.getElementById("photoPreview");
    const removePhotoBtn = document.getElementById("removePhotoBtn");

    // Delete Confirmation DOM Elements
    const actionDeleteCat = document.getElementById("actionDeleteCat");
    const deleteConfirmOverlay = document.getElementById("deleteConfirmOverlay");
    const deleteConfirmDialog = document.getElementById("deleteConfirmDialog");
    const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
    const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

    // Report Preview DOM Elements
    const reportLoadingOverlay = document.getElementById("reportLoadingOverlay");
    const reportPreviewOverlay = document.getElementById("reportPreviewOverlay");
    const reportPreviewDialog = document.getElementById("reportPreviewDialog");
    const pdfReportContent = document.getElementById("pdfReportContent");
    const closeReportBtn = document.getElementById("closeReportBtn");
    const downloadReportBtn = document.getElementById("downloadReportBtn");
    const printReportBtn = document.getElementById("printReportBtn");

    // Vaccination Management DOM Elements
    const btnOpenScheduleVax = document.getElementById("btnOpenScheduleVax");
    const drawerVaxHistoryContainer = document.getElementById("drawerVaxHistoryContainer");
    const scheduleVaxOverlay = document.getElementById("scheduleVaxOverlay");
    const scheduleVaxModal = document.getElementById("scheduleVaxModal");
    const scheduleVaxForm = document.getElementById("scheduleVaxForm");
    const cancelScheduleVaxBtn = document.getElementById("cancelScheduleVaxBtn");
    const submitScheduleVaxBtn = document.getElementById("submitScheduleVaxBtn");

    let allAnimals = [];
    let currentFilter = "all";
    let searchQuery = "";
    let currentView = "grid"; // 'grid' or 'list'
    let editingCatId = null;
    let deletingCatId = null;
    let catVaccinations = {};
    let currentProfileCatId = null;

    // 1. Fetch live data from backend API
    async function loadShelterData() {
        try {
            const token = localStorage.getItem("kittyverse_token");
            const response = await fetch(`${API_BASE_URL}/api/animals`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            if (!response.ok) throw new Error("Could not fetch animals list.");
            allAnimals = await response.json();

            updateCategoryCounts();
            renderAnimalsList();
        } catch (error) {
            console.error("Shelter loading error:", error);
            if (shelterCatsContainer) {
                renderEmptyState(true);
            }
        }
    }

    // 2. Compute dynamic stats counts based on the updated seed database
    function updateCategoryCounts() {
        const counts = {
            all: allAnimals.length,
            healthy: allAnimals.filter(a => a.healthStatus === "Healthy").length,
            treatment: allAnimals.filter(a => a.healthStatus === "Under Observation" || a.healthStatus === "Under Treatment").length,
            vaccinated: allAnimals.filter(a => a.vaccinationStatus === "Vaccinated").length,
            adopted: allAnimals.filter(a => a.healthStatus === "Adopted" || a.adoptionStatus === "Adopted").length
        };

        // Standard Starting metrics from original design + live dynamic database
        if (cntAll) cntAll.textContent = counts.all;
        if (cntHealthy) cntHealthy.textContent = counts.healthy;
        if (cntTreatment) cntTreatment.textContent = counts.treatment;
        if (cntReady) cntReady.textContent = counts.vaccinated;
        if (cntAdopted) cntAdopted.textContent = counts.adopted;
    }

    // Render Empty State
    function renderEmptyState(isError = false) {
        if (!shelterCatsContainer) return;
        
        const messageTitle = isError ? "Failed to connect" : "No rescued cats yet.";
        const messageDesc = isError ? "Make sure your backend API server is running on port 5000." : "Start by adding your first rescued cat.";
        
        shelterCatsContainer.innerHTML = `
            <div class="col-span-full flex flex-col items-center justify-center p-12 text-center border border-outline-variant/30 rounded-[32px] bg-white soft-shadow max-w-md mx-auto my-8">
                <span class="material-symbols-outlined text-5xl text-[#FF914D] mb-md" data-icon="pets">pets</span>
                <h3 class="font-headline-md text-headline-md font-bold text-[#2B2B2B] mb-2">${messageTitle}</h3>
                <p class="font-body-md text-body-md text-[#687280] mb-6">${messageDesc}</p>
                <button onclick="openAddCatModal()" class="px-8 py-3.5 bg-[#FF914D] hover:bg-[#ff8033] text-white rounded-[20px] font-semibold transition-all active:scale-[0.98] shadow-sm flex items-center justify-center gap-2">
                    <span class="material-symbols-outlined">add</span>
                    Add Cat
                </button>
            </div>
        `;
    }

    // 3. Render Cards List
    function renderAnimalsList() {
        if (!shelterCatsContainer) return;
        shelterCatsContainer.innerHTML = "";

        // Apply health status filter chips
        let filtered = allAnimals.filter(cat => {
            if (currentFilter !== "all") {
                if (currentFilter === "Adopted") {
                    return cat.healthStatus === "Adopted" || cat.adoptionStatus === "Adopted";
                } else if (currentFilter === "Vaccinated") {
                    return cat.vaccinationStatus === "Vaccinated";
                } else if (currentFilter === "Healthy") {
                    return cat.healthStatus === "Healthy";
                } else if (currentFilter === "Under Treatment") {
                    return cat.healthStatus === "Under Observation";
                } else {
                    return cat.healthStatus === currentFilter;
                }
            }
            return true;
        });

        // Apply text queries (by name, breed or microchip)
        if (searchQuery) {
            filtered = filtered.filter(cat => {
                const name = (cat.name || "").toLowerCase();
                const breed = (cat.breed || "").toLowerCase();
                const microchip = (cat.color || "").toLowerCase();
                const location = (cat.location || "").toLowerCase();
                const q = searchQuery.toLowerCase();
                return name.includes(q) || breed.includes(q) || microchip.includes(q) || location.includes(q);
            });
        }

        // Adjust class layouts based on toggled state (Grid vs List)
        if (currentView === "grid") {
            shelterCatsContainer.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-xl";
        } else {
            shelterCatsContainer.className = "flex flex-col gap-md w-full";
        }

        // Update Pagination Counter description
        if (paginationCount) {
            paginationCount.textContent = `Manage rescued cats and monitor their health (${filtered.length} cats total).`;
        }

        // Render clean Apple/Notion style empty state
        if (filtered.length === 0) {
            renderEmptyState(false);
            return;
        }

        filtered.forEach(cat => {
            const defaultImg = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop";
            const img = cat.imageUrl || defaultImg;

            // Formatted Rescue Date (createdAt field)
            const rescueDate = cat.createdAt 
                ? new Date(cat.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
                : 'Jun 12, 2026';

            // Consistent Health Status Badges
            let badgeColor = "bg-green-100 text-green-800";
            let statusLabel = cat.healthStatus || "Healthy";

            if (cat.healthStatus === "Under Observation") {
                badgeColor = "bg-amber-100 text-amber-800";
            } else if (cat.healthStatus === "Ready for Adoption") {
                badgeColor = "bg-orange-50 text-[#FF914D] border border-orange-100";
            } else if (cat.healthStatus === "Adopted" || cat.adoptionStatus === "Adopted") {
                badgeColor = "bg-blue-100 text-blue-800";
                statusLabel = "Adopted";
            }

            // Vaccination status
            let vaxColor = "text-emerald-600 bg-emerald-50";
            if (cat.vaccinationStatus === "Pending Booster") {
                vaxColor = "text-amber-600 bg-amber-50";
            } else if (cat.vaccinationStatus === "First Dose Only") {
                vaxColor = "text-red-600 bg-red-50";
            }
            const vaxBadge = `
                <span class="inline-flex items-center gap-1 text-[11px] font-semibold ${vaxColor} px-2.5 py-0.5 rounded-full">
                    <span class="material-symbols-outlined text-[12px] font-bold">verified</span> ${cat.vaccinationStatus || "Vaccinated"}
                </span>
            `;

            if (currentView === "grid") {
                const card = document.createElement("div");
                card.id = `cat-card-${cat._id}`;
                card.className = "group bg-white rounded-[32px] overflow-hidden border border-[#F5F5F5] transition-all duration-300 hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between cursor-pointer";
                
                card.addEventListener("click", (e) => {
                    if (e.target.closest("button")) return;
                    openProfileDrawer(cat._id);
                });

                card.innerHTML = `
                    <div class="relative h-64 overflow-hidden bg-orange-50/20">
                        <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${img}" alt="${cat.name}"/>
                        <div class="absolute top-md right-md">
                            <span class="${badgeColor} backdrop-blur-md px-md py-xs rounded-full font-label-sm text-label-sm font-semibold shadow-sm">${statusLabel}</span>
                        </div>
                    </div>
                    <div class="p-lg flex-1 flex flex-col justify-between gap-md">
                        <div class="space-y-2">
                            <div class="flex justify-between items-start">
                                <h3 class="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">${cat.name}</h3>
                            </div>
                            <p class="font-body-md text-sm text-[#687280] font-medium">${cat.breed || 'Unknown Breed'} • ${cat.age} yr${cat.age !== 1 ? 's' : ''} • ${cat.gender}</p>
                            
                            <!-- Location, Badges & Rescue Date -->
                            <div class="flex flex-col gap-1.5 pt-1">
                                <div class="flex items-center gap-2">
                                    ${vaxBadge}
                                </div>
                                <p class="text-[11px] text-[#687280] font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[13px] text-secondary">location_on</span>
                                    Location: ${cat.location || "Seattle"}
                                </p>
                                <p class="text-[11px] text-[#687280] font-medium flex items-center gap-1">
                                    <span class="material-symbols-outlined text-[13px] text-secondary">calendar_today</span>
                                    Rescue Date: ${rescueDate}
                                </p>
                            </div>
                        </div>
                        
                        <!-- View Profile Button -->
                        <div class="flex gap-sm border-t border-[#F5F5F5] pt-md mt-auto">
                            <button onclick="window.openProfileDrawer('${cat._id}')" class="w-full py-3 bg-[#FFF4EB] hover:bg-[#FF914D] text-[#FF914D] hover:text-white font-bold text-xs rounded-xl transition-all duration-200">
                                View Profile
                            </button>
                        </div>
                    </div>
                `;
                shelterCatsContainer.appendChild(card);
            } else {
                // List View Card
                const row = document.createElement("div");
                row.id = `cat-card-${cat._id}`;
                row.className = "group bg-white rounded-[24px] p-4 border border-[#F5F5F5] transition-all duration-300 hover:shadow-md flex flex-col sm:flex-row items-center gap-4 w-full cursor-pointer";
                row.addEventListener("click", (e) => {
                    if (e.target.closest("button")) return;
                    openProfileDrawer(cat._id);
                });
                row.innerHTML = `
                    <img class="w-20 h-20 rounded-xl object-cover shrink-0" src="${img}" alt="${cat.name}"/>
                    <div class="flex-1 text-center sm:text-left">
                        <div class="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
                            <h3 class="font-bold text-base text-text-main">${cat.name}</h3>
                            <span class="${badgeColor} text-[10px] font-semibold px-2 py-0.5 rounded-full w-fit mx-auto sm:mx-0">${statusLabel}</span>
                        </div>
                        <p class="text-xs text-[#687280] font-medium mb-1">${cat.breed || 'Unknown Breed'} • ${cat.age} yr${cat.age !== 1 ? 's' : ''} • ${cat.gender} • ${rescueDate} • ${cat.location}</p>
                        <div class="flex items-center justify-center sm:justify-start gap-2">${vaxBadge}</div>
                    </div>
                    <div class="flex items-center gap-3 border-t sm:border-t-0 border-orange-50 pt-3 sm:pt-0 w-full sm:w-auto justify-center">
                        <button onclick="window.openProfileDrawer('${cat._id}')" class="bg-orange-50 text-primary font-semibold text-xs px-5 py-2.5 rounded-xl hover:bg-primary hover:text-white transition-all font-semibold">View Profile</button>
                    </div>
                `;
                shelterCatsContainer.appendChild(row);
            }
        });
    }

    // 4. Sliding Drawer opening and closing logic
    function openProfileDrawer(catId) {
        currentProfileCatId = catId;
        const cat = allAnimals.find(a => a._id === catId);
        if (!cat) return;

        // Initialize vaccine list for this cat if not present
        if (!catVaccinations[catId]) {
            const baseDate = cat.createdAt ? new Date(cat.createdAt) : new Date();
            const formatVaxDate = (d) => {
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
            };
            const addDays = (d, days) => {
                const result = new Date(d);
                result.setDate(result.getDate() + days);
                return result;
            };

            catVaccinations[catId] = [
                {
                    name: "Rabies",
                    status: "Completed",
                    date: formatVaxDate(addDays(baseDate, 4)),
                    dueDate: formatVaxDate(addDays(baseDate, 369)),
                    vet: "Dr. Sarah Jenkins",
                    badgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-100"
                },
                {
                    name: "FVRCP",
                    status: "Completed",
                    date: formatVaxDate(addDays(baseDate, 12)),
                    dueDate: formatVaxDate(addDays(baseDate, 377)),
                    vet: "Dr. Alex Rivera",
                    badgeStyle: "text-emerald-700 bg-emerald-50 border-emerald-100"
                },
                {
                    name: "Booster",
                    status: "Due in 5 Days",
                    date: "Pending",
                    dueDate: formatVaxDate(addDays(baseDate, 5)),
                    vet: "Dr. David Kim",
                    badgeStyle: "text-amber-700 bg-amber-50 border-amber-100"
                }
            ];
        }

        renderVaccineHistory(catId);

        const defaultImg = "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=350&auto=format&fit=crop";
        dImage.src = cat.imageUrl || defaultImg;
        dName.textContent = cat.name;
        dBreed.textContent = cat.breed || "Unknown Breed";
        dGender.textContent = cat.gender;
        dAge.textContent = `${cat.age} Yr${cat.age !== 1 ? 's' : ''}`;
        
        // Weight calculation
        const weightVal = cat.color && cat.color.includes("kg") ? cat.color : `${(Math.random() * 2 + 3).toFixed(1)} kg`;
        dWeight.textContent = weightVal;
        
        // Health status badge
        dHealth.textContent = cat.healthStatus || "Healthy";
        dHealth.className = "inline-block text-xs font-semibold px-3 py-1 rounded-full ";
        if (cat.healthStatus === "Under Observation") {
            dHealth.className += "bg-amber-100 text-amber-800";
        } else if (cat.healthStatus === "Ready for Adoption") {
            dHealth.className += "bg-orange-50 text-[#FF914D] border border-orange-100";
        } else if (cat.healthStatus === "Adopted" || cat.adoptionStatus === "Adopted") {
            dHealth.className += "bg-blue-100 text-blue-800";
        } else {
            dHealth.className += "bg-green-100 text-green-800";
        }

        // Vaccination badge
        dVax.textContent = cat.vaccinationStatus || "Vaccinated";
        dVax.className = "inline-block text-xs font-semibold px-3 py-1 rounded-full ";
        if (cat.vaccinationStatus === "Pending Booster") {
            dVax.className += "bg-amber-50 text-amber-600";
        } else if (cat.vaccinationStatus === "First Dose Only") {
            dVax.className += "bg-red-50 text-red-600";
        } else {
            dVax.className += "bg-emerald-50 text-emerald-600";
        }

        // Adoption status badge
        dAdoption.textContent = cat.adoptionStatus || "Available";
        dAdoption.className = "inline-block text-xs font-semibold px-3 py-1 rounded-full ";
        if (cat.adoptionStatus === "Adopted") {
            dAdoption.className += "bg-blue-50 text-blue-600";
        } else if (cat.adoptionStatus === "Pending") {
            dAdoption.className += "bg-yellow-50 text-yellow-600";
        } else {
            dAdoption.className += "bg-orange-50 text-[#FF914D] border border-orange-100";
        }

        // INFORMATION fields
        const rescueDateVal = cat.createdAt 
            ? new Date(cat.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
            : 'Jun 12, 2026';
        dInfoRescueDate.textContent = rescueDateVal;
        dInfoRescueLocation.textContent = cat.location || "Not Provided";
        
        // Consistent IDs
        const hex = cat._id.toString();
        dInfoShelterID.textContent = `KV-${hex.substring(hex.length - 6).toUpperCase()}`;
        dInfoMicrochip.textContent = cat.microchip || "Not Registered";
        
        // Volunteer & Area
        dInfoVolunteer.textContent = cat.volunteer || "Not Assigned";
        dInfoArea.textContent = cat.area || "Not Assigned";

        // MEDICAL SUMMARY section
        dMedCheckup.textContent = cat.lastCheckup || "Not Recorded";
        dMedVaxStatus.textContent = cat.vaccinationStatus || "Not Provided";
        dMedNextVax.textContent = cat.nextVaccination || "Not Scheduled";
        dMedTreatment.textContent = cat.treatment || "None";
        dMedAllergies.textContent = cat.allergies || "None Reported";
        dMedDiet.textContent = cat.diet || "Standard Diet";

        // MEDICAL TIMELINE section
        const baseDate = cat.createdAt ? new Date(cat.createdAt) : new Date();
        const formatTimelineDate = (d) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };
        const addDays = (d, days) => {
            const result = new Date(d);
            result.setDate(result.getDate() + days);
            return result;
        };

        const timelineEvents = [
            {
                icon: "🐾",
                title: "Rescue Intake",
                desc: `Rescued from ${cat.location || "Downtown Street"}`,
                date: formatTimelineDate(baseDate),
                vet: "Dr. Sarah Jenkins"
            },
            {
                icon: "💉",
                title: "Rabies Vaccination",
                desc: "Rabies vaccine administered",
                date: formatTimelineDate(addDays(baseDate, 4)),
                vet: "Dr. Alex Rivera"
            },
            {
                icon: "🩺",
                title: "Health Check",
                desc: "Routine examination completed",
                date: formatTimelineDate(addDays(baseDate, 12)),
                vet: "Dr. Sarah Jenkins"
            }
        ];

        if (cat.healthStatus === "Under Observation" || cat.healthStatus === "Under Treatment" || cat.healthStatus === "Observation") {
            timelineEvents.push({
                icon: "💊",
                title: "Medication",
                desc: "Antibiotic treatment started",
                date: formatTimelineDate(addDays(baseDate, 15)),
                vet: "Dr. Alex Rivera"
            });
        } else {
            timelineEvents.push({
                icon: "💊",
                title: "Medication",
                desc: "Antibiotic treatment started",
                date: formatTimelineDate(addDays(baseDate, 15)),
                vet: "Dr. Alex Rivera"
            });
            timelineEvents.push({
                icon: "❤️",
                title: "Recovery",
                desc: "Returned to Healthy status",
                date: formatTimelineDate(addDays(baseDate, 24)),
                vet: "Dr. David Kim"
            });
        }

        if (drawerMedicalTimeline) {
            drawerMedicalTimeline.innerHTML = "";
            timelineEvents.forEach((ev, index) => {
                const cardBg = index % 2 === 0 ? "bg-white" : "bg-[#FFFBF7]";
                const itemHtml = `
                    <div class="relative pl-2 animate-fade-up" style="animation-delay: ${index * 80}ms">
                        <!-- Orange Timeline Node Dot -->
                        <span class="absolute -left-[24px] top-4 w-3.5 h-3.5 rounded-full bg-[#FF914D] border-2 border-white box-content shadow-sm flex items-center justify-center"></span>
                        
                        <!-- Timeline Card -->
                        <div class="${cardBg} p-md rounded-[20px] border border-orange-100/50 shadow-sm space-y-1 transition-all duration-300 hover:shadow-md hover:border-orange-200">
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-2">
                                    <span class="text-base">${ev.icon}</span>
                                    <h5 class="text-xs font-bold text-text-main">${ev.title}</h5>
                                </div>
                                <span class="text-[10px] text-secondary font-medium">${ev.date}</span>
                            </div>
                            <p class="text-xs text-secondary leading-relaxed">${ev.desc}</p>
                            ${ev.vet ? `
                            <div class="flex items-center gap-1 pt-1 border-t border-orange-50/50 mt-1">
                                <span class="material-symbols-outlined text-[12px] text-primary">medical_services</span>
                                <span class="text-[10px] text-[#FF914D] font-semibold">${ev.vet}</span>
                            </div>
                            ` : ""}
                        </div>
                    </div>
                `;
                drawerMedicalTimeline.insertAdjacentHTML("beforeend", itemHtml);
            });
        }

        // FANNY AI INSIGHTS section
        if (drawerAiInsightsContent) {
            const isHealthy = cat.healthStatus === "Healthy" || cat.healthStatus === "Ready for Adoption" || cat.healthStatus === "Adopted";
            const riskColor = isHealthy ? "text-emerald-600 bg-emerald-50" : "text-amber-600 bg-amber-50";
            const riskLevel = isHealthy ? "🟢 Low Risk" : "🟡 Moderate Risk";
            const recoveryProgress = isHealthy ? "100%" : "65%";
            const recoveryBarColor = isHealthy ? "bg-emerald-500" : "bg-[#FF914D]";
            
            const overallHealth = isHealthy 
                ? `${cat.name} is recovering well after her recent vaccination. No concerning symptoms have been recorded.`
                : `${cat.name} is showing positive recovery signs from treatment. Maintain close monitoring of vitals.`;

            const vaccination = cat.vaccinationStatus === "Vaccinated" 
                ? "Routine vaccinations are fully complete. Next booster recommended in 12 months."
                : "Booster vaccine is recommended within the next 5 days.";

            const nutrition = (cat.breed || "").includes("Persian")
                ? "Specialized hairball control diet. Add wet food mix for hydration."
                : "Increase protein intake slightly during recovery. Supplement with warm broth.";

            const followUp = isHealthy
                ? "Schedule a wellness check next month."
                : "Schedule a wellness check next week.";

            drawerAiInsightsContent.innerHTML = `
                <div class="space-y-sm text-xs">
                    <div>
                        <p class="font-bold text-text-main uppercase tracking-wider text-[10px]">Overall Health</p>
                        <p class="text-secondary mt-1 leading-relaxed">${overallHealth}</p>
                    </div>

                    <div class="grid grid-cols-2 gap-sm pt-1">
                        <div>
                            <p class="font-bold text-text-main uppercase tracking-wider text-[10px]">Vaccination</p>
                            <p class="text-secondary mt-1 leading-relaxed">${vaccination}</p>
                        </div>
                        <div>
                            <p class="font-bold text-text-main uppercase tracking-wider text-[10px]">Nutrition</p>
                            <p class="text-secondary mt-1 leading-relaxed">${nutrition}</p>
                        </div>
                    </div>

                    <div class="space-y-1 pt-1">
                        <div class="flex justify-between items-center text-[10px] font-bold text-text-main uppercase tracking-wider">
                            <span>Recovery Progress</span>
                            <span>${recoveryProgress}</span>
                        </div>
                        <div class="w-full h-1.5 bg-orange-100/50 rounded-full overflow-hidden">
                            <div class="${recoveryBarColor} h-full transition-all duration-500" style="width: ${recoveryProgress}"></div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-sm pt-2 border-t border-orange-50/50">
                        <div>
                            <p class="font-bold text-text-main uppercase tracking-wider text-[10px]">Risk Level</p>
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full font-bold mt-1 text-[10px] ${riskColor}">
                                ${riskLevel}
                            </span>
                        </div>
                        <div>
                            <p class="font-bold text-text-main uppercase tracking-wider text-[10px]">Follow-up</p>
                            <p class="text-secondary mt-1 leading-relaxed font-semibold text-[10px] text-[#FF914D]">${followUp}</p>
                        </div>
                    </div>
                </div>
            `;
        }

        // Setup AI button handlers
        const aiBtnGenerate = document.getElementById("aiBtnGenerate");
        const aiBtnAsk = document.getElementById("aiBtnAsk");
        const aiBtnSchedule = document.getElementById("aiBtnSchedule");

        if (aiBtnGenerate) {
            aiBtnGenerate.onclick = () => {
                alert(`Generating full Fanny AI Health Report for ${cat.name}... Report compilation in progress.`);
            };
        }
        if (aiBtnAsk) {
            aiBtnAsk.onclick = () => {
                alert(`Starting live chat with Fanny AI regarding ${cat.name}'s recovery plan.`);
            };
        }
        if (aiBtnSchedule) {
            aiBtnSchedule.onclick = () => {
                alert(`Reminder successfully scheduled: Next follow-up for ${cat.name} added to calendar.`);
            };
        }

        if (actionEditCat) {
            actionEditCat.onclick = () => {
                openEditCatModal(cat._id);
            };
        }

        if (actionDeleteCat) {
            actionDeleteCat.onclick = () => {
                openDeleteConfirmation(cat._id);
            };
        }

        if (actionExportReport) {
            actionExportReport.onclick = () => {
                openReportPreviewModal(cat);
            };
        }

        if (actionScheduleVax) {
            actionScheduleVax.onclick = () => {
                openScheduleVaxModal();
            };
        }

        if (actionReadyAdoption) {
            actionReadyAdoption.onclick = async () => {
                try {
                    const token = localStorage.getItem("kittyverse_token");
                    const res = await fetch(`${API_BASE_URL}/api/animals/${cat._id}`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({ adoptionStatus: "Available", healthStatus: "Ready for Adoption" })
                    });
                    if (res.ok) {
                        const updated = await res.json();
                        // Update in local cache
                        const idx = allAnimals.findIndex(a => a._id === cat._id);
                        if (idx !== -1) {
                            allAnimals[idx] = updated;
                        }
                        // Refresh UI
                        updateCategoryCounts();
                        renderAnimalsList();
                        closeProfileDrawer();
                        
                        // Trigger Success toast
                        if (successToast) {
                            successToast.querySelector("span.text-xs").textContent = `${cat.name} is now marked Ready for Adoption!`;
                            successToast.classList.remove("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                            successToast.classList.add("translate-y-0", "opacity-100");
                            setTimeout(() => {
                                successToast.classList.add("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                                successToast.classList.remove("translate-y-0", "opacity-100");
                            }, 3000);
                        }
                    }
                } catch (e) {
                    alert("Unable to update cat status.");
                }
            };
        }

        // Open animation transitions
        if (overlay && drawer) {
            overlay.classList.remove("pointer-events-none", "opacity-0");
            overlay.classList.add("opacity-100");
            drawer.classList.remove("translate-x-full");
        }
    }

    function closeProfileDrawer() {
        if (overlay && drawer) {
            overlay.classList.add("pointer-events-none", "opacity-0");
            overlay.classList.remove("opacity-100");
            drawer.classList.add("translate-x-full");
        }
    }

    // Attach to global window scope
    window.openProfileDrawer = openProfileDrawer;
    window.closeProfileDrawer = closeProfileDrawer;

    if (closeBtnTop) closeBtnTop.addEventListener("click", closeProfileDrawer);
    if (closeBtnBottom) closeBtnBottom.addEventListener("click", closeProfileDrawer);
    if (overlay) {
        overlay.addEventListener("click", (e) => {
            if (e.target === overlay) closeProfileDrawer();
        });
    }

    // 5. Add Cat Modal controllers
    function openAddCatModal() {
        editingCatId = null;
        
        // Reset Modal Title, Subtitle, and Button text
        const modalTitle = addCatModal ? addCatModal.querySelector('h3') : null;
        const modalSubtitle = addCatModal ? addCatModal.querySelector('p') : null;
        if (modalTitle) modalTitle.textContent = "Add New Rescue";
        if (modalSubtitle) modalSubtitle.textContent = "Register a rescued cat into KittyVerse.";
        if (saveCatBtn) saveCatBtn.textContent = "Save Cat";

        if (addCatModalOverlay && addCatModal) {
            addCatModalOverlay.classList.remove("pointer-events-none", "opacity-0");
            addCatModal.classList.remove("scale-95", "opacity-0");
            addCatModal.classList.add("scale-100", "opacity-100");
        }
    }

    function openEditCatModal(catId) {
        editingCatId = catId;
        const cat = allAnimals.find(c => c._id === catId);
        if (!cat) return;

        // Set Title, Subtitle, and Button text
        const modalTitle = addCatModal ? addCatModal.querySelector('h3') : null;
        const modalSubtitle = addCatModal ? addCatModal.querySelector('p') : null;
        if (modalTitle) modalTitle.textContent = "Edit Rescue Profile";
        if (modalSubtitle) modalSubtitle.textContent = "Update registered details for the rescued cat.";
        if (saveCatBtn) saveCatBtn.textContent = "Save Changes";

        // Pre-fill inputs
        addCatForm.querySelector('[name="name"]').value = cat.name || "";
        addCatForm.querySelector('[name="breed"]').value = cat.breed || "";
        addCatForm.querySelector('[name="age"]').value = cat.age || 0;
        addCatForm.querySelector('[name="gender"]').value = cat.gender || "Female";
        addCatForm.querySelector('[name="color"]').value = cat.color || "";
        addCatForm.querySelector('[name="location"]').value = cat.location || "";
        addCatForm.querySelector('[name="healthStatus"]').value = cat.healthStatus || "Healthy";
        addCatForm.querySelector('[name="vaccinationStatus"]').value = cat.vaccinationStatus || "Vaccinated";
        addCatForm.querySelector('[name="adoptionStatus"]').value = cat.adoptionStatus || "Available";
        addCatForm.querySelector('[name="description"]').value = cat.description || "";

        if (cat.createdAt) {
            const d = new Date(cat.createdAt);
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            addCatForm.querySelector('[name="rescueDate"]').value = `${year}-${month}-${day}`;
        } else {
            addCatForm.querySelector('[name="rescueDate"]').value = "";
        }

        // Image Preview
        if (cat.imageUrl) {
            photoPreview.src = cat.imageUrl;
            dropZone.classList.add("hidden");
            photoPreviewContainer.classList.remove("hidden");
        } else {
            resetPhotoPreview();
        }

        // Open Modal
        if (addCatModalOverlay && addCatModal) {
            addCatModalOverlay.classList.remove("pointer-events-none", "opacity-0");
            addCatModal.classList.remove("scale-95", "opacity-0");
            addCatModal.classList.add("scale-100", "opacity-100");
        }
    }

    function closeAddCatModal() {
        if (addCatModalOverlay && addCatModal) {
            addCatModalOverlay.classList.add("pointer-events-none", "opacity-0");
            addCatModal.classList.add("scale-95", "opacity-0");
            addCatModal.classList.remove("scale-100", "opacity-100");
            // Reset form
            if (addCatForm) addCatForm.reset();
            resetPhotoPreview();
        }
    }

    function resetPhotoPreview() {
        if (photoPreviewContainer && dropZone && catPhotoInput) {
            photoPreviewContainer.classList.add("hidden");
            dropZone.classList.remove("hidden");
            catPhotoInput.value = "";
            photoPreview.src = "";
        }
    }

    // Delete Confirmation Dialog controllers
    function openDeleteConfirmation(catId) {
        deletingCatId = catId;
        if (deleteConfirmOverlay && deleteConfirmDialog) {
            deleteConfirmOverlay.classList.remove("pointer-events-none", "opacity-0");
            deleteConfirmDialog.classList.remove("scale-95", "opacity-0");
            deleteConfirmDialog.classList.add("scale-100", "opacity-100");
        }
    }

    function closeDeleteConfirmation() {
        deletingCatId = null;
        if (deleteConfirmOverlay && deleteConfirmDialog) {
            deleteConfirmOverlay.classList.add("pointer-events-none", "opacity-0");
            deleteConfirmDialog.classList.add("scale-95", "opacity-0");
            deleteConfirmDialog.classList.remove("scale-100", "opacity-100");
        }
    }

    if (cancelDeleteBtn) cancelDeleteBtn.addEventListener("click", closeDeleteConfirmation);
    if (deleteConfirmOverlay) {
        deleteConfirmOverlay.addEventListener("click", (e) => {
            if (e.target === deleteConfirmOverlay) closeDeleteConfirmation();
        });
    }

    if (confirmDeleteBtn) {
        confirmDeleteBtn.addEventListener("click", async () => {
            const targetId = deletingCatId;
            if (!targetId) return;

            confirmDeleteBtn.textContent = "Deleting...";
            confirmDeleteBtn.disabled = true;

            try {
                const token = localStorage.getItem("kittyverse_token");
                const response = await fetch(`${API_BASE_URL}/api/animals/${targetId}`, {
                    method: "DELETE",
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || "Failed to delete rescue record.");
                }

                // 1. Get DOM element and animate fade-out
                const cardEl = document.getElementById(`cat-card-${targetId}`);
                if (cardEl) {
                    cardEl.style.transition = "opacity 0.3s ease, transform 0.3s ease";
                    cardEl.style.opacity = "0";
                    cardEl.style.transform = "scale(0.95)";
                }

                // Close Drawer & Close Confirmation Dialog
                closeProfileDrawer();
                closeDeleteConfirmation();

                // Show Success Toast
                if (successToast) {
                    successToast.querySelector("span.text-xs").textContent = "Cat record deleted successfully.";
                    successToast.classList.remove("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                    successToast.classList.add("translate-y-0", "opacity-100");
                    
                    setTimeout(() => {
                        successToast.classList.add("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                        successToast.classList.remove("translate-y-0", "opacity-100");
                    }, 3000);
                }

                // Wait for the fade-out animation to finish, then sync cache and re-render
                setTimeout(() => {
                    const idx = allAnimals.findIndex(a => a._id === targetId);
                    if (idx !== -1) {
                        allAnimals.splice(idx, 1);
                    }
                    updateCategoryCounts();
                    renderAnimalsList();
                }, 300);

            } catch (error) {
                alert(`Error deleting rescue: ${error.message}`);
                closeDeleteConfirmation();
            } finally {
                confirmDeleteBtn.textContent = "Delete Cat";
                confirmDeleteBtn.disabled = false;
            }
        });
    }

    // Report Preview Modal Controllers
    function generateReportHtml(cat) {
        const todayStr = new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://kittyverse.org/animal/${cat._id}`;
        const img = cat.imageUrl || "assets/images/kitten.png";

        // Status Badge styling
        const healthColor = cat.healthStatus === "Healthy" ? "text-emerald-700 bg-emerald-50 border-emerald-100" : "text-amber-700 bg-amber-50 border-amber-100";
        
        // Build timeline items list
        const baseDate = cat.createdAt ? new Date(cat.createdAt) : new Date();
        const formatTimelineDate = (d) => {
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
        };
        const addDays = (d, days) => {
            const result = new Date(d);
            result.setDate(result.getDate() + days);
            return result;
        };

        const timelineEvents = [
            { title: "Rescue Intake", desc: `Rescued from ${cat.location || "Downtown Street"}`, date: formatTimelineDate(baseDate) },
            { title: "Rabies Vaccination", desc: "Rabies vaccine administered", date: formatTimelineDate(addDays(baseDate, 4)) },
            { title: "Health Check", desc: "Routine examination completed", date: formatTimelineDate(addDays(baseDate, 12)) }
        ];

        if (cat.healthStatus === "Under Observation" || cat.healthStatus === "Under Treatment" || cat.healthStatus === "Observation") {
            timelineEvents.push({ title: "Medication Started", desc: "Antibiotic treatment started", date: formatTimelineDate(addDays(baseDate, 15)) });
        } else {
            timelineEvents.push({ title: "Medication Started", desc: "Antibiotic treatment started", date: formatTimelineDate(addDays(baseDate, 15)) });
            timelineEvents.push({ title: "Recovery", desc: "Returned to Healthy status", date: formatTimelineDate(addDays(baseDate, 24)) });
        }

        const timelineRows = timelineEvents.map(ev => `
            <div class="flex items-start gap-4 border-l-2 border-stone-200 pl-4 relative pb-4 last:pb-0">
                <span class="absolute -left-[7px] top-1.5 w-3 h-3 rounded-full bg-[#FF914D]"></span>
                <div class="flex-1">
                    <div class="flex justify-between w-full">
                        <h4 class="text-xs font-bold text-stone-800">${ev.title}</h4>
                        <span class="text-[10px] text-stone-400 font-medium">${ev.date}</span>
                    </div>
                    <p class="text-[11px] text-stone-500 mt-0.5">${ev.desc}</p>
                </div>
            </div>
        `).join('');

        return `
            <!-- PDF HEADER -->
            <div class="flex justify-between items-start border-b-2 border-[#FF914D] pb-6">
                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl text-[#FF914D]">🐾</span>
                        <span class="text-2xl font-bold tracking-tight text-[#FF914D]">KITTYVERSE</span>
                    </div>
                    <p class="text-[10px] uppercase tracking-wider text-stone-400 font-semibold mt-1">Global Rescue Network & Veterinary Care</p>
                </div>
                <div class="text-right text-xs text-stone-500">
                    <p class="font-bold text-stone-800">OFFICIAL MEDICAL RECORD</p>
                    <p class="mt-0.5">Report ID: KV-2026-${cat._id.slice(-6).toUpperCase()}</p>
                    <p class="mt-0.5">Issued: ${todayStr}</p>
                </div>
            </div>

            <!-- CAT IDENTIFICATION SECTION -->
            <div class="flex gap-6 pt-4">
                <img src="${img}" class="w-32 h-32 rounded-2xl object-cover border border-stone-200 shadow-sm shrink-0" alt="${cat.name}"/>
                <div class="flex-1 grid grid-cols-2 gap-x-6 gap-y-2">
                    <div class="col-span-2">
                        <h2 class="text-xl font-bold text-stone-800">${cat.name}</h2>
                        <p class="text-xs text-stone-400 font-medium">${cat.breed || 'Domestic Shorthair'} • ${cat.age} Year${cat.age !== 1 ? 's' : ''} Old • ${cat.gender}</p>
                    </div>
                    
                    <div class="border-t border-stone-100 pt-2">
                        <p class="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Health Status</p>
                        <span class="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold mt-1 ${healthColor}">${cat.healthStatus}</span>
                    </div>
                    
                    <div class="border-t border-stone-100 pt-2">
                        <p class="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Vaccination Status</p>
                        <p class="text-xs font-semibold text-stone-700 mt-1">${cat.vaccinationStatus || 'Vaccinated'}</p>
                    </div>

                    <div class="border-t border-stone-100 pt-2">
                        <p class="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Adoption Status</p>
                        <p class="text-xs font-semibold text-stone-700 mt-1">${cat.adoptionStatus || 'Available'}</p>
                    </div>

                    <div class="border-t border-stone-100 pt-2">
                        <p class="text-[9px] uppercase tracking-wider text-stone-400 font-bold">Weight</p>
                        <p class="text-xs font-semibold text-stone-700 mt-1">${cat.color || '5.2 lbs'}</p>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-8 pt-4">
                <!-- LEFT COLUMN: MEDICAL TIMELINE -->
                <div class="space-y-3">
                    <h3 class="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-200 pb-1">Medical Timeline</h3>
                    <div class="space-y-3 pt-1">
                        ${timelineRows}
                    </div>
                </div>

                <!-- RIGHT COLUMN: VACCINATION HISTORY & AI HEALTH SUMMARY -->
                <div class="space-y-4">
                    <div class="space-y-3">
                        <h3 class="text-xs font-bold text-stone-800 uppercase tracking-wider border-b border-stone-200 pb-1">Vaccination History</h3>
                        <table class="w-full text-left text-xs">
                            <thead>
                                <tr class="border-b border-stone-100 text-[10px] text-stone-400 uppercase font-bold">
                                    <th class="pb-1 font-semibold">Vaccine Type</th>
                                    <th class="pb-1 font-semibold">Date</th>
                                    <th class="pb-1 font-semibold">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr class="border-b border-stone-50">
                                    <td class="py-1.5 text-stone-700 font-medium">FVRCP (Core)</td>
                                    <td class="py-1.5 text-stone-500">${formatTimelineDate(addDays(baseDate, 4))}</td>
                                    <td class="py-1.5 text-emerald-600 font-semibold">Completed</td>
                                </tr>
                                <tr class="border-b border-stone-50">
                                    <td class="py-1.5 text-stone-700 font-medium">Rabies Booster</td>
                                    <td class="py-1.5 text-stone-500">${formatTimelineDate(addDays(baseDate, 12))}</td>
                                    <td class="py-1.5 text-emerald-600 font-semibold">Completed</td>
                                </tr>
                                <tr>
                                    <td class="py-1.5 text-stone-700 font-medium">Feline Leukemia</td>
                                    <td class="py-1.5 text-stone-500">Scheduled</td>
                                    <td class="py-1.5 text-amber-600 font-semibold">Pending</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="space-y-2 p-4 bg-[#FFF9F5] border-l-4 border-[#FF914D] rounded-r-xl border-y border-r border-orange-100/30">
                        <div class="flex items-center gap-1.5">
                            <span class="text-sm">🐶</span>
                            <h4 class="text-xs font-bold text-stone-800">Fanny AI Health Summary</h4>
                        </div>
                        <p class="text-[10px] text-stone-500 leading-relaxed">
                            Recovering well after recent procedures. Risk index is currently <strong class="text-emerald-600">Low</strong>. 
                            High-protein recovery meal plan is recommended.
                        </p>
                    </div>
                </div>
            </div>

            <!-- SHELTER INFO & RECOMMENDED FOLLOW-UP -->
            <div class="border-t border-stone-200 pt-4 flex justify-between items-start">
                <div class="space-y-1 text-xs">
                    <h4 class="font-bold text-stone-800">Recommended Follow-up</h4>
                    <p class="text-stone-500">Wellness checkup schedule: Next week. Diet monitor: Daily.</p>
                    <p class="text-[10px] text-stone-400 mt-2">Shelter Location: ${cat.location || 'Shelter Zone B'} | Coordinator: Assigned Vol.</p>
                </div>
            </div>

            <!-- SIGNATURE & QR BLOCK -->
            <div class="border-t border-stone-200 pt-4 flex justify-between items-end mt-auto">
                <div class="text-xs text-stone-500">
                    <p class="italic text-stone-400 mb-6">Certified By:</p>
                    <div class="border-t border-stone-300 w-48 pt-1">
                        <p class="font-bold text-stone-700">Dr. Sarah Jenkins</p>
                        <p class="text-[10px] text-stone-400">Lead Rescue Veterinarian</p>
                    </div>
                </div>
                
                <div class="flex items-center gap-4">
                    <div class="text-right text-[10px] text-stone-400">
                        <p class="font-bold text-stone-600">Scan to Verify Record</p>
                        <p class="mt-0.5">Secure Hash: SHA-256 Verified</p>
                    </div>
                    <img src="${qrUrl}" class="w-16 h-16 border border-stone-200 rounded-lg shadow-sm" alt="QR Code Verification"/>
                </div>
            </div>
        `;
    }

    function openReportPreviewModal(cat) {
        if (reportLoadingOverlay) {
            reportLoadingOverlay.classList.remove("pointer-events-none", "opacity-0");
            reportLoadingOverlay.classList.add("opacity-100");
        }

        setTimeout(() => {
            if (pdfReportContent) {
                pdfReportContent.innerHTML = generateReportHtml(cat);
            }

            if (reportLoadingOverlay) {
                reportLoadingOverlay.classList.add("pointer-events-none", "opacity-0");
                reportLoadingOverlay.classList.remove("opacity-100");
            }

            if (reportPreviewOverlay && reportPreviewDialog) {
                reportPreviewOverlay.classList.remove("pointer-events-none", "opacity-0");
                reportPreviewDialog.classList.remove("scale-95", "opacity-0");
                reportPreviewDialog.classList.add("scale-100", "opacity-100");
            }
        }, 1200);
    }

    function closeReportPreviewModal() {
        if (reportPreviewOverlay && reportPreviewDialog) {
            reportPreviewOverlay.classList.add("pointer-events-none", "opacity-0");
            reportPreviewDialog.classList.add("scale-95", "opacity-0");
            reportPreviewDialog.classList.remove("scale-100", "opacity-100");
        }
    }

    if (closeReportBtn) closeReportBtn.addEventListener("click", closeReportPreviewModal);
    if (reportPreviewOverlay) {
        reportPreviewOverlay.addEventListener("click", (e) => {
            if (e.target === reportPreviewOverlay) closeReportPreviewModal();
        });
    }

    if (printReportBtn) {
        printReportBtn.onclick = () => {
            const printContent = document.getElementById("pdfPaperSheet").innerHTML;
            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Medical Report Preview</title>
                        <script src="https://cdn.tailwindcss.com"></script>
                        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet"/>
                        <style>
                            body { font-family: 'Poppins', sans-serif; }
                        </style>
                    </head>
                    <body class="p-8 bg-white">
                        <div class="w-[794px] min-h-[1123px] bg-white mx-auto relative flex flex-col justify-between font-sans text-stone-800">
                            ${printContent}
                        </div>
                        <script>
                            window.onload = function() {
                                window.print();
                                window.close();
                            }
                        </script>
                    </body>
                </html>
            `);
            printWindow.document.close();
        };
    }

    if (downloadReportBtn) {
        downloadReportBtn.onclick = () => {
            printReportBtn.click();
        };
    }

    // Vaccination Management Controller Functions
    function renderVaccineHistory(catId) {
        if (!drawerVaxHistoryContainer) return;
        drawerVaxHistoryContainer.innerHTML = "";
        
        const vaxes = catVaccinations[catId] || [];
        vaxes.forEach(vax => {
            const cardHtml = `
                <div class="bg-white p-md rounded-[20px] border border-orange-100/50 shadow-sm flex items-center justify-between gap-sm transition-all hover:shadow-md">
                    <div class="space-y-0.5">
                        <div class="flex items-center gap-2">
                            <span class="text-sm">💉</span>
                            <h5 class="text-xs font-bold text-text-main">${vax.name}</h5>
                        </div>
                        <p class="text-[10px] text-secondary">Given: <span class="font-semibold text-text-main">${vax.date}</span></p>
                        <p class="text-[10px] text-secondary">Due Date: <span class="font-semibold text-text-main">${vax.dueDate}</span></p>
                        <p class="text-[9px] text-[#FF914D] font-medium">Vet: ${vax.vet}</p>
                    </div>
                    <span class="px-2 py-0.5 text-[9px] font-bold rounded-full border ${vax.badgeStyle}">${vax.status}</span>
                </div>
            `;
            drawerVaxHistoryContainer.insertAdjacentHTML("beforeend", cardHtml);
        });
    }

    function openScheduleVaxModal() {
        if (scheduleVaxOverlay && scheduleVaxModal) {
            scheduleVaxOverlay.classList.remove("pointer-events-none", "opacity-0");
            scheduleVaxModal.classList.remove("scale-95", "opacity-0");
            scheduleVaxModal.classList.add("scale-100", "opacity-100");
        }
    }

    function closeScheduleVaxModal() {
        if (scheduleVaxOverlay && scheduleVaxModal) {
            scheduleVaxOverlay.classList.add("pointer-events-none", "opacity-0");
            scheduleVaxModal.classList.add("scale-95", "opacity-0");
            scheduleVaxModal.classList.remove("scale-100", "opacity-100");
            if (scheduleVaxForm) scheduleVaxForm.reset();
        }
    }

    if (btnOpenScheduleVax) btnOpenScheduleVax.addEventListener("click", openScheduleVaxModal);
    if (cancelScheduleVaxBtn) cancelScheduleVaxBtn.addEventListener("click", closeScheduleVaxModal);
    if (scheduleVaxOverlay) {
        scheduleVaxOverlay.addEventListener("click", (e) => {
            if (e.target === scheduleVaxOverlay) closeScheduleVaxModal();
        });
    }

    if (submitScheduleVaxBtn && scheduleVaxForm) {
        submitScheduleVaxBtn.addEventListener("click", () => {
            if (!scheduleVaxForm.checkValidity()) {
                scheduleVaxForm.reportValidity();
                return;
            }

            const name = scheduleVaxForm.querySelector('[name="vaccineName"]').value;
            const dateVal = scheduleVaxForm.querySelector('[name="scheduleDate"]').value;
            const notes = scheduleVaxForm.querySelector('[name="scheduleNotes"]').value;

            const formattedDate = new Date(dateVal).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });

            if (currentProfileCatId && catVaccinations[currentProfileCatId]) {
                catVaccinations[currentProfileCatId].push({
                    name: name,
                    status: "Scheduled",
                    date: "Pending",
                    dueDate: formattedDate,
                    vet: "Dr. Sarah Jenkins",
                    badgeStyle: "text-blue-700 bg-blue-50 border-blue-100"
                });

                // Re-render list
                renderVaccineHistory(currentProfileCatId);

                // Close Modal
                closeScheduleVaxModal();

                // Show Toast
                if (successToast) {
                    successToast.querySelector("span.text-xs").textContent = "Vaccination scheduled successfully.";
                    successToast.classList.remove("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                    successToast.classList.add("translate-y-0", "opacity-100");
                    
                    setTimeout(() => {
                        successToast.classList.add("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                        successToast.classList.remove("translate-y-0", "opacity-100");
                    }, 3000);
                }
            }
        });
    }

    // Expose to global window
    window.openAddCatModal = openAddCatModal;
    window.openEditCatModal = openEditCatModal;
    window.closeAddCatModal = closeAddCatModal;

    if (cancelAddCatBtn) cancelAddCatBtn.addEventListener("click", closeAddCatModal);

    // Dropzone Events
    if (dropZone && catPhotoInput) {
        dropZone.addEventListener("click", () => catPhotoInput.click());

        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("bg-orange-50");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("bg-orange-50");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("bg-orange-50");
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                catPhotoInput.files = files;
                handlePhotoSelection(files[0]);
            }
        });

        catPhotoInput.addEventListener("change", (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                handlePhotoSelection(files[0]);
            }
        });
    }

    function handlePhotoSelection(file) {
        if (!file.type.startsWith("image/")) {
            alert("Please select a valid image file.");
            return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
            photoPreview.src = e.target.result;
            dropZone.classList.add("hidden");
            photoPreviewContainer.classList.remove("hidden");
        };
        reader.readAsDataURL(file);
    }

    if (removePhotoBtn) {
        removePhotoBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            resetPhotoPreview();
        });
    }

    // Form Save Cat submit handler
    if (saveCatBtn && addCatForm) {
        saveCatBtn.addEventListener("click", async () => {
            if (!addCatForm.checkValidity()) {
                addCatForm.reportValidity();
                return;
            }

            const token = localStorage.getItem("kittyverse_token");

            if (editingCatId) {
                saveCatBtn.textContent = "Saving...";
                saveCatBtn.disabled = true;

                try {
                    const formData = new FormData(addCatForm);
                    const response = await fetch(`${API_BASE_URL}/api/animals/${editingCatId}`, {
                        method: "PUT",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to update rescue profile.");
                    }

                    const updatedCat = await response.json();

                    // Set dynamic local createdAt mapping matching selected rescueDate
                    const formRescueDate = addCatForm.querySelector('[name="rescueDate"]').value;
                    if (formRescueDate) {
                        updatedCat.createdAt = new Date(formRescueDate).toISOString();
                    }

                    // Update in local cache list
                    const idx = allAnimals.findIndex(a => a._id === editingCatId);
                    if (idx !== -1) {
                        allAnimals[idx] = updatedCat;
                    }

                    updateCategoryCounts();
                    renderAnimalsList();

                    // Refresh dynamic content in open profile drawer
                    openProfileDrawer(editingCatId);

                    // Close Modal
                    closeAddCatModal();

                    // Success Toast
                    if (successToast) {
                        successToast.querySelector("span.text-xs").textContent = "Cat profile updated successfully.";
                        successToast.classList.remove("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                        successToast.classList.add("translate-y-0", "opacity-100");
                        
                        setTimeout(() => {
                            successToast.classList.add("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                            successToast.classList.remove("translate-y-0", "opacity-100");
                        }, 3000);
                    }

                } catch (error) {
                    alert(`Error updating rescue: ${error.message}`);
                } finally {
                    saveCatBtn.textContent = "Save Changes";
                    saveCatBtn.disabled = false;
                }
            } else {
                saveCatBtn.textContent = "Saving...";
                saveCatBtn.disabled = true;

                try {
                    const formData = new FormData(addCatForm);
                    const response = await fetch(`${API_BASE_URL}/api/animals`, {
                        method: "POST",
                        headers: {
                            "Authorization": `Bearer ${token}`
                        },
                        body: formData
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        throw new Error(errorData.message || "Failed to register new rescue.");
                    }

                    const newCat = await response.json();

                    // Dynamic updates
                    allAnimals.push(newCat);
                    updateCategoryCounts();
                    renderAnimalsList();

                    // Close Modal
                    closeAddCatModal();

                    // Success Toast
                    if (successToast) {
                        successToast.querySelector("span.text-xs").textContent = "Cat added successfully.";
                        successToast.classList.remove("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                        successToast.classList.add("translate-y-0", "opacity-100");
                        
                        setTimeout(() => {
                            successToast.classList.add("translate-y-[-100px]", "opacity-0", "pointer-events-none");
                            successToast.classList.remove("translate-y-0", "opacity-100");
                        }, 3000);
                    }

                } catch (error) {
                    alert(`Error saving rescue: ${error.message}`);
                } finally {
                    saveCatBtn.textContent = "Save Cat";
                    saveCatBtn.disabled = false;
                }
            }
        });
    }

    // Escape Close handler
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
            closeProfileDrawer();
            closeAddCatModal();
            closeDeleteConfirmation();
            closeReportPreviewModal();
            closeScheduleVaxModal();
        }
    });

    // 6. View Toggles click handlers
    if (gridToggleBtn && listToggleBtn) {
        gridToggleBtn.addEventListener("click", () => {
            currentView = "grid";
            gridToggleBtn.classList.add("bg-[#FFF4EB]");
            gridToggleBtn.classList.remove("opacity-40");
            listToggleBtn.classList.add("opacity-40");
            listToggleBtn.classList.remove("bg-[#FFF4EB]");
            renderAnimalsList();
        });

        listToggleBtn.addEventListener("click", () => {
            currentView = "list";
            listToggleBtn.classList.add("bg-[#FFF4EB]");
            listToggleBtn.classList.remove("opacity-40");
            gridToggleBtn.classList.add("opacity-40");
            gridToggleBtn.classList.remove("bg-[#FFF4EB]");
            renderAnimalsList();
        });
    }

    // 7. Filter Chips selection listeners
    if (filterBtns) {
        filterBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                filterBtns.forEach(b => {
                    b.className = "filter-btn px-lg py-sm rounded-full bg-white border border-outline-variant text-secondary hover:bg-surface-container transition-colors font-label-md text-label-md flex items-center gap-xs";
                    const span = b.querySelector("span");
                    if (span) {
                        span.className = "bg-secondary/10 px-xs rounded text-[10px]";
                    }
                });

                btn.className = "filter-btn px-lg py-sm rounded-full bg-primary text-white font-label-md text-label-md flex items-center gap-xs shadow-sm font-semibold";
                const activeSpan = btn.querySelector("span");
                if (activeSpan) {
                    activeSpan.className = "bg-white/20 px-xs rounded text-[10px]";
                }

                currentFilter = btn.getAttribute("data-filter");
                renderAnimalsList();
            });
        });
    }

    // 8. Search input query listener
    if (searchInput) {
        searchInput.addEventListener("input", (e) => {
            searchQuery = e.target.value;
            renderAnimalsList();
        });
    }

    // Trigger Initial Load
    loadShelterData();
});
