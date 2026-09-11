/* =====================================================
   QUEUEEASE FRONTEND
   Spring Boot Integration
===================================================== */


/* ================= CONFIG ================= */

const API_BASE = "";

const ORGANIZATION_ID = 1;
const SERVICE_ID = 1;
const CUSTOMER_ID = 1;


/* ================= STATE ================= */

let selectedNotification = "EMAIL";

let selectedOrganizationId = 1;
let selectedServiceId = null;

let currentToken = null;

let scannerStream = null;

let userLatitude = null;
let userLongitude = null;

let queueEaseMap = null;
let userLocationMarker = null;


/* ================= CATEGORY SERVICES ================= */

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


/* ================= NAVIGATION ================= */

function showSection(section) {

    document.querySelectorAll(".section")
        .forEach(element => {
            element.classList.remove("active");
        });

    const target =
        document.getElementById(section + "Section");

    if (target) {
        target.classList.add("active");
    }

    document.querySelectorAll(".nav-item")
        .forEach(item => {
            item.classList.remove("active");
        });

    if (section === "home") {
        document.querySelectorAll(".nav-item")[0]
            ?.classList.add("active");
    }

    if (section === "discover") {

        document.querySelectorAll(".nav-item")[1]
            ?.classList.add("active");

        setTimeout(() => {
            initializeQueueEaseMap();
        }, 200);
    }

    if (section === "queue") {

        document.querySelectorAll(".nav-item")[3]
            ?.classList.add("active");

        refreshQueue();
    }

    if (section === "profile") {

        document.querySelectorAll(".nav-item")[4]
            ?.classList.add("active");
    }

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


/* ================= MODALS ================= */

function openModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.add("show");
    }
}


function closeModal(id) {

    const modal = document.getElementById(id);

    if (modal) {
        modal.classList.remove("show");
    }
}


/* ================= CATEGORY ================= */

function selectCategory(category) {

    console.log(
        "CATEGORY SELECTED:",
        category
    );

    showSection("discover");

    const searchBox =
        document.getElementById(
            "discoverSearch"
        );

    if (searchBox) {

        searchBox.value = "";

        searchBox.placeholder =
            "Search " + category + "...";
    }

    loadOrganizations(category);
}


/* ================= ORGANIZATION ================= */

async function openOrganization(id) {

    selectedOrganizationId =
        Number(id);

    /* Reset service until user selects one */
    selectedServiceId = null;

    console.log(
        "Opening organization:",
        selectedOrganizationId
    );

    try {

        /* ================= LOAD ORGANIZATIONS ================= */

        const organizationResponse =
            await fetch(
                API_BASE +
                "/organizations"
            );

        if (!organizationResponse.ok) {

            throw new Error(
                "Unable to load organizations"
            );
        }

        const organizations =
            await organizationResponse.json();


        const organization =
            organizations.find(
                org =>
                    Number(org.organizationId) ===
                    Number(id)
            );


        if (!organization) {

            alert(
                "Organization not found."
            );

            return;
        }


        /* ================= DISPLAY ORGANIZATION ================= */

        const organizationName =
            document.getElementById(
                "organizationName"
            );

        if (organizationName) {

            organizationName.textContent =
                organization.organizationName;
        }


        const organizationAddress =
            document.getElementById(
                "organizationAddress"
            );

        if (organizationAddress) {

            organizationAddress.textContent =
                (organization.category ||
                    "General") +
                " • " +
                (organization.address ||
                    "Location unavailable");
        }


        /* ================= LOAD SERVICES ================= */

        console.log(
            "Loading services for organization:",
            id
        );


        const serviceResponse =
            await fetch(
                API_BASE +
                "/services/" +
                id
            );


        if (!serviceResponse.ok) {

            throw new Error(
                "Unable to load services"
            );
        }


        const services =
            await serviceResponse.json();


        console.log(
            "Services received:",
            services
        );


        /* ================= SERVICE LIST ================= */

        const serviceList =
            document.getElementById(
                "serviceList"
            );


        if (!serviceList) {

            console.error(
                "serviceList element not found in HTML."
            );

            alert(
                "Service selection area is missing."
            );

            return;
        }


        /* Clear old services */

        serviceList.innerHTML = "";


        /* ================= NO SERVICES ================= */

        if (
            !Array.isArray(services) ||
            services.length === 0
        ) {

            serviceList.innerHTML = `
                <div class="loading-message">
                    No services available for this organization.
                </div>
            `;

            openModal(
                "organizationModal"
            );

            return;
        }


        /* ================= SERVICE TITLE ================= */

        const serviceTitle =
            document.getElementById(
                "serviceTitle"
            );

        if (serviceTitle) {

            serviceTitle.textContent =
                "Select a Service";
        }


        /* ================= DISPLAY SERVICES ================= */

        services.forEach(
            service => {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";


                button.className =
                    "service-option";


                button.setAttribute(
                    "data-service-id",
                    service.serviceId
                );


                button.innerHTML = `

                    <div class="service-content">

                        <strong>
                            ${escapeHtml(
                                service.serviceName ||
                                "Service"
                            )}
                        </strong>

                        <small>
                            Estimated service time:
                            ${Number(
                                service.estimatedServiceTime || 5
                            )} min
                        </small>

                    </div>

                    <span class="service-arrow">
                        ›
                    </span>

                `;


                /* ================= SERVICE CLICK ================= */

                button.addEventListener(
                    "click",
                    function () {

                        selectedOrganizationId =
                            Number(id);

                        selectedServiceId =
                            Number(
                                service.serviceId
                            );


                        console.log(
                            "Organization selected:",
                            selectedOrganizationId
                        );


                        console.log(
                            "Service selected:",
                            selectedServiceId
                        );


                        /* ================= DISPLAY SELECTED SERVICE ================= */

                        const selectedService =
                            document.getElementById(
                                "selectedService"
                            );


                        if (selectedService) {

                            selectedService.textContent =
                                service.serviceName;
                        }


                        /* ================= CLOSE ORGANIZATION MODAL ================= */

                        closeModal(
                            "organizationModal"
                        );


                        /* ================= OPEN JOIN MODAL ================= */

                        openModal(
                            "joinModal"
                        );

                    }
                );


                serviceList.appendChild(
                    button
                );

            }
        );


        /* ================= OPEN SERVICE MODAL ================= */

        openModal(
            "organizationModal"
        );

    }

    catch (error) {

        console.error(
            "Organization error:",
            error
        );

        alert(
            "Unable to load organization details."
        );
    }
}


/* ================= HTML ESCAPE ================= */

function escapeHtml(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= NOTIFICATION ================= */

function selectNotification(
    method,
    button
) {

    selectedNotification =
        method;


    document.querySelectorAll(
        ".notification-option"
    )
    .forEach(item => {

        item.classList.remove(
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


    if (!contact) {
        return;
    }


    if (method === "EMAIL") {

        contact.placeholder =
            "Enter email address";

    }

    else {

        contact.placeholder =
            "Enter mobile number";
    }
}


/* ================= JOIN QUEUE ================= */

async function joinQueue() {

    const nameElement =
        document.getElementById(
            "customerName"
        );

    const contactElement =
        document.getElementById(
            "contact"
        );


    if (!nameElement ||
        !contactElement) {

        alert(
            "Customer details form is unavailable."
        );

        return;
    }


    const name =
        nameElement.value
            .trim();


    const contact =
        contactElement.value
            .trim();


    if (!name) {

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


    if (!selectedOrganizationId) {

        alert(
            "Please select an organization."
        );

        return;
    }


    if (!selectedServiceId) {

        alert(
            "Please select a service."
        );

        return;
    }


    const url =
        API_BASE +
        "/queue/take?" +

        "customerName=" +
        encodeURIComponent(
            name
        ) +

        "&contact=" +
        encodeURIComponent(
            contact
        ) +

        "&notificationMethod=" +
        encodeURIComponent(
            selectedNotification
        ) +

        "&organizationId=" +
        selectedOrganizationId +

        "&serviceId=" +
        selectedServiceId +

        "&customerId=" +
        CUSTOMER_ID;


    console.log(
        "JOIN QUEUE URL:",
        url
    );


    try {

        const response =
            await fetch(url);


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Queue API error:",
                errorText
            );

            throw new Error(
                "Unable to join queue"
            );
        }


        const token =
            await response.json();


        currentToken =
            token;


        displayToken(
            token
        );


        closeModal(
            "joinModal"
        );


        openModal(
            "tokenModal"
        );


        localStorage.setItem(
            "queueToken",
            JSON.stringify(token)
        );


        updateActiveTicket(
            token
        );

    }

    catch (error) {

        console.error(
            "Join queue error:",
            error
        );

        alert(
            "Unable to join the queue. " +
            "Please check that the Spring Boot server is running."
        );
    }
}


/* ================= DISPLAY TOKEN ================= */

function displayToken(token) {

    const tokenNumber =
        document.getElementById(
            "tokenNumber"
        );

    if (tokenNumber) {

        tokenNumber.textContent =
            "#" +
            token.tokenNumber;
    }


    const tokenPosition =
        document.getElementById(
            "tokenPosition"
        );

    if (tokenPosition) {

        tokenPosition.textContent =
            token.queuePosition;
    }


    const tokenWait =
        document.getElementById(
            "tokenWait"
        );

    if (tokenWait) {

        tokenWait.textContent =
            token.estimatedWaitingTime +
            " min";
    }


    generateQRCode(
        token
    );


    const notificationMessage =
        document.getElementById(
            "notificationMessage"
        );

    if (notificationMessage) {

        notificationMessage.textContent =
            "🔔 Queue updates will be sent by " +
            token.notificationMethod +
            ".";
    }


    const queueToken =
        document.getElementById(
            "queueToken"
        );

    if (queueToken) {

        queueToken.textContent =
            "#" +
            token.tokenNumber;
    }


    const queuePosition =
        document.getElementById(
            "queuePosition"
        );

    if (queuePosition) {

        queuePosition.textContent =
            token.queuePosition;
    }


    const queueWait =
        document.getElementById(
            "queueWait"
        );

    if (queueWait) {

        queueWait.textContent =
            token.estimatedWaitingTime +
            " min";
    }


    const peopleAhead =
        document.getElementById(
            "peopleAhead"
        );

    if (peopleAhead) {

        peopleAhead.textContent =
            Math.max(
                token.queuePosition - 1,
                0
            ) +
            " people ahead";
    }


    updateProgress(
        token
    );
}


/* ================= REAL QR CODE ================= */

function generateQRCode(token) {

    const qrContainer =
        document.getElementById(
            "qrCode"
        );


    if (!qrContainer) {

        console.error(
            "QR Code container not found"
        );

        return;
    }


    qrContainer.innerHTML = "";


    const queueUrl =
        window.location.origin +
        "/live-queue.html?token=" +
        token.tokenNumber;


    console.log(
        "QR URL:",
        queueUrl
    );


    const qrImage =
        document.createElement(
            "img"
        );


    qrImage.src =
        "https://api.qrserver.com/v1/create-qr-code/?size=170x170&data=" +
        encodeURIComponent(
            queueUrl
        );


    qrImage.alt =
        "QueueEase Digital Pass QR Code";


    qrImage.width = 170;

    qrImage.height = 170;


    qrImage.onload =
        function () {

            console.log(
                "QR Code loaded successfully"
            );
        };


    qrImage.onerror =
        function () {

            console.error(
                "QR Code image failed to load"
            );
        };


    qrContainer.appendChild(
        qrImage
    );
}


/* ================= ACTIVE TICKET ================= */

function updateActiveTicket(token) {

    const activeTicket =
        document.getElementById(
            "activeTicket"
        );


    if (!activeTicket) {
        return;
    }


    activeTicket.classList.remove(
        "hidden"
    );


    const activeToken =
        document.getElementById(
            "activeToken"
        );


    if (activeToken) {

        activeToken.textContent =
            "#" +
            token.tokenNumber;
    }


    const activePosition =
        document.getElementById(
            "activePosition"
        );


    if (activePosition) {

        activePosition.textContent =
            token.queuePosition;
    }


    const activeWait =
        document.getElementById(
            "activeWait"
        );


    if (activeWait) {

        activeWait.textContent =
            token.estimatedWaitingTime +
            " min";
    }
}


/* ================= QUEUE PROGRESS ================= */

function updateProgress(token) {

    const position =
        Number(
            token.queuePosition
        );


    const percentage =
        Math.max(
            10,
            Math.min(
                90,
                100 - position * 5
            )
        );


    const progress =
        document.getElementById(
            "queueProgress"
        );


    if (progress) {

        progress.style.width =
            percentage + "%";
    }
}


/* ================= REFRESH QUEUE ================= */

async function refreshQueue() {

    try {

        const response =
            await fetch(
                API_BASE +
                "/queue/all"
            );


        if (!response.ok) {

            throw new Error(
                "Queue API failed"
            );
        }


        const tokens =
            await response.json();


        const saved =
            localStorage.getItem(
                "queueToken"
            );


        if (!saved) {

            return;
        }


        const myToken =
            JSON.parse(
                saved
            );


        const latest =
            tokens.find(
                token =>
                    Number(
                        token.tokenNumber
                    ) ===
                    Number(
                        myToken.tokenNumber
                    )
            );


        if (latest) {

            currentToken =
                latest;


            displayToken(
                latest
            );


            localStorage.setItem(
                "queueToken",
                JSON.stringify(latest)
            );
        }

    }

    catch (error) {

        console.error(
            "Queue refresh error:",
            error
        );
    }
}


/* ================= SEARCH ================= */

function searchOrganizations() {

    const searchInput =
        document.getElementById(
            "searchInput"
        );


    if (!searchInput) {
        return;
    }


    const query =
        searchInput.value
            .toLowerCase()
            .trim();


    const cards =
        document.querySelectorAll(
            ".business-card"
        );


    cards.forEach(
        card => {

            const text =
                card.innerText
                    .toLowerCase();


            card.style.display =
                text.includes(query)
                    ? ""
                    : "none";
        }
    );
}


/* ================= REAL USER LOCATION ================= */

function getUserLocation() {

    if (!navigator.geolocation) {

        console.log(
            "Geolocation is not supported."
        );

        return;
    }


    navigator.geolocation.getCurrentPosition(

        position => {

            userLatitude =
                position.coords.latitude;


            userLongitude =
                position.coords.longitude;


            console.log(
                "User Location:",
                userLatitude,
                userLongitude
            );


            if (queueEaseMap) {

                queueEaseMap.setView(
                    [
                        userLatitude,
                        userLongitude
                    ],
                    14
                );


                if (userLocationMarker) {

                    queueEaseMap.removeLayer(
                        userLocationMarker
                    );
                }


                userLocationMarker =
                    L.marker(
                        [
                            userLatitude,
                            userLongitude
                        ]
                    )
                    .addTo(
                        queueEaseMap
                    )
                    .bindPopup(
                        "You are here"
                    );
            }

        },

        error => {

            console.log(
                "Location error:",
                error.message
            );
        }
    );
}


/* ================= NEARBY PLACES ================= */

async function loadNearbyPlaces(
    category
) {

    if (
        userLatitude === null ||
        userLongitude === null
    ) {

        console.log(
            "User location not available."
        );

        return;
    }


    const categoryTags = {

        Hospital:
            '["amenity"="hospital"]',

        College:
            '["amenity"="college"]',

        Salon:
            '["shop"="hairdresser"]',

        Restaurant:
            '["amenity"="restaurant"]',

        Bank:
            '["amenity"="bank"]',

        "Service Center":
            '["shop"="car_repair"]',

        Rental:
            '["amenity"="car_rental"]',

        Government:
            '["office"="government"]'
    };


    const tag =
        categoryTags[category];


    if (!tag) {

        console.log(
            "Unknown category:",
            category
        );

        return;
    }


    const query = `
        [out:json][timeout:10];
        node${tag}(around:3000,${userLatitude},${userLongitude});
        out;
    `;


    try {

        const response =
            await fetch(
                "https://overpass.kumi.systems/api/interpreter",
                {
                    method: "POST",
                    body: query
                }
            );


        if (!response.ok) {

            throw new Error(
                "Overpass server error: " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            category +
            " nearby places:",
            data.elements
        );


        const list =
            document.getElementById(
                "discoverList"
            );


        if (list) {

            list.innerHTML = "";
        }


        if (queueEaseMap) {

            queueEaseMap.eachLayer(
                layer => {

                    if (
                        layer instanceof L.Marker &&
                        layer !== userLocationMarker
                    ) {

                        queueEaseMap.removeLayer(
                            layer
                        );
                    }
                }
            );
        }


        data.elements.forEach(
            place => {

                const tags =
                    place.tags || {};


                const name =
                    tags.name ||
                    "Unnamed " +
                    category;


                const latitude =
                    place.lat;


                const longitude =
                    place.lon;


                /* Distance */

                const R = 6371;


                const dLat =
                    (
                        latitude -
                        userLatitude
                    ) *
                    Math.PI /
                    180;


                const dLon =
                    (
                        longitude -
                        userLongitude
                    ) *
                    Math.PI /
                    180;


                const a =
                    Math.sin(
                        dLat / 2
                    ) *
                    Math.sin(
                        dLat / 2
                    ) +

                    Math.cos(
                        userLatitude *
                        Math.PI /
                        180
                    ) *

                    Math.cos(
                        latitude *
                        Math.PI /
                        180
                    ) *

                    Math.sin(
                        dLon / 2
                    ) *
                    Math.sin(
                        dLon / 2
                    );


                const c =
                    2 *
                    Math.atan2(
                        Math.sqrt(a),
                        Math.sqrt(1 - a)
                    );


                const distance =
                    (
                        R * c
                    ).toFixed(1);


                /* Address */

                const address = [

                    tags[
                        "addr:housenumber"
                    ],

                    tags[
                        "addr:street"
                    ],

                    tags[
                        "addr:suburb"
                    ]

                ]
                .filter(Boolean)
                .join(", ");


                const locationText =
                    address ||
                    "Nearby location";


                /* Opening hours */

                let openingText =
                    "Hours unavailable";


                if (
                    tags.opening_hours
                ) {

                    openingText =
                        tags.opening_hours;
                }


                /* MAP MARKER */

                if (queueEaseMap) {

                    L.marker(
                        [
                            latitude,
                            longitude
                        ]
                    )
                    .addTo(
                        queueEaseMap
                    )
                    .bindPopup(`
                        <b>${escapeHtml(name)}</b><br>
                        ${distance} km away
                    `);
                }


                /* CARD */

                if (list) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "business-card";


                    card.innerHTML = `

                        <div class="business-icon">
                            📍
                        </div>

                        <div class="business-info">

                            <div class="business-rating">
                                📍 ${distance} km
                            </div>

                            <h3>
                                ${escapeHtml(name)}
                            </h3>

                            <p>
                                ${escapeHtml(category)}
                            </p>

                            <p>
                                📍 ${escapeHtml(locationText)}
                            </p>

                            <p>
                                🕒 ${escapeHtml(openingText)}
                            </p>

                            <div class="business-actions">

                                <button
                                    onclick="openGoogleMaps(
                                        ${latitude},
                                        ${longitude}
                                    )">
                                    View on Map
                                </button>

                                <button
                                    onclick='joinNearbyQueue(
                                        ${JSON.stringify(name)},
                                        ${JSON.stringify(category)},
                                        ${JSON.stringify(locationText)}
                                    )'>
                                    Join Queue
                                </button>

                            </div>

                        </div>
                    `;


                    list.appendChild(
                        card
                    );
                }
            }
        );


        console.log(
            "Displayed places:",
            data.elements.length
        );

    }

    catch (error) {

        console.error(
            "Nearby places error:",
            error
        );
    }
}


/* ================= GOOGLE MAPS ================= */

function openGoogleMaps(
    latitude,
    longitude
) {

    window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`,
        "_blank"
    );
}


/* ================= NEARBY QUEUE ================= */

async function joinNearbyQueue(
    placeName,
    category,
    address
) {

    console.log(
        "Nearby organization:",
        placeName,
        category,
        address
    );


    try {

        const response =
            await fetch(
                API_BASE +
                "/organizations"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load organizations"
            );
        }


        const organizations =
            await response.json();


        const matchingOrganization =
            organizations.find(
                organization =>

                    organization.organizationName
                        ?.toLowerCase()
                        .trim() ===
                    placeName
                        .toLowerCase()
                        .trim()
            );


        if (!matchingOrganization) {

            alert(
                placeName +
                " is not registered with QueueEase yet."
            );

            return;
        }


        await openOrganization(
            matchingOrganization.organizationId
        );

    }

    catch (error) {

        console.error(
            "Nearby queue error:",
            error
        );

        alert(
            "Unable to connect this place to QueueEase."
        );
    }
}


/* ================= QUEUEEASE MAP ================= */

function initializeQueueEaseMap() {

    const mapElement =
        document.getElementById(
            "queueEaseMap"
        );


    if (!mapElement) {

        console.log(
            "Map element not found."
        );

        return;
    }


    if (queueEaseMap) {

        setTimeout(() => {

            queueEaseMap.invalidateSize();

        }, 100);

        return;
    }


    const hyderabad =
        [
            17.3850,
            78.4867
        ];


    queueEaseMap =
        L.map(
            "queueEaseMap"
        )
        .setView(
            hyderabad,
            13
        );


    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution:
                "&copy; OpenStreetMap contributors"
        }
    )
    .addTo(
        queueEaseMap
    );


    L.marker(
        hyderabad
    )
    .addTo(
        queueEaseMap
    )
    .bindPopup(
        "QueueEase - Hyderabad"
    );
}


/* ================= DISCOVER ================= */

async function loadOrganizations(
    category = null
) {

    const list =
        document.getElementById(
            "discoverList"
        );


    if (!list) {
        return;
    }


    list.innerHTML = `
        <div class="loading-message">
            Loading organizations...
        </div>
    `;


    try {

        const response =
            await fetch(
                API_BASE +
                "/organizations"
            );


        if (!response.ok) {

            throw new Error(
                "Unable to load organizations"
            );
        }


        const organizations =
            await response.json();


        const filteredOrganizations =
            category
                ? organizations.filter(
                    organization =>
                        (
                            organization.category ||
                            ""
                        )
                        .toLowerCase()
                        ===
                        category.toLowerCase()
                )
                : organizations;


        if (
            filteredOrganizations.length === 0
        ) {

            list.innerHTML = `
                <div class="loading-message">
                    No ${
                        category || ""
                    } organizations available.
                </div>
            `;

            return;
        }


        list.innerHTML = "";


        filteredOrganizations.forEach(
            organization => {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "business-card";


                const organizationCategory =
                    organization.category ||
                    "General";


                card.innerHTML = `

                    <div class="business-image">
                        ${getCategoryIcon(
                            organizationCategory
                        )}
                    </div>

                    <div class="business-content">

                        <div class="rating">
                            ★ 4.8
                        </div>

                        <h3>
                            ${escapeHtml(
                                organization.organizationName
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                organizationCategory
                            )}
                            •
                            ${
                                escapeHtml(
                                    organization.address ||
                                    "Location unavailable"
                                )
                            }
                        </p>

                        <div class="business-bottom">

                            <span>
                                🟢 Open
                            </span>

                            <span>
                                📍
                                ${
                                    escapeHtml(
                                        organization.organizationCode ||
                                        ""
                                    )
                                }
                            </span>

                        </div>

                        <button
                            class="details-button"
                            type="button"
                        >
                            View details →
                        </button>

                    </div>
                `;


                const detailsButton =
                    card.querySelector(
                        ".details-button"
                    );


                if (detailsButton) {

                    detailsButton.addEventListener(
                        "click",
                        () => {

                            openOrganization(
                                organization.organizationId
                            );

                        }
                    );
                }


                list.appendChild(
                    card
                );

            }
        );

    }

    catch (error) {

        console.error(
            "Organization loading error:",
            error
        );


        list.innerHTML = `
            <div class="loading-message">
                Unable to load organizations.
                Please check that the Spring Boot server is running.
            </div>
        `;
    }
}


/* ================= ALL CATEGORIES ================= */

function showAllCategories() {

    showSection(
        "discover"
    );


    const categoryArea =
        document.getElementById(
            "discoverCategories"
        );


    if (!categoryArea) {
        return;
    }


    categoryArea.innerHTML = "";


    Object.keys(
        categoryServices
    )
    .forEach(
        category => {

            const button =
                document.createElement(
                    "button"
                );


            button.className =
                "category-card";


            button.type =
                "button";


            button.innerHTML = `
                <div>
                    ${getCategoryIcon(
                        category
                    )}
                </div>

                <span>
                    ${escapeHtml(
                        category
                    )}
                </span>
            `;


            button.onclick = () =>
                selectCategory(
                    category
                );


            categoryArea.appendChild(
                button
            );

        }
    );


    loadOrganizations();
}


/* ================= CATEGORY ICON ================= */

function getCategoryIcon(
    category
) {

    const icons = {

        Hospital: "🏥",

        College: "🎓",

        Salon: "💇",

        Restaurant: "🍽️",

        Bank: "🏦",

        "Service Center": "🔧",

        Rental: "🚗",

        Government: "🏛️"
    };


    return icons[category] ||
        "📍";
}


/* ================= QR SCANNER ================= */

async function openScanner() {

    openModal(
        "scannerModal"
    );


    const video =
        document.getElementById(
            "scannerVideo"
        );


    if (!video) {
        return;
    }


    try {

        scannerStream =
            await navigator
                .mediaDevices
                .getUserMedia({
                    video: {
                        facingMode:
                            "environment"
                    }
                });


        video.srcObject =
            scannerStream;


        startQRDetection();

    }

    catch (error) {

        console.error(
            error
        );


        const scannerMessage =
            document.getElementById(
                "scannerMessage"
            );


        if (scannerMessage) {

            scannerMessage.textContent =
                "Camera access is unavailable. Please allow camera permission.";
        }
    }
}


/* ================= QR DETECTION ================= */

async function startQRDetection() {

    if (
        !(
            "BarcodeDetector"
            in window
        )
    ) {

        const scannerMessage =
            document.getElementById(
                "scannerMessage"
            );


        if (scannerMessage) {

            scannerMessage.textContent =
                "QR scanner is not supported by this browser. You can still use the search/categories.";
        }


        return;
    }


    const detector =
        new BarcodeDetector({
            formats: [
                "qr_code"
            ]
        });


    const video =
        document.getElementById(
            "scannerVideo"
        );


    if (!video) {
        return;
    }


    async function scan() {

        if (
            !scannerStream ||
            video.readyState !== 4
        ) {

            requestAnimationFrame(
                scan
            );

            return;
        }


        try {

            const codes =
                await detector.detect(
                    video
                );


            if (
                codes.length > 0
            ) {

                const value =
                    codes[0].rawValue;


                handleQRCode(
                    value
                );


                return;
            }

        }

        catch (error) {

            console.error(
                error
            );
        }


        requestAnimationFrame(
            scan
        );
    }


    scan();
}


/* ================= QR RESULT ================= */

async function handleQRCode(
    value
) {

    console.log(
        "QR scanned:",
        value
    );


    closeScanner();


    try {

        const organizationsResponse =
            await fetch(
                API_BASE +
                "/organizations"
            );


        if (!organizationsResponse.ok) {

            throw new Error(
                "Unable to load organizations"
            );
        }


        const organizations =
            await organizationsResponse.json();


        const matchedOrganization =
            organizations.find(
                organization =>

                    value.includes(
                        organization.organizationCode
                    )
            );


        if (matchedOrganization) {

            openOrganization(
                matchedOrganization.organizationId
            );

            return;
        }


        const organizationMatch =
            value.match(
                /organization\/(\d+)/
            );


        if (organizationMatch) {

            openOrganization(
                Number(
                    organizationMatch[1]
                )
            );

            return;
        }

    }

    catch (error) {

        console.error(
            "QR organization error:",
            error
        );
    }


    alert(
        "QueueEase QR detected:\n" +
        value
    );
}


/* ================= CLOSE SCANNER ================= */

function closeScanner() {

    if (scannerStream) {

        scannerStream
            .getTracks()
            .forEach(
                track =>
                    track.stop()
            );


        scannerStream =
            null;
    }


    closeModal(
        "scannerModal"
    );
}


/* ================= LOAD SAVED TOKEN ================= */

function loadSavedToken() {

    const saved =
        localStorage.getItem(
            "queueToken"
        );


    if (!saved) {
        return;
    }


    try {

        const token =
            JSON.parse(
                saved
            );


        currentToken =
            token;


        updateActiveTicket(
            token
        );


        displayToken(
            token
        );

    }

    catch (error) {

        console.error(
            "Saved token error:",
            error
        );
    }
}


/* ================= INITIALIZE ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadSavedToken();

        loadOrganizations();

        getUserLocation();

        showSection(
            "home"
        );

    }
);