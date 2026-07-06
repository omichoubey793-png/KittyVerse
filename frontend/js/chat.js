// =====================================
// KittyVerse - Fanny AI Assistant Chat
// =====================================

document.addEventListener("DOMContentLoaded", () => {
    // 1. Session check
    const token = localStorage.getItem("kittyverse_token");
    const userStr = localStorage.getItem("kittyverse_user");

    if (!token || !userStr) {
        window.location.href = "login.html";
        return;
    }

    const currentUser = JSON.parse(userStr);

    // DOM Elements
    const chatInput = document.getElementById("chat-input");
    const sendBtn = document.getElementById("send-btn");
    const messagesContainer = document.getElementById("messages-container");
    const chatScroller = document.getElementById("chat-scroller");
    const introSection = document.querySelector("main section .flex-1 .max-w-3xl .flex-col.items-center.text-center");
    const suggestionBtns = document.querySelectorAll(".suggestion-btn");

    // Clear suggestion container HTML structure to prepare for message appending
    if (messagesContainer) {
        messagesContainer.innerHTML = "";
    }

    // Auto-resize textarea input
    if (chatInput) {
        chatInput.addEventListener("input", function() {
            this.style.height = "auto";
            this.style.height = (this.scrollHeight) + "px";
        });
    }

    // Helper to format AI responses (basic Markdown renderer)
    function formatAIResponse(text) {
        if (text.includes("couldn't find") || text.includes("not found") || text.includes("does not exist")) {
            return `
                <div class="space-y-md">
                    <p class="font-body-md text-on-surface">I couldn't find that record in KittyVerse.</p>
                    <div class="flex gap-sm flex-wrap mt-sm">
                        <a href="shelter.html" class="inline-flex items-center gap-xs bg-primary/10 hover:bg-primary/20 text-primary px-3 py-1.5 rounded-xl font-label-sm font-semibold transition-all">
                            <span class="material-symbols-outlined text-[16px]">pets</span> View Shelter
                        </a>
                        <a href="adoptions.html" class="inline-flex items-center gap-xs bg-tertiary/10 hover:bg-tertiary/20 text-tertiary px-3 py-1.5 rounded-xl font-label-sm font-semibold transition-all">
                            <span class="material-symbols-outlined text-[16px]">volunteer_activism</span> View Adoption
                        </a>
                        <a href="analytics.html" class="inline-flex items-center gap-xs bg-outline-variant/20 hover:bg-outline-variant/30 text-secondary px-3 py-1.5 rounded-xl font-label-sm font-semibold transition-all">
                            <span class="material-symbols-outlined text-[16px]">analytics</span> View Analytics
                        </a>
                    </div>
                </div>
            `;
        }

        let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
        // Replace list elements
        html = html.replace(/^\*\s(.*)$/gm, "<li class='flex items-center gap-sm'><span class='w-1.5 h-1.5 rounded-full bg-primary shrink-0'></span><span>$1</span></li>");
        // Wrap groups of <li> in <ul>
        if (html.includes("<li")) {
            html = html.replace(/(<li.*<\/li>)/s, "<ul class='space-y-sm my-md'>$1</ul>");
        }
        // Handle newlines
        html = html.replace(/\n/g, "<br/>");
        return html;
    }

    // 2. Append Message Bubbles
    function appendUserMessage(text) {
        if (!messagesContainer) return;

        const wrapper = document.createElement("div");
        wrapper.className = "flex items-start gap-md";

        const defaultAvatar = "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=80&auto=format&fit=crop";

        wrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex-shrink-0 overflow-hidden shadow-sm">
                <img class="w-full h-full object-cover" src="${defaultAvatar}" alt="User Avatar"/>
            </div>
            <div class="chat-bubble-user bg-surface-container-highest p-md rounded-2xl max-w-[80%] shadow-sm">
                <p class="font-body-md text-on-surface">${escapeHTML(text)}</p>
            </div>
        `;
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
    }

    function appendAIMessage(text, catsList = []) {
        if (!messagesContainer) return;

        const wrapper = document.createElement("div");
        wrapper.className = "flex items-start gap-md flex-row-reverse";

        let catsHtml = "";
        if (catsList && catsList.length > 0) {
            catsHtml = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-sm mt-md w-full max-w-2xl">
                    ${catsList.map(cat => `
                        <div class="bg-surface-container-lowest border border-outline-variant/65 rounded-xl p-md flex gap-md items-center shadow-sm hover:shadow-md transition-all">
                            <img class="w-16 h-16 rounded-lg object-cover" src="${cat.photo || 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=200'}" alt="${cat.name}"/>
                            <div class="flex-1 min-w-0">
                                <h4 class="font-bold text-on-surface text-sm truncate">${cat.name || 'Unknown'}</h4>
                                <p class="text-xs text-secondary truncate">${cat.breed || 'Unknown'} • ${cat.age || 'Unknown'} yrs</p>
                                <div class="flex gap-xs mt-1.5 flex-wrap">
                                    <span class="bg-primary/10 text-primary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">${cat.healthStatus || 'Healthy'}</span>
                                    <span class="bg-tertiary/10 text-tertiary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">${cat.vaccinationStatus || 'Vaccinated'}</span>
                                    <span class="bg-outline-variant/30 text-secondary px-1.5 py-0.5 rounded text-[9px] font-bold uppercase">${cat.adoptionStatus || 'Available'}</span>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
        }

        wrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm">
                <span class="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div class="chat-bubble-ai bg-white border border-outline-variant p-lg rounded-2xl max-w-[80%] shadow-sm text-on-surface">
                <p class="font-body-md leading-relaxed">${formatAIResponse(text)}</p>
                ${catsHtml}
            </div>
        `;
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
    }

    function appendLoadingBubble() {
        if (!messagesContainer) return null;

        const wrapper = document.createElement("div");
        wrapper.className = "flex items-start gap-md flex-row-reverse id-loading-bubble";

        wrapper.innerHTML = `
            <div class="w-8 h-8 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                <span class="material-symbols-outlined text-[18px]">smart_toy</span>
            </div>
            <div class="chat-bubble-ai bg-white border border-outline-variant p-md rounded-2xl max-w-[80%] shadow-sm flex items-center gap-sm text-secondary font-label-md">
                <span>Fanny is thinking</span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.1s"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.2s"></span>
                <span class="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style="animation-delay: 0.3s"></span>
            </div>
        `;
        messagesContainer.appendChild(wrapper);
        scrollToBottom();
        return wrapper;
    }

    function removeLoadingBubble(bubbleNode) {
        if (bubbleNode && bubbleNode.parentNode) {
            bubbleNode.parentNode.removeChild(bubbleNode);
        }
    }

    function scrollToBottom() {
        if (chatScroller) {
            setTimeout(() => {
                chatScroller.scrollTo({
                    top: chatScroller.scrollHeight,
                    behavior: 'smooth'
                });
            }, 50);
        }
    }

    function escapeHTML(text) {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    // 3. Main Message Submission Handler
    async function sendMessage(messageText) {
        if (!messageText) return;

        // Hide intro, show messages
        if (introSection) {
            introSection.style.display = "none";
        }
        if (messagesContainer) {
            messagesContainer.classList.remove("hidden");
        }

        appendUserMessage(messageText);

        const loader = appendLoadingBubble();

        try {
            const res = await fetch(`${API_BASE_URL}/api/chatbot/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: messageText })
            });

            removeLoadingBubble(loader);

            if (res.ok) {
                const data = await res.json();
                appendAIMessage(data.reply, data.cats);
            } else {
                appendAIMessage("Error: Fanny was unable to process this request. Make sure backend Gemini credentials are configured.");
            }
        } catch (error) {
            console.error("Chat API error:", error);
            removeLoadingBubble(loader);
            appendAIMessage("Network error: Could not reach KittyVerse API server.");
        }
    }

    // Event Bindings
    if (sendBtn) {
        sendBtn.addEventListener("click", () => {
            const prompt = chatInput.value.trim();
            if (prompt) {
                chatInput.value = "";
                chatInput.style.height = "auto";
                sendMessage(prompt);
            }
        });
    }

    if (chatInput) {
        chatInput.addEventListener("keypress", (e) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                sendBtn.click();
            }
        });
    }

    // Suggestion Cards click listeners
    suggestionBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const titleElement = btn.querySelector(".font-label-md");
            if (titleElement) {
                const text = titleElement.textContent;
                sendMessage(text);
            }
        });
    });

    // Cursor tracking premium glow
    const mainSection = document.querySelector("section");
    if (mainSection) {
        mainSection.addEventListener("mousemove", (e) => {
            const rect = mainSection.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            mainSection.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,145,77,0.02) 0%, rgba(255,248,246,1) 50%)`;
        });
    }
});