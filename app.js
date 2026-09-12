=const API_BASE = "";
const ORGANIZATION_ID = 1;
const SERVICE_ID = 1;
const CUSTOMER_ID = 1;

let selectedNotification = "EMAIL";
let selectedOrganizationId = 1;
let selectedServiceId = null;
let currentToken = null;

const categoryServices = {
    Hospital: [
        "General Consultation",
        "Emergency",
        "Doctor Consultation",
        "Lab Test",
        "Pharmacy"
    ],

    College: [
        "Admissions",
        "Certificates",
        "Exam Section",
        "Accounts",
        "Student Support"
    ],

    Salon: [
        "Haircut",
        "Hair Styling",
        "Hair Spa",
        "Facial",
        "Beard Grooming"
    ],

    Restaurant: [
        "Table Booking",
        "Walk-in Queue",
        "Takeaway",
        "Order Pickup"
    ],

    Bank: [
        "Cash Deposit",
        "Cash Withdrawal",
        "Account Services",
        "Loans",
        "Customer Support"
    ],

    "Service Center": [
        "Vehicle Service",
        "Repair",
        "Oil Change",
        "General Inspection"
    ],

    Rental: [
        "Bike Rental",
        "Car Rental",
        "Vehicle Return",
        "Booking Support"
    ],

    Government: [
        "Certificates",
        "Licenses",
        "Applications",
        "Public Services"
    ]
};


/* =========================================================
   SECTION NAVIGATION
   ========================================================= */

function showSection(sectionName) {

    document.querySelectorAll(".section").forEach(section => {
        section.classList.remove("active");
    });

    const section = document.getElementById(sectionName + "Section");

    if (section) {
        section.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* =========================================================
   CATEGORY SELECTION
   ========================================================= */

function selectCategory(category) {

    showSection("discover");

    const search = document.getElementById("discoverSearch");

    if (search) {
        search.placeholder =
            `Search ${category.toLowerCase()}...`;
    }

    loadOrganizations(category);
}


/* =========================================================
   LOAD ORGANIZATIONS
   ========================================================= */

async function loadOrganizations(category = "") {

    const organizationList =
        document.getElementById("organizationList");

    if (!organizationList) {
        return;
    }

    try {

        const response =
            await fetch(`${API_BASE}/organizations`);

        if (!response.ok) {
            throw new Error("Unable to load organizations");
        }

        const organizations =
            await response.json();

        let filteredOrganizations = organizations;

        if (category) {

            filteredOrganizations =
                organizations.filter(org => {

                    const orgCategory =
                        String(
                            org.category ||
                            org.organizationCategory ||
                            ""
                        ).toLowerCase();

                    return orgCategory ===
                        category.toLowerCase();
                });
        }

        if (filteredOrganizations.length === 0) {

            organizationList.innerHTML = `
                <div class="empty-state">
                    <h3>No organizations found</h3>
                    <p>Try another category.</p>
                </div>
            `;

            return;
        }

        organizationList.innerHTML =
            filteredOrganizations.map(org => {

                const id =
                    org.organizationId ??
                    org.organization_id;

                const name =
                    org.organizationName ??
                    org.organization_name ??
                    "Organization";

                const address =
                    org.address ??
                    "Location available";

                return `
                    <button
                        class="business-card"
                        onclick="openOrganization(${id})"
                    >
                        <div class="business-card-icon">
                            🏢
                        </div>

                        <div>
                            <h3>${name}</h3>
                            <p>${address}</p>
                        </div>
                    </button>
                `;

            }).join("");

    } catch (error) {

        console.error(
            "Organization loading error:",
            error
        );

        organizationList.innerHTML = `
            <div class="empty-state">
                <h3>Unable to load organizations</h3>
                <p>Please try again.</p>
            </div>
        `;
    }
}


/* =========================================================
   OPEN ORGANIZATION
   ========================================================= */

async function openOrganization(id) {

    selectedOrganizationId = id;

    try {

        const organizationResponse =
            await fetch(`${API_BASE}/organizations`);

        if (!organizationResponse.ok) {
            throw new Error("Organization request failed");
        }

        const organizations =
            await organizationResponse.json();

        const organization =
            organizations.find(org =>
                Number(
                    org.organizationId ??
                    org.organization_id
                ) === Number(id)
            );

        if (!organization) {
            return;
        }

        const name =
            document.getElementById("organizationName");

        const address =
            document.getElementById("organizationAddress");

        const serviceList =
            document.getElementById("serviceList");

        if (name) {

            name.textContent =
                organization.organizationName ??
                organization.organization_name ??
                "Organization";
        }

        if (address) {

            address.textContent =
                organization.address ??
                "Address not available";
        }


        /* Load services */

        const serviceResponse =
            await fetch(`${API_BASE}/services/${id}`);

        let services = [];

        if (serviceResponse.ok) {
            services = await serviceResponse.json();
        }


        if (serviceList) {

            if (services.length === 0) {

                serviceList.innerHTML = `
                    <div class="empty-state">
                        <p>
                            No services available
                            for this organization.
                        </p>
                    </div>
                `;

            } else {

                serviceList.innerHTML =
                    services.map(service => {

                        const serviceId =
                            service.serviceId ??
                            service.service_id;

                        const serviceName =
                            service.serviceName ??
                            service.service_name ??
                            "Service";

                        return `
                            <button
                                class="service-option"
                                onclick="selectService(
                                    ${serviceId},
                                    '${escapeQuotes(serviceName)}'
                                )"
                            >
                                <span>
                                    ${serviceName}
                                </span>

                                <span>›</span>
                            </button>
                        `;

                    }).join("");
            }
        }


        const modal =
            document.getElementById("organizationModal");

        if (modal) {
            modal.classList.add("open");
        }

    } catch (error) {

        console.error(
            "Organization error:",
            error
        );
    }
}


/* =========================================================
   ESCAPE QUOTES
   ========================================================= */

function escapeQuotes(value) {

    return String(value)
        .replace(/\\/g, "\\\\")
        .replace(/'/g, "\\'");
}


/* =========================================================
   SELECT SERVICE
   ========================================================= */

function selectService(serviceId, serviceName) {

    selectedServiceId = serviceId;

    const selectedService =
        document.getElementById("selectedService");

    if (selectedService) {
        selectedService.textContent = serviceName;
    }

    closeModal("organizationModal");

    const joinModal =
        document.getElementById("joinModal");

    if (joinModal) {
        joinModal.classList.add("open");
    }
}


/* =========================================================
   NOTIFICATION SELECTION
   ========================================================= */

function selectNotification(method) {

    selectedNotification = method;

    document
        .querySelectorAll(".notification-option")
        .forEach(button => {

            const buttonMethod =
                button.dataset.notification ||
                button.dataset.notify;

            button.classList.toggle(
                "active",
                buttonMethod === method
            );
        });


    const notificationMessage =
        document.getElementById("notificationMessage");

    if (notificationMessage) {

        if (method === "EMAIL") {

            notificationMessage.textContent =
                "Queue updates will be sent by email.";

        } else if (method === "SMS") {

            notificationMessage.textContent =
                "Queue updates will be sent by SMS.";

        } else if (method === "CALL") {

            notificationMessage.textContent =
                "You will receive a call when your turn is near.";
        }
    }
}


/* =========================================================
   JOIN QUEUE
   ========================================================= */

async function joinQueue() {

    const customerNameElement =
        document.getElementById("customerName");

    const contactElement =
        document.getElementById("contact");

    const customerName =
        customerNameElement ?
        customerNameElement.value.trim() :
        "";

    const contact =
        contactElement ?
        contactElement.value.trim() :
        "";


    if (!customerName) {

        alert("Please enter your name.");

        return;
    }


    if (!contact) {

        alert("Please enter your contact.");

        return;
    }


    if (!selectedOrganizationId) {

        alert("Please select an organization.");

        return;
    }


    if (!selectedServiceId) {

        alert("Please select a service.");

        return;
    }


    try {

        const url =
            `${API_BASE}/queue/take` +
            `?customerName=${encodeURIComponent(customerName)}` +
            `&contact=${encodeURIComponent(contact)}` +
            `&notificationMethod=${encodeURIComponent(selectedNotification)}` +
            `&organizationId=${selectedOrganizationId}` +
            `&serviceId=${selectedServiceId}` +
            `&customerId=${CUSTOMER_ID}`;


        const response =
            await fetch(url, {
                method: "POST"
            });


        if (!response.ok) {

            throw new Error(
                `Queue request failed: ${response.status}`
            );
        }


        const token =
            await response.json();


        currentToken = token;


        displayToken(token);

        generateQRCode(token);


        closeModal("joinModal");


        const tokenModal =
            document.getElementById("tokenModal");

        if (tokenModal) {
            tokenModal.classList.add("open");
        }


        showNotification(
            "QueueEase 🎫",
            "Your queue token has been created."
        );


    } catch (error) {

        console.error(
            "Join queue error:",
            error
        );

        alert(
            "Unable to join the queue right now."
        );
    }
}


/* =========================================================
   DISPLAY TOKEN
   ========================================================= */

function displayToken(token) {

    if (!token) {
        return;
    }


    const tokenNumber =
        token.tokenNumber ??
        token.token_number;

    const queuePosition =
        token.queuePosition ??
        token.queue_position ??
        0;

    const estimatedWait =
        token.estimatedWaitingTime ??
        token.estimated_waiting_time ??
        0;


    const elements = {

        tokenNumber:
            document.getElementById("tokenNumber"),

        tokenPosition:
            document.getElementById("tokenPosition"),

        tokenWait:
            document.getElementById("tokenWait"),

        queueToken:
            document.getElementById("queueToken"),

        queuePosition:
            document.getElementById("queuePosition"),

        queueWait:
            document.getElementById("queueWait"),

        activeToken:
            document.getElementById("activeToken"),

        activePosition:
            document.getElementById("activePosition"),

        activeWait:
            document.getElementById("activeWait")
    };


    if (elements.tokenNumber) {
        elements.tokenNumber.textContent =
            tokenNumber;
    }

    if (elements.tokenPosition) {
        elements.tokenPosition.textContent =
            queuePosition;
    }

    if (elements.tokenWait) {
        elements.tokenWait.textContent =
            `${estimatedWait} min`;
    }

    if (elements.queueToken) {
        elements.queueToken.textContent =
            tokenNumber;
    }

    if (elements.queuePosition) {
        elements.queuePosition.textContent =
            queuePosition;
    }

    if (elements.queueWait) {
        elements.queueWait.textContent =
            `${estimatedWait} min`;
    }

    if (elements.activeToken) {
        elements.activeToken.textContent =
            tokenNumber;
    }

    if (elements.activePosition) {
        elements.activePosition.textContent =
            queuePosition;
    }

    if (elements.activeWait) {
        elements.activeWait.textContent =
            `${estimatedWait} min`;
    }


    localStorage.setItem(
        "queueEaseToken",
        JSON.stringify(token)
    );
}


/* =========================================================
   QR CODE
   ========================================================= */

function generateQRCode(token) {

    const qrCode =
        document.getElementById("qrCode");

    if (!qrCode || !token) {
        return;
    }


    const tokenNumber =
        token.tokenNumber ??
        token.token_number;


    const liveQueueURL =
        `${window.location.origin}` +
        `/QueueEase/live-queue.html` +
        `?token=${encodeURIComponent(tokenNumber)}`;


    qrCode.innerHTML = `
        <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(liveQueueURL)}"
            alt="QueueEase QR Code"
        >
    `;
}


/* =========================================================
   REFRESH QUEUE
   ========================================================= */

async function refreshQueue() {

    try {

        const response =
            await fetch(`${API_BASE}/queue/all`);

        if (!response.ok) {
            return;
        }

        const tokens =
            await response.json();


        if (!currentToken) {
            return;
        }


        const currentNumber =
            currentToken.tokenNumber ??
            currentToken.token_number;


        const latest =
            tokens.find(token => {

                const number =
                    token.tokenNumber ??
                    token.token_number;

                return Number(number) ===
                    Number(currentNumber);
            });


        if (latest) {

            currentToken = latest;

            displayToken(latest);
        }

    } catch (error) {

        console.log(
            "Queue refresh unavailable."
        );
    }
}


/* =========================================================
   GET ALL TOKENS
   ========================================================= */

function getAllTokens() {

    return refreshQueue();
}


/* =========================================================
   SHOW ALL CATEGORIES
   ========================================================= */

function showAllCategories() {

    const container =
        document.getElementById(
            "discoverCategories"
        );

    if (!container) {
        return;
    }


    container.innerHTML =
        Object.keys(categoryServices)
            .map(category => `
                <button
                    onclick="selectCategory('${escapeQuotes(category)}')"
                >
                    ${category}
                </button>
            `)
            .join("");
}


/* =========================================================
   CLOSE MODAL
   ========================================================= */

function closeModal(id) {

    const modal =
        document.getElementById(id);

    if (modal) {
        modal.classList.remove("open");
    }
}


/* =========================================================
   BROWSER NOTIFICATION
   ========================================================= */

function showNotification(title, message) {

    if (
        "Notification" in window &&
        Notification.permission === "granted"
    ) {

        new Notification(
            title,
            {
                body: message
            }
        );
    }
}


/* =========================================================
   REQUEST NOTIFICATION PERMISSION
   ========================================================= */

async function requestNotificationPermission() {

    if (
        "Notification" in window &&
        Notification.permission === "default"
    ) {

        try {
            await Notification.requestPermission();
        } catch (error) {
            console.log(
                "Notification permission unavailable."
            );
        }
    }
}


/* =========================================================
   PAGE INITIALIZATION
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        /*
         * Home is the first section.
         */

        showSection("home");


        /*
         * Category buttons.
         */

        showAllCategories();


        /*
         * Notification permission.
         */

        requestNotificationPermission();


        /*
         * Restore saved token.
         */

        const savedToken =
            localStorage.getItem(
                "queueEaseToken"
            );


        if (savedToken) {

            try {

                currentToken =
                    JSON.parse(savedToken);

                displayToken(
                    currentToken
                );

                generateQRCode(
                    currentToken
                );

            } catch (error) {

                localStorage.removeItem(
                    "queueEaseToken"
                );
            }
        }


        /*
         * Load organizations.
         */

        loadOrganizations();


        /*
         * Refresh queue every 5 seconds.
         */

        refreshQueue();

        setInterval(
            refreshQueue,
            5000
        );


        /*
         * Notification buttons.
         */

        document
            .querySelectorAll(
                ".notification-option"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const method =
                            button.dataset.notification ||
                            button.dataset.notify ||
                            "EMAIL";

                        selectNotification(
                            method
                        );
                    }
                );
            });


        /*
         * Navigation buttons.
         */

        document
            .querySelectorAll(
                "[data-section]"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    event => {

                        event.preventDefault();

                        const section =
                            button.dataset.section;

                        if (section) {
                            showSection(section);
                        }
                    }
                );
            });
    }
);


/* =========================================================
   MAKE FUNCTIONS AVAILABLE TO HTML onclick
   ========================================================= */

window.showSection =
    showSection;

window.selectCategory =
    selectCategory;

window.loadOrganizations =
    loadOrganizations;

window.openOrganization =
    openOrganization;

window.selectService =
    selectService;

window.selectNotification =
    selectNotification;

window.joinQueue =
    joinQueue;

window.displayToken =
    displayToken;

window.generateQRCode =
    generateQRCode;

window.refreshQueue =
    refreshQueue;

window.getAllTokens =
    getAllTokens;

window.showAllCategories =
    showAllCategories;

window.closeModal =
    closeModal;