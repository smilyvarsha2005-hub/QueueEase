const API_BASE = "http://127.0.0.1:8080";

let selectedCategory = "";
let selectedOrganization = null;
let selectedService = null;
let selectedNotificationMethod = "EMAIL";
let organizations = [];


// ================= NAVIGATION =================

function showSection(section) {

    document.querySelectorAll(".section").forEach(s => {
        s.classList.remove("active");
    });

    const target =
        document.getElementById(section + "Section");

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-item").forEach(item => {
        item.classList.remove("active");
    });

    if (section === "home") {
        document.querySelector(".nav-item:nth-child(1)")
            ?.classList.add("active");
    }

    if (section === "discover") {
        document.querySelector(".nav-item:nth-child(2)")
            ?.classList.add("active");

        loadOrganizations();
    }

    if (section === "queue") {
        document.querySelector(".nav-item:nth-child(4)")
            ?.classList.add("active");

        refreshQueue();
    }

    if (section === "profile") {
        document.querySelector(".nav-item:nth-child(5)")
            ?.classList.add("active");
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

    const list =
        document.getElementById("discoverList");

    if (!list) return;

    list.innerHTML = `
        <div class="loading">
            Loading organizations...
        </div>
    `;


    // ================= FALLBACK ORGANIZATIONS =================
    // Used when GitHub Pages cannot reach localhost Spring Boot

    const fallbackOrganizations = [

        {
            organizationId: 1,
            organizationName: "QueueEase Hospital",
            organizationCode: "QE-HOSP-001",
            category: "Hospital",
            address: "Hyderabad"
        },

        {
            organizationId: 2,
            organizationName: "QueueEase College",
            organizationCode: "QE-COL-001",
            category: "College",
            address: "Hyderabad"
        },

        {
            organizationId: 3,
            organizationName: "QueueEase Salon",
            organizationCode: "QE-SAL-001",
            category: "Salon",
            address: "Hyderabad"
        },

        {
            organizationId: 4,
            organizationName: "QueueEase Restaurant",
            organizationCode: "QE-RES-001",
            category: "Restaurant",
            address: "Hyderabad"
        },

        {
            organizationId: 5,
            organizationName: "QueueEase Bank",
            organizationCode: "QE-BANK-001",
            category: "Bank",
            address: "Hyderabad"
        },

        {
            organizationId: 6,
            organizationName: "QueueEase Service Center",
            organizationCode: "QE-SC-001",
            category: "Service Center",
            address: "Hyderabad"
        },

        {
            organizationId: 7,
            organizationName: "QueueEase Rental",
            organizationCode: "QE-RENT-001",
            category: "Rental",
            address: "Hyderabad"
        },

        {
            organizationId: 8,
            organizationName: "QueueEase Government Office",
            organizationCode: "QE-GOV-001",
            category: "Government",
            address: "Hyderabad"
        }

    ];


    try {

        const response =
            await fetch(
                `${API_BASE}/organization/all`
            );

        if (!response.ok) {
            throw new Error(
                "Organization API failed"
            );
        }

        organizations =
            await response.json();

    } catch (error) {

        console.log(
            "Backend unavailable. Using fallback organizations.",
            error
        );

        organizations =
            fallbackOrganizations;
    }


    // ================= FILTER =================

    let filtered =
        organizations;

    if (category) {

        const selected =
            String(category)
                .toLowerCase()
                .trim();

        filtered =
            organizations.filter(org => {

                const name =
                    String(
                        org.organizationName || ""
                    ).toLowerCase();

                const code =
                    String(
                        org.organizationCode || ""
                    ).toLowerCase();

                const orgCategory =
                    String(
                        org.category || ""
                    ).toLowerCase();

                return (
                    name.includes(selected) ||
                    code.includes(selected) ||
                    orgCategory.includes(selected)
                );
            });
    }


    renderOrganizations(filtered);
}


// ================= RENDER ORGANIZATIONS =================

function renderOrganizations(list) {

    const container =
        document.getElementById(
            "discoverList"
        );

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


    container.innerHTML =
        list.map(org => {

            const name =
                org.organizationName ||
                "QueueEase Organization";

            const address =
                org.address ||
                "Hyderabad";

            const id =
                org.organizationId ??
                org.id;

            return `
                <div
                    class="organization-card"
                    onclick="openOrganization(${id})"
                >

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

async function searchOrganizations() {

    const homeInput =
        document.getElementById(
            "searchInput"
        );

    const discoverInput =
        document.getElementById(
            "discoverSearch"
        );

    let input;

    if (
        document.activeElement ===
        discoverInput
    ) {
        input = discoverInput;
    } else {
        input = homeInput;
    }

    if (!input) return;

    const search =
        input.value
            .trim()
            .toLowerCase();


    if (
        !organizations ||
        organizations.length === 0
    ) {
        await loadOrganizations();
    }


    let filtered =
        organizations;

    if (search !== "") {

        filtered =
            organizations.filter(org => {

                const name =
                    String(
                        org.organizationName || ""
                    ).toLowerCase();

                const address =
                    String(
                        org.address || ""
                    ).toLowerCase();

                const code =
                    String(
                        org.organizationCode || ""
                    ).toLowerCase();

                const category =
                    String(
                        org.category || ""
                    ).toLowerCase();

                return (
                    name.includes(search) ||
                    address.includes(search) ||
                    code.includes(search) ||
                    category.includes(search)
                );
            });
    }


    if (
        input === homeInput &&
        search !== ""
    ) {

        document.querySelectorAll(
            ".section"
        ).forEach(section => {
            section.classList.remove(
                "active"
            );
        });

        document.getElementById(
            "discoverSection"
        )?.classList.add("active");


        document.querySelectorAll(
            ".nav-item"
        ).forEach(item => {
            item.classList.remove(
                "active"
            );
        });


        document.querySelector(
            ".nav-item:nth-child(2)"
        )?.classList.add("active");


        if (discoverInput) {
            discoverInput.value =
                input.value;
        }
    }


    renderOrganizations(filtered);
}


// ================= OPEN ORGANIZATION =================

async function openOrganization(id) {

    selectedOrganization =
        organizations.find(org =>
            (
                org.organizationId ??
                org.id
            ) == id
        );

    if (!selectedOrganization) {
        return;
    }


    const name =
        selectedOrganization.organizationName ||
        "QueueEase Organization";

    const address =
        selectedOrganization.address ||
        "Hyderabad";


    const organizationName =
        document.getElementById(
            "organizationName"
        );

    if (organizationName) {
        organizationName.textContent =
            name;
    }


    const organizationAddress =
        document.getElementById(
            "organizationAddress"
        );

    if (organizationAddress) {
        organizationAddress.textContent =
            address;
    }


    const modal =
        document.getElementById(
            "organizationModal"
        );

    if (modal) {
        modal.classList.add("active");
    }


    await loadServices(id);
}
function renderServices(services) {
    const serviceList = document.getElementById("serviceList");

    if (!serviceList) return;

    if (!services || services.length === 0) {
        serviceList.innerHTML = `
            <p style="text-align:center;">No services available.</p>
        `;
        return;
    }

    serviceList.innerHTML = services.map(service => {
        const id = service.serviceId || service.id;
        const name = service.serviceName || service.name || "Service";
        const time =
            service.estimatedServiceTime ||
            service.estimated_service_time ||
            5;

        return `
            <button
                class="service-option"
                onclick="selectService(${id}, '${String(name).replace(/'/g, "\\'")}')">

                <div>
                    <strong>${name}</strong>
                    <small>Estimated time: ${time} min</small>
                </div>

                <span>→</span>
            </button>
        `;
    }).join("");
}

// ================= SERVICES =================
async function loadServices(organizationId) {
    const serviceList = document.getElementById("serviceList");

    if (!serviceList) return;

    const fallbackServices = {
        1: [
            { serviceId: 1, serviceName: "General Consultation", estimatedServiceTime: 10 },
            { serviceId: 2, serviceName: "Emergency Consultation", estimatedServiceTime: 15 },
            { serviceId: 3, serviceName: "Health Checkup", estimatedServiceTime: 10 }
        ],
        2: [
            { serviceId: 4, serviceName: "Admissions", estimatedServiceTime: 10 },
            { serviceId: 5, serviceName: "Student Services", estimatedServiceTime: 5 },
            { serviceId: 6, serviceName: "Fee Payment", estimatedServiceTime: 5 }
        ],
        3: [
            { serviceId: 7, serviceName: "Haircut", estimatedServiceTime: 20 },
            { serviceId: 8, serviceName: "Hair Styling", estimatedServiceTime: 25 },
            { serviceId: 9, serviceName: "Facial", estimatedServiceTime: 30 }
        ],
        4: [
            { serviceId: 10, serviceName: "Table Reservation", estimatedServiceTime: 5 },
            { serviceId: 11, serviceName: "Food Order", estimatedServiceTime: 15 },
            { serviceId: 12, serviceName: "Takeaway", estimatedServiceTime: 10 }
        ],
        5: [
            { serviceId: 13, serviceName: "Cash Counter", estimatedServiceTime: 10 },
            { serviceId: 14, serviceName: "Account Services", estimatedServiceTime: 15 },
            { serviceId: 15, serviceName: "Loan Services", estimatedServiceTime: 20 }
        ],
        6: [
            { serviceId: 16, serviceName: "Vehicle Service", estimatedServiceTime: 30 },
            { serviceId: 17, serviceName: "Repair Service", estimatedServiceTime: 25 },
            { serviceId: 18, serviceName: "General Service", estimatedServiceTime: 20 }
        ],
        7: [
            { serviceId: 19, serviceName: "Bike Rental", estimatedServiceTime: 10 },
            { serviceId: 20, serviceName: "Car Rental", estimatedServiceTime: 15 },
            { serviceId: 21, serviceName: "Vehicle Return", estimatedServiceTime: 10 }
        ],
        8: [
            { serviceId: 22, serviceName: "General Enquiry", estimatedServiceTime: 10 },
            { serviceId: 23, serviceName: "Certificate Services", estimatedServiceTime: 15 },
            { serviceId: 24, serviceName: "Application Services", estimatedServiceTime: 15 }
        ]
    };

    // GitHub Pages: use frontend services directly
    if (window.location.hostname.includes("github.io")) {
        renderServices(fallbackServices[organizationId] || []);
        return;
    }

    // Local version: use Spring Boot backend
    serviceList.innerHTML = `
        <p style="text-align:center;">Loading services...</p>
    `;

    try {
        const response = await fetch(
            `${API_BASE}/services/${organizationId}`
        );

        if (!response.ok) {
            throw new Error("Backend unavailable");
        }

        const services = await response.json();
        renderServices(services);

    } catch (error) {
        console.log("Using fallback services");
        renderServices(fallbackServices[organizationId] || []);
    }
}
// ================= SELECT SERVICE =================

function selectService(
    serviceId,
    serviceName
) {

    selectedService =
        serviceId;


    const selectedServiceElement =
        document.getElementById(
            "selectedService"
        );


    if (selectedServiceElement) {

        selectedServiceElement.textContent =
            serviceName;
    }


    closeModal(
        "organizationModal"
    );


    document.getElementById(
        "joinModal"
    )?.classList.add("active");
}


// ================= NOTIFICATION =================

function selectNotification(
    method,
    button
) {

    selectedNotificationMethod =
        method;


    document.querySelectorAll(
        ".notification-option"
    ).forEach(btn => {

        btn.classList.remove(
            "selected"
        );
    });


    if (button) {
        button.classList.add(
            "selected"
        );
    }


    const contact =
        document.getElementById(
            "contact"
        );


    if (!contact) return;


    if (method === "EMAIL") {

        contact.placeholder =
            "Enter email address";

    } else {

        contact.placeholder =
            "Enter mobile number";
    }
}


// ================= JOIN QUEUE =================

async function joinQueue() {

    const customerName =
        document.getElementById(
            "customerName"
        )?.value.trim();


    const contact =
        document.getElementById(
            "contact"
        )?.value.trim();


    if (!customerName) {

        alert(
            "Please enter your name."
        );

        return;
    }


    if (!contact) {

        alert(
            "Please enter your contact."
        );

        return;
    }


    if (!selectedOrganization) {

        alert(
            "Please select an organization."
        );

        return;
    }


    if (!selectedService) {

        alert(
            "Please select a service."
        );

        return;
    }


    const organizationId =
        selectedOrganization.organizationId ??
        selectedOrganization.id;


    const url =
        `${API_BASE}/queue/take?` +
        `customerName=${encodeURIComponent(customerName)}` +
        `&contact=${encodeURIComponent(contact)}` +
        `&notificationMethod=${encodeURIComponent(selectedNotificationMethod)}` +
        `&organizationId=${organizationId}` +
        `&serviceId=${selectedService}` +
        `&customerId=1`;


    try {

        console.log(
            "Joining queue:",
            url
        );


        const response =
            await fetch(url, {
                method: "GET"
            });


        if (!response.ok) {

            const message =
                await response.text();


            console.error(
                "Queue error:",
                message
            );


            throw new Error(
                message
            );
        }


        const token =
            await response.json();


        console.log(
            "Token received:",
            token
        );


        closeModal(
            "joinModal"
        );


        displayToken(token);

    } catch (error) {

        console.error(
            "Join Queue Error:",
            error
        );


        alert(
            "Unable to join queue.\n\n" +
            "Please check the Spring Boot server."
        );
    }
}


// ================= DISPLAY TOKEN =================

function displayToken(data) {

    const tokenNumber =
        data.tokenNumber ??
        data.token_number ??
        "--";


    const queuePosition =
        data.queuePosition ??
        data.queue_position ??
        "--";


    const waitTime =
        data.estimatedWaitingTime ??
        data.estimated_waiting_time ??
        "--";


    // TOKEN MODAL

    const tokenNumberElement =
        document.getElementById(
            "tokenNumber"
        );


    if (tokenNumberElement) {

        tokenNumberElement.textContent =
            "#" + tokenNumber;
    }


    const tokenPositionElement =
        document.getElementById(
            "tokenPosition"
        );


    if (tokenPositionElement) {

        tokenPositionElement.textContent =
            queuePosition;
    }


    const tokenWaitElement =
        document.getElementById(
            "tokenWait"
        );


    if (tokenWaitElement) {

        tokenWaitElement.textContent =
            waitTime + " min";
    }


    // MY QUEUE

    const queueToken =
        document.getElementById(
            "queueToken"
        );


    if (queueToken) {

        queueToken.textContent =
            "#" + tokenNumber;
    }


    const queuePositionElement =
        document.getElementById(
            "queuePosition"
        );


    if (queuePositionElement) {

        queuePositionElement.textContent =
            queuePosition;
    }


    const queueWait =
        document.getElementById(
            "queueWait"
        );


    if (queueWait) {

        queueWait.textContent =
            waitTime + " min";
    }


    // ACTIVE TICKET

    const activeOrganization =
        document.getElementById(
            "activeOrganization"
        );


    if (activeOrganization) {

        activeOrganization.textContent =
            selectedOrganization?.organizationName ||
            data.organizationName ||
            "QueueEase";
    }


    const activeTokenNumber =
        document.getElementById(
            "activeTokenNumber"
        );


    if (activeTokenNumber) {

        activeTokenNumber.textContent =
            "#" + tokenNumber;
    }


    const activePosition =
        document.getElementById(
            "activePosition"
        );


    if (activePosition) {

        activePosition.textContent =
            queuePosition;
    }


    const activeWait =
        document.getElementById(
            "activeWait"
        );


    if (activeWait) {

        activeWait.textContent =
            waitTime + " min";
    }


    document.getElementById(
        "activeTicket"
    )?.classList.remove(
        "hidden"
    );


    // PEOPLE AHEAD

    const ahead =
        Math.max(
            0,
            Number(queuePosition) - 1
        );


    const peopleAhead =
        document.getElementById(
            "peopleAhead"
        );


    if (peopleAhead) {

        peopleAhead.textContent =
            ahead +
            " people ahead";
    }


    // PROGRESS

    const progress =
        document.getElementById(
            "queueProgress"
        );


    if (progress) {

        progress.style.width =
            Math.max(
                5,
                Math.min(
                    100,
                    100 /
                    Number(
                        queuePosition || 1
                    )
                )
            ) + "%";
    }


    // NOTIFICATION

    const notificationMessage =
        document.getElementById(
            "notificationMessage"
        );


    if (notificationMessage) {

        notificationMessage.textContent =
            "🔔 Queue updates enabled";
    }


    // SAVE TOKEN

    localStorage.setItem(
        "queueEaseToken",
        JSON.stringify(data)
    );


    // ================= REAL QR CODE =================

    const qrCode =
        document.getElementById(
            "qrCode"
        );


    if (
        qrCode &&
        tokenNumber !== "--"
    ) {

        qrCode.innerHTML = "";


        const basePath =
            window.location.pathname.substring(
                0,
                window.location.pathname.lastIndexOf("/") + 1
            );


        const liveQueueURL =
            window.location.origin +
            basePath +
            "live-queue.html?token=" +
            encodeURIComponent(
                tokenNumber
            );


        console.log(
            "REAL QR URL:",
            liveQueueURL
        );


        if (
            typeof QRCode !== "undefined"
        ) {

            new QRCode(
                qrCode,
                {
                    text: liveQueueURL,

                    width: 260,

                    height: 260,

                    colorDark: "#000000",

                    colorLight: "#ffffff",

                    correctLevel:
                        QRCode.CorrectLevel.H
                }
            );

        } else {

            console.error(
                "QRCode library not loaded."
            );


            qrCode.innerHTML = `
                <div
                    style="
                        color:#000;
                        background:#fff;
                        padding:20px;
                        border-radius:10px;
                        text-align:center;
                    "
                >
                    QR Code unavailable
                </div>
            `;
        }
    }


    // OPEN TOKEN MODAL

    document.getElementById(
        "tokenModal"
    )?.classList.add(
        "active"
    );
}


// ================= REFRESH QUEUE =================

async function refreshQueue() {

    const saved =
        localStorage.getItem(
            "queueEaseToken"
        );


    if (!saved) return;


    let oldData;


    try {

        oldData =
            JSON.parse(saved);

    } catch (error) {

        console.error(
            "Saved token error:",
            error
        );

        return;
    }


    try {

        const response =
            await fetch(
                `${API_BASE}/queue/all`
            );


        if (!response.ok) return;


        const tokens =
            await response.json();


        const oldTokenNumber =
            oldData.tokenNumber ??
            oldData.token_number;


        const current =
            tokens.find(token =>
                (
                    token.tokenNumber ??
                    token.token_number
                ) == oldTokenNumber
            );


        if (!current) return;


        displayQueueData(
            current
        );

    } catch (error) {

        console.error(
            "Refresh queue error:",
            error
        );
    }
}


// ================= QUEUE DATA =================

function displayQueueData(data) {

    const tokenNumber =
        data.tokenNumber ??
        data.token_number;


    const queuePosition =
        data.queuePosition ??
        data.queue_position;


    const waitTime =
        data.estimatedWaitingTime ??
        data.estimated_waiting_time;


    const queueToken =
        document.getElementById(
            "queueToken"
        );


    if (queueToken) {

        queueToken.textContent =
            "#" + tokenNumber;
    }


    const queuePositionElement =
        document.getElementById(
            "queuePosition"
        );


    if (queuePositionElement) {

        queuePositionElement.textContent =
            queuePosition;
    }


    const queueWait =
        document.getElementById(
            "queueWait"
        );


    if (queueWait) {

        queueWait.textContent =
            waitTime + " min";
    }


    const ahead =
        Math.max(
            0,
            Number(queuePosition) - 1
        );


    const peopleAhead =
        document.getElementById(
            "peopleAhead"
        );


    if (peopleAhead) {

        peopleAhead.textContent =
            ahead +
            " people ahead";
    }


    const progress =
        document.getElementById(
            "queueProgress"
        );


    if (progress) {

        progress.style.width =
            Math.max(
                5,
                Math.min(
                    100,
                    100 /
                    Number(
                        queuePosition || 1
                    )
                )
            ) + "%";
    }


    const activeTokenNumber =
        document.getElementById(
            "activeTokenNumber"
        );


    if (activeTokenNumber) {

        activeTokenNumber.textContent =
            "#" + tokenNumber;
    }


    const activePosition =
        document.getElementById(
            "activePosition"
        );


    if (activePosition) {

        activePosition.textContent =
            queuePosition;
    }


    const activeWait =
        document.getElementById(
            "activeWait"
        );


    if (activeWait) {

        activeWait.textContent =
            waitTime + " min";
    }


    const activeOrganization =
        document.getElementById(
            "activeOrganization"
        );


    if (
        activeOrganization &&
        data.organizationName
    ) {

        activeOrganization.textContent =
            data.organizationName;
    }
}


// ================= MODALS =================

function closeModal(id) {

    const modal =
        document.getElementById(id);


    if (modal) {

        modal.classList.remove(
            "active"
        );
    }


    if (
        id === "scannerModal"
    ) {

        stopScanner();
    }
}


// ================= QR SCANNER =================

let scannerStream = null;
let scannerRunning = false;


async function openScanner() {

    const modal =
        document.getElementById(
            "scannerModal"
        );


    if (!modal) return;


    modal.classList.add(
        "active"
    );


    const video =
        document.getElementById(
            "scannerVideo"
        );


    const message =
        document.getElementById(
            "scannerMessage"
        );


    if (!video) return;


    try {

        if (
            !("BarcodeDetector" in window)
        ) {

            if (message) {

                message.textContent =
                    "QR scanner is not supported in this browser.";
            }

            return;
        }


        const detector =
            new BarcodeDetector({
                formats: ["qr_code"]
            });


        scannerStream =
            await navigator.mediaDevices
                .getUserMedia({

                    video: {

                        facingMode: {
                            ideal: "environment"
                        },

                        width: {
                            ideal: 1280
                        },

                        height: {
                            ideal: 720
                        }
                    },

                    audio: false
                });


        video.srcObject =
            scannerStream;


        await video.play();


        scannerRunning = true;


        if (message) {

            message.textContent =
                "Camera active. Point it at a QueueEase QR code.";
        }


        scanQRCode(
            detector,
            video
        );

    } catch (error) {

        console.error(
            "Scanner error:",
            error
        );


        if (message) {

            message.textContent =
                "Camera permission was not available.";
        }


        stopScanner();
    }
}


// ================= SCAN QR CODE =================

async function scanQRCode(
    detector,
    video
) {

    if (!scannerRunning) {
        return;
    }


    try {

        const barcodes =
            await detector.detect(
                video
            );


        if (
            barcodes.length > 0
        ) {

            const qrData =
                barcodes[0].rawValue;


            console.log(
                "QR Code detected:",
                qrData
            );


            scannerRunning =
                false;


            stopScanner();


            // FULL URL

            if (
                qrData.startsWith(
                    "http://"
                ) ||
                qrData.startsWith(
                    "https://"
                )
            ) {

                window.location.href =
                    qrData;

                return;
            }


            // TOKEN NUMBER ONLY

            const tokenNumber =
                qrData.match(
                    /\d+/
                );


            if (tokenNumber) {

                const basePath =
                    window.location.pathname.substring(
                        0,
                        window.location.pathname.lastIndexOf("/") + 1
                    );


                window.location.href =
                    window.location.origin +
                    basePath +
                    "live-queue.html?token=" +
                    encodeURIComponent(
                        tokenNumber[0]
                    );

                return;
            }


            const message =
                document.getElementById(
                    "scannerMessage"
                );


            if (message) {

                message.textContent =
                    "Invalid QueueEase QR code.";
            }


            return;
        }

    } catch (error) {

        console.log(
            "QR detection:",
            error
        );
    }


    if (scannerRunning) {

        requestAnimationFrame(() => {

            scanQRCode(
                detector,
                video
            );

        });
    }
}


// ================= CLOSE SCANNER =================

function closeScanner() {

    scannerRunning =
        false;


    stopScanner();


    closeModal(
        "scannerModal"
    );
}


// ================= STOP SCANNER =================

function stopScanner() {

    scannerRunning =
        false;


    if (scannerStream) {

        scannerStream
            .getTracks()
            .forEach(track => {

                track.stop();

            });


        scannerStream =
            null;
    }


    const video =
        document.getElementById(
            "scannerVideo"
        );


    if (video) {

        video.pause();

        video.srcObject =
            null;
    }
}


// ================= HELPERS =================

function escapeText(text) {

    return String(text)
        .replace(
            /\\/g,
            "\\\\"
        )
        .replace(
            /'/g,
            "\\'"
        )
        .replace(
            /"/g,
            "&quot;"
        );
}


// ================= INITIALIZE =================

document.addEventListener(
    "DOMContentLoaded",
    () => {

        showSection(
            "home"
        );


        loadOrganizations();


        const saved =
            localStorage.getItem(
                "queueEaseToken"
            );


        if (saved) {

            try {

                const data =
                    JSON.parse(
                        saved
                    );


                if (data) {

                    displayTokenDataWithoutModal(
                        data
                    );
                }

            } catch (error) {

                console.error(
                    "Token restore error:",
                    error
                );
            }
        }
    }
);


// ================= RESTORE ACTIVE TOKEN =================

function displayTokenDataWithoutModal(
    data
) {

    const tokenNumber =
        data.tokenNumber ??
        data.token_number ??
        "--";


    const queuePosition =
        data.queuePosition ??
        data.queue_position ??
        "--";


    const waitTime =
        data.estimatedWaitingTime ??
        data.estimated_waiting_time ??
        "--";


    document.getElementById(
        "activeTicket"
    )?.classList.remove(
        "hidden"
    );


    const activeTokenNumber =
        document.getElementById(
            "activeTokenNumber"
        );


    if (activeTokenNumber) {

        activeTokenNumber.textContent =
            "#" + tokenNumber;
    }


    const activePosition =
        document.getElementById(
            "activePosition"
        );


    if (activePosition) {

        activePosition.textContent =
            queuePosition;
    }


    const activeWait =
        document.getElementById(
            "activeWait"
        );


    if (activeWait) {

        activeWait.textContent =
            waitTime + " min";
    }


    const activeOrganization =
        document.getElementById(
            "activeOrganization"
        );


    if (activeOrganization) {

        activeOrganization.textContent =
            data.organizationName ||
            "QueueEase";
    }
}


// ================= HTML FUNCTIONS =================

window.showSection =
    showSection;

window.selectCategory =
    selectCategory;

window.loadOrganizations =
    loadOrganizations;

window.searchOrganizations =
    searchOrganizations;

window.openOrganization =
    openOrganization;

window.loadServices =
    loadServices;

window.selectService =
    selectService;

window.selectNotification =
    selectNotification;

window.joinQueue =
    joinQueue;

window.refreshQueue =
    refreshQueue;

window.displayToken =
    displayToken;

window.closeModal =
    closeModal;

window.openScanner =
    openScanner;

window.closeScanner =
    closeScanner;