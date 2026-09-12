const API_BASE = "http://localhost:8080";

let selectedCategory = "";
let selectedOrganization = null;
let selectedService = null;
let selectedNotificationMethod = "EMAIL";
let organizations = [];
let queueTimer = null;


// ================= NAVIGATION =================

function showSection(section) {
    document.querySelectorAll(".section").forEach(s => {
        s.classList.remove("active");
    });

    const target = document.getElementById(section + "Section");

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (section === "home") {
        document.querySelector(".nav-item:nth-child(1)")?.classList.add("active");
    }

    if (section === "discover") {
        document.querySelector(".nav-item:nth-child(2)")?.classList.add("active");
        loadOrganizations();
    }

    if (section === "queue") {
        document.querySelector(".nav-item:nth-child(4)")?.classList.add("active");
        refreshQueue();
    }

    if (section === "profile") {
        document.querySelector(".nav-item:nth-child(5)")?.classList.add("active");
    }
}


// ================= CATEGORY =================

function selectCategory(category) {
    selectedCategory = category;

    showSection("discover");

    loadOrganizations(category);
}


// ================= LOAD ORGANIZATIONS =================

async function loadOrganizations(category = "") {
    const list = document.getElementById("discoverList");

    if (!list) return;

    list.innerHTML = `
        <div class="loading">
            Loading organizations...
        </div>
    `;

    try {
        const response = await fetch(`${API_BASE}/organization/all`);

        if (!response.ok) {
            throw new Error("Organization API failed");
        }

        organizations = await response.json();

        let filtered = organizations;

        if (category) {
            filtered = organizations.filter(org => {
                const name =
                    (org.organizationName || "").toLowerCase();

                const code =
                    (org.organizationCode || "").toLowerCase();

                return (
                    name.includes(category.toLowerCase()) ||
                    code.includes(category.toLowerCase())
                );
            });
        }

        renderOrganizations(filtered);

    } catch (error) {

        console.error(error);

        list.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load organizations</h3>
                <p>Make sure Spring Boot is running.</p>
            </div>
        `;
    }
}


// ================= RENDER ORGANIZATIONS =================

function renderOrganizations(list) {

    const container = document.getElementById("discoverList");

    if (!container) return;

    if (!list || list.length === 0) {

        container.innerHTML = `
            <div class="empty-state">
                <h3>No organizations found</h3>
                <p>Try another category.</p>
            </div>
        `;

        return;
    }

    container.innerHTML = list.map(org => {

        const name =
            org.organizationName || "QueueEase Organization";

        const address =
            org.address || "Hyderabad";

        const id =
            org.organizationId || org.id;

        return `
            <div class="organization-card"
                 onclick="openOrganization(${id})">

                <div class="organization-icon">
                    🏢
                </div>

                <div class="organization-details">

                    <h3>${name}</h3>

                    <p>📍 ${address}</p>

                    <span class="organization-status">
                        ● Available
                    </span>

                </div>

                <div class="organization-arrow">
                    →
                </div>

            </div>
        `;

    }).join("");
}


// ================= SEARCH =================

function searchOrganizations() {

    const input = document.getElementById("searchInput");

    if (!input) return;

    const search = input.value.toLowerCase().trim();

    let filtered = organizations;

    if (search) {
        filtered = organizations.filter(org => {

            const name =
                (org.organizationName || "").toLowerCase();

            const address =
                (org.address || "").toLowerCase();

            return (
                name.includes(search) ||
                address.includes(search)
            );
        });
    }

    renderOrganizations(filtered);
}


// ================= OPEN ORGANIZATION =================

async function openOrganization(id) {

    selectedOrganization =
        organizations.find(org =>
            (org.organizationId || org.id) == id
        );

    if (!selectedOrganization) return;

    const name =
        selectedOrganization.organizationName ||
        "QueueEase Organization";

    const address =
        selectedOrganization.address ||
        "Hyderabad";

    document.getElementById("organizationName").textContent = name;
    document.getElementById("organizationAddress").textContent = address;

    const modal =
        document.getElementById("organizationModal");

    modal.classList.add("active");

    await loadServices(id);
}


// ================= SERVICES =================

async function loadServices(organizationId) {

    const serviceList =
        document.getElementById("serviceList");

    if (!serviceList) return;

    serviceList.innerHTML = `
        <p>Loading services...</p>
    `;

    try {

        const response =
            await fetch(
                `${API_BASE}/service/organization/${organizationId}`
            );

        if (!response.ok) {
            throw new Error("Service API failed");
        }

        const services = await response.json();

        if (!services.length) {

            serviceList.innerHTML = `
                <p>No services available.</p>
            `;

            return;
        }

        serviceList.innerHTML =
            services.map(service => {

                const id =
                    service.serviceId || service.id;

                const name =
                    service.serviceName || "Service";

                const time =
                    service.estimatedServiceTime || 5;

                return `
                    <button
                        class="service-option"
                        onclick="selectService(${id}, '${escapeText(name)}')">

                        <div>
                            <strong>${name}</strong>
                            <small>
                                Estimated time: ${time} min
                            </small>
                        </div>

                        <span>→</span>

                    </button>
                `;

            }).join("");

    } catch (error) {

        console.error(error);

        serviceList.innerHTML = `
            <p>Unable to load services.</p>
        `;
    }
}


// ================= SELECT SERVICE =================

function selectService(serviceId, serviceName) {

    selectedService = serviceId;

    document.getElementById("selectedService").textContent =
        serviceName;

    closeModal("organizationModal");

    document.getElementById("joinModal")
        .classList.add("active");
}


// ================= NOTIFICATION =================

function selectNotification(method, button) {

    selectedNotificationMethod = method;

    document.querySelectorAll(".notification-option")
        .forEach(btn => btn.classList.remove("selected"));

    if (button) {
        button.classList.add("selected");
    }

    const contact =
        document.getElementById("contact");

    if (!contact) return;

    if (method === "EMAIL") {

        contact.placeholder =
            "Enter email address";

    } else if (method === "SMS") {

        contact.placeholder =
            "Enter mobile number";

    } else {

        contact.placeholder =
            "Enter mobile number";
    }
}


// ================= JOIN QUEUE =================

async function joinQueue() {

    const customerName =
        document.getElementById("customerName").value.trim();

    const contact =
        document.getElementById("contact").value.trim();

    if (!customerName) {
        alert("Please enter your name.");
        return;
    }

    if (!contact) {
        alert("Please enter your contact.");
        return;
    }

    if (!selectedOrganization) {
        alert("Please select an organization.");
        return;
    }

    if (!selectedService) {
        alert("Please select a service.");
        return;
    }

    const organizationId =
        selectedOrganization.organizationId ||
        selectedOrganization.id;

    const data = {

        customerName: customerName,

        contact: contact,

        notificationMethod:
            selectedNotificationMethod,

        organizationId:
            organizationId,

        serviceId:
            selectedService
    };

    try {

        const response =
            await fetch(`${API_BASE}/queue/take`, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(data)
            });

        if (!response.ok) {

            const message =
                await response.text();

            throw new Error(message);
        }

        const token =
            await response.json();

        closeModal("joinModal");

        displayToken(token);

    } catch (error) {

        console.error(error);

        alert(
            "Unable to join queue.\n\n" +
            "Make sure the selected organization and service are available."
        );
    }
}


// ================= DISPLAY TOKEN =================

function displayToken(data) {

    document.getElementById("tokenNumber").textContent =
        "#" + (data.tokenNumber ?? "--");

    document.getElementById("tokenPosition").textContent =
        data.queuePosition ?? "--";

    document.getElementById("tokenWait").textContent =
        (data.estimatedWaitingTime ?? "--") + " min";

    document.getElementById("queueToken").textContent =
        "#" + (data.tokenNumber ?? "--");

    document.getElementById("queuePosition").textContent =
        data.queuePosition ?? "--";

    document.getElementById("queueWait").textContent =
        (data.estimatedWaitingTime ?? "--") + " min";

    document.getElementById("activeOrg").textContent =
        selectedOrganization?.organizationName ||
        "QueueEase";

    document.getElementById("activeToken").textContent =
        "#" + (data.tokenNumber ?? "--");

    document.getElementById("activePosition").textContent =
        data.queuePosition ?? "--";

    document.getElementById("activeWait").textContent =
        (data.estimatedWaitingTime ?? "--") + " min";

    document.getElementById("activeTicket")
        ?.classList.remove("hidden");

    const ahead =
        Math.max(
            0,
            (data.queuePosition || 1) - 1
        );

    document.getElementById("peopleAhead").textContent =
        ahead + " people ahead";

    document.getElementById("queueProgress").style.width =
        Math.max(
            5,
            Math.min(
                100,
                100 / (data.queuePosition || 1)
            )
        ) + "%";

    document.getElementById("notificationMessage").textContent =
        "🔔 Queue updates enabled";

    document.getElementById("tokenModal")
        .classList.add("active");

    localStorage.setItem(
        "queueEaseToken",
        JSON.stringify(data)
    );
}


// ================= REFRESH QUEUE =================

async function refreshQueue() {

    const saved =
        localStorage.getItem("queueEaseToken");

    if (!saved) return;

    const oldData =
        JSON.parse(saved);

    try {

        const response =
            await fetch(`${API_BASE}/queue/all`);

        if (!response.ok) return;

        const tokens =
            await response.json();

        const current =
            tokens.find(token =>
                token.tokenNumber ==
                oldData.tokenNumber
            );

        if (!current) return;

        displayQueueData(current);

    } catch (error) {

        console.error(error);
    }
}


// ================= QUEUE DATA =================

function displayQueueData(data) {

    document.getElementById("queueToken").textContent =
        "#" + data.tokenNumber;

    document.getElementById("queuePosition").textContent =
        data.queuePosition;

    document.getElementById("queueWait").textContent =
        data.estimatedWaitingTime + " min";

    const ahead =
        Math.max(
            0,
            data.queuePosition - 1
        );

    document.getElementById("peopleAhead").textContent =
        ahead + " people ahead";

    document.getElementById("activeToken").textContent =
        "#" + data.tokenNumber;

    document.getElementById("activePosition").textContent =
        data.queuePosition;

    document.getElementById("activeWait").textContent =
        data.estimatedWaitingTime + " min";
}


// ================= MODALS =================

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("active");
    }

    if (id === "scannerModal") {
        stopScanner();
    }
}


// ================= QR SCANNER =================

let scannerStream = null;

async function openScanner() {

    const modal =
        document.getElementById("scannerModal");

    if (!modal) return;

    modal.classList.add("active");

    const video =
        document.getElementById("scannerVideo");

    try {

        scannerStream =
            await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                }
            });

        video.srcObject =
            scannerStream;

        document.getElementById("scannerMessage")
            .textContent =
            "Camera active. Point it at a QueueEase QR code.";

    } catch (error) {

        console.error(error);

        document.getElementById("scannerMessage")
            .textContent =
            "Camera permission was not available.";
    }
}


function closeScanner() {

    closeModal("scannerModal");
}


function stopScanner() {

    if (scannerStream) {

        scannerStream.getTracks()
            .forEach(track => track.stop());

        scannerStream = null;
    }

    const video =
        document.getElementById("scannerVideo");

    if (video) {
        video.srcObject = null;
    }
}


// ================= HELPERS =================

function escapeText(text) {

    return String(text)
        .replace(/'/g, "\\'")
        .replace(/"/g, "&quot;");
}


// ================= INITIALIZE =================

document.addEventListener("DOMContentLoaded", () => {

    showSection("home");

    loadOrganizations();

    const saved =
        localStorage.getItem("queueEaseToken");

    if (saved) {

        try {

            const data =
                JSON.parse(saved);

            if (data) {
                displayTokenDataWithoutModal(data);
            }

        } catch (error) {
            console.error(error);
        }
    }
});


function displayTokenDataWithoutModal(data) {

    document.getElementById("activeTicket")
        ?.classList.remove("hidden");

    document.getElementById("activeToken").textContent =
        "#" + (data.tokenNumber ?? "--");

    document.getElementById("activePosition").textContent =
        data.queuePosition ?? "--";

    document.getElementById("activeWait").textContent =
        (data.estimatedWaitingTime ?? "--") + " min";

    document.getElementById("activeOrg").textContent =
        selectedOrganization?.organizationName ||
        "QueueEase";
}


// ================= MAKE FUNCTIONS AVAILABLE TO HTML =================

window.showSection = showSection;
window.selectCategory = selectCategory;
window.loadOrganizations = loadOrganizations;
window.searchOrganizations = searchOrganizations;
window.openOrganization = openOrganization;
window.selectService = selectService;
window.selectNotification = selectNotification;
window.joinQueue = joinQueue;
window.refreshQueue = refreshQueue;
window.displayToken = displayToken;
window.closeModal = closeModal;
window.openScanner = openScanner;
window.closeScanner = closeScanner;