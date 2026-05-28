import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import {
    getDatabase,
    ref,
    set,
    update,
    onValue,
    increment
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";

// ======================================================
// FIREBASE CONFIG
// ======================================================

const firebaseConfig = {

    apiKey: "AIzaSyAvmdKL76isu1HJkOZzoshqZgQJPZSNCwY",

    authDomain: "resqueue-5238b.firebaseapp.com",

    databaseURL:
    "https://resqueue-5238b-default-rtdb.firebaseio.com",

    projectId: "resqueue-5238b",

    storageBucket:
    "resqueue-5238b.firebasestorage.app",

    messagingSenderId: "386141918090",

    appId:
    "1:386141918090:web:068dcb4958b3589f7a6e73"
};

const app = initializeApp(firebaseConfig);

const db = getDatabase(app);

// ======================================================
// EMAILJS
// ======================================================

emailjs.init("4k-dOTrWlpJDJVGgK");

// ======================================================
// FLOORS
// ======================================================

const floors = [

    { id:"gf", name:"GF", count:0, max:80 },

    { id:"mz", name:"MZ", count:0, max:30 },

    { id:"f1", name:"F1", count:0, max:60 },

    { id:"f2", name:"F2", count:0, max:60 },

    { id:"f3", name:"F3", count:0, max:60 },

    { id:"f4", name:"F4", count:0, max:60 },

    { id:"f5", name:"F5", count:0, max:60 },

    { id:"f6", name:"F6", count:0, max:50 }

];

// ======================================================
// EMERGENCY ALERTS
// ======================================================

const alerts = [

    {
        id:"fire",
        name:"Fire Emergency",
        icon:"fa-fire",
        team:"Fire Station #3",
        color:"#ef4444"
    },

    {
        id:"earthquake",
        name:"Earthquake",
        icon:"fa-house-crack",
        team:"Disaster Response Force",
        color:"#a855f7"
    },

    {
        id:"flood",
        name:"Flood Alert",
        icon:"fa-cloud-showers-heavy",
        team:"NDRF Water Rescue",
        color:"#0ea5e9"
    },

    {
        id:"medical",
        name:"Medical Emergency",
        icon:"fa-house-medical",
        team:"MICU Ambulance",
        color:"#10b981"
    },

    {
        id:"gas",
        name:"Gas Leak",
        icon:"fa-biohazard",
        team:"Hazmat Team",
        color:"#f97316"
    },

    {
        id:"security",
        name:"Security Threat",
        icon:"fa-shield-halved",
        team:"Police Control Room",
        color:"#dc2626"
    },

    {
        id:"power",
        name:"Power Failure",
        icon:"fa-bolt",
        team:"Electrical Maintenance",
        color:"#facc15"
    },

    {
        id:"server",
        name:"Server Room Failure",
        icon:"fa-server",
        team:"IT Infrastructure Team",
        color:"#38bdf8"
    },

    {
        id:"smoke",
        name:"Smoke Detection",
        icon:"fa-smog",
        team:"Fire Safety Team",
        color:"#fb7185"
    },

    {
        id:"intruder",
        name:"Unauthorized Entry",
        icon:"fa-user-secret",
        team:"Rapid Security Unit",
        color:"#dc2626"
    },

    {
        id:"stampede",
        name:"Crowd Stampede",
        icon:"fa-people-group",
        team:"Emergency Crowd Control",
        color:"#f59e0b"
    },

    {
        id:"lift",
        name:"Lift Failure",
        icon:"fa-elevator",
        team:"Lift Maintenance Team",
        color:"#06b6d4"
    }

];

// ======================================================
// START APP
// ======================================================

document.addEventListener("DOMContentLoaded", () => {

    startClock();

    renderFloors();

    renderQr();

    renderAlerts();

    seedDatabase();

    liveSync();

    buttonEvents();

    addFeed(
        "✅ SafeGrid System Initialized.",
        "#10b981"
    );

});

// ======================================================
// CLOCK
// ======================================================

function startClock(){

    setInterval(() => {

        document.getElementById("clock")
        .textContent =
        new Date()
        .toTimeString()
        .split(" ")[0];

    },1000);
}

// ======================================================
// FLOOR STATUS
// ======================================================

function getFloorStatus(count,max){

    let ratio = count/max;

    if(ratio > .8){

        return {
            text:"CRITICAL",
            color:"#ef4444"
        };
    }

    if(ratio > .5){

        return {
            text:"BUSY",
            color:"#f59e0b"
        };
    }

    return {
        text:"OK",
        color:"#10b981"
    };
}

// ======================================================
// RENDER FLOORS
// ======================================================

function renderFloors(){

    const floorList =
    document.getElementById("floor-list");

    floorList.innerHTML = "";

    floors.forEach(floor => {

        let percent =
        (floor.count/floor.max)*100;

        let status =
        getFloorStatus(
            floor.count,
            floor.max
        );

        floorList.innerHTML += `

        <div class="bar-row">

            <span>${floor.name}</span>

            <div class="bar-bg">

                <div
                    class="bar-fill"
                    id="bar-fill-${floor.id}"

                    style="
                    width:${percent}%;
                    background:${status.color};
                    ">
                </div>

            </div>

            <span
                class="mono"
                id="lbl-cnt-${floor.id}">

                ${floor.count}/${floor.max}

            </span>

            <span
                class="badge"
                id="lbl-stat-${floor.id}"

                style="
                background:#1e293b;
                color:${status.color};
                ">

                ${status.text}

            </span>

        </div>
        `;
    });
}

// ======================================================
// QR GRID
// ======================================================

function renderQr(){

    const qrGrid =
    document.getElementById("qr-grid");

    qrGrid.innerHTML = "";

    floors.forEach(floor => {

        qrGrid.innerHTML += `

        <div class="box-item">

            <p class="sub mono"
            style="margin-bottom:15px;">

                ${floor.name}

            </p>

            <span
            class="badge g-tag"
            id="qr-${floor.id}">

                ${floor.count} inside

            </span>

        </div>
        `;
    });
}

// ======================================================
// ALERT CARDS
// ======================================================

function renderAlerts(){

    const triggerGrid =
    document.getElementById("trigger-grid");

    triggerGrid.innerHTML = "";

    alerts.forEach(alert => {

        triggerGrid.innerHTML += `

        <div
            class="trig-btn"
            data-id="${alert.id}"

            style="
            border:1px solid ${alert.color};
            ">

            <i
            class="fa-solid ${alert.icon}"

            style="
            font-size:1.5rem;
            margin-bottom:12px;
            color:${alert.color};
            ">
            </i>

            <p
            style="
            font-weight:bold;
            margin-bottom:5px;
            ">

                ${alert.name}

            </p>

            <span class="sub">

                ${alert.team}

            </span>

        </div>
        `;
    });

    document.querySelectorAll(".trig-btn")
    .forEach(btn => {

        btn.addEventListener("click", () => {

            let id =
            btn.dataset.id;

            let alertObj =
            alerts.find(a => a.id === id);

            emergencyMode(alertObj);

        });

    });
}

// ======================================================
// FEED
// ======================================================

function addFeed(text,color){

    const feed =
    document.getElementById("feed-list");

    let time =
    new Date()
    .toTimeString()
    .split(" ")[0];

    feed.innerHTML = `

    <div
    class="flex sb"
    style="
    border-bottom:1px solid #141b26;
    padding-bottom:5px;
    margin-bottom:5px;
    ">

        <span>

            <span
            class="dot"
            style="
            background:${color};
            ">
            </span>

            ${text}

        </span>

        <span class="mono sub">

            ${time}

        </span>

    </div>

    ` + feed.innerHTML;
}

// ======================================================
// GLOBAL METRICS
// ======================================================

function updateGlobalMetrics(){

    let total = 0;

    let active = 0;

    let empty = 0;

    floors.forEach(f => {

        total += f.count;

        if(f.count > 0){

            active++;

        }else{

            empty++;
        }
    });

    document.getElementById(
        "stat-total"
    ).textContent = total;

    document.getElementById(
        "stat-active"
    ).textContent = active;

    document.getElementById(
        "unoccupied-count"
    ).textContent = empty;

    document.getElementById(
        "stat-pct"
    ).textContent =
    Math.round((total/500)*100)
    + "%";
}

// ======================================================
// FIREBASE RESET
// ======================================================

async function seedDatabase(){

    let data = {};

    floors.forEach(f => {

        data[f.id] = {

            name:f.name,
            count:0,
            max:f.max
        };
    });

    await set(ref(db,"floors"),data);

    await set(
        ref(db,"meta/checkinsToday"),
        0
    );
}

// ======================================================
// LIVE SYNC
// ======================================================

function liveSync(){

    onValue(ref(db,"floors"),
    snapshot => {

        if(!snapshot.exists()) return;

        let data = snapshot.val();

        floors.forEach(f => {

            if(data[f.id]){

                f.count =
                data[f.id].count;

                let status =
                getFloorStatus(
                    f.count,
                    f.max
                );

                document.getElementById(
                    `bar-fill-${f.id}`
                ).style.width =
                `${(f.count/f.max)*100}%`;

                document.getElementById(
                    `bar-fill-${f.id}`
                ).style.background =
                status.color;

                document.getElementById(
                    `lbl-cnt-${f.id}`
                ).textContent =
                `${f.count}/${f.max}`;

                document.getElementById(
                    `lbl-stat-${f.id}`
                ).textContent =
                status.text;

                document.getElementById(
                    `lbl-stat-${f.id}`
                ).style.color =
                status.color;

                document.getElementById(
                    `qr-${f.id}`
                ).textContent =
                `${f.count} inside`;
            }
        });

        updateGlobalMetrics();
    });

    onValue(
        ref(db,"meta/checkinsToday"),
        snapshot => {

        document.getElementById(
            "stat-today"
        ).textContent =
        snapshot.val().toLocaleString();
    });
}

// ======================================================
// CHECK-IN / CHECK-OUT
// ======================================================

async function processScan(type){

    alert("QR Scan Successful ✅");

    let floorInput =
    prompt(
    "Enter Floor Number:\nGF, MZ, F1, F2, F3, F4, F5, F6"
    );

    if(!floorInput) return;

    floorInput =
    floorInput.toLowerCase();

    const floorObj =
    floors.find(
    f => f.id === floorInput
    );

    if(!floorObj){

        alert("Invalid Floor!");
        return;
    }

    if(type === "checkin"){

        if(floorObj.count >= floorObj.max){

            alert("Floor Full!");
            return;
        }

        await update(
            ref(db,`floors/${floorObj.id}`),
            {
                count: floorObj.count + 1
            }
        );

        await update(
            ref(db,"meta"),
            {
                checkinsToday:
                increment(1)
            }
        );

        addFeed(
            `✅ User CHECKED-IN to ${floorObj.name}`,
            "#10b981"
        );

        alert("Check-In Successful");
    }

    else{

        if(floorObj.count <= 0){

            alert("No Users Available!");
            return;
        }

        await update(
            ref(db,`floors/${floorObj.id}`),
            {
                count: floorObj.count - 1
            }
        );

        addFeed(
            `🚪 User CHECKED-OUT from ${floorObj.name}`,
            "#f59e0b"
        );

        alert("Check-Out Successful");
    }
}

// ======================================================
// EMERGENCY MODE
// ======================================================

function emergencyMode(alertObj){

    document.getElementById(
        "stat-status"
    ).textContent =
    alertObj.name;

    document.getElementById(
        "stat-status"
    ).className =
    "r-txt d-font";

    document.getElementById(
        "stat-status-sub"
    ).textContent =
    `Emergency team dispatched:
    ${alertObj.team}`;

    document.getElementById(
        "standby-pill"
    ).innerHTML =
    `<span class="dot blink"
    style="background:red;"></span>
    ACTIVE ALERT`;

    addFeed(
        `🚨 Emergency activated:
        ${alertObj.name}`,
        "#ef4444"
    );

    let floorBreakdown = floors.map(f => {

        let status =
        getFloorStatus(
            f.count,
            f.max
        );

        return `
${f.name} : ${f.count}/${f.max} (${status.text})
`;

    }).join("\n");

    emailjs.send(

        "service_t70g4oq",

        "template_0nwvwj4",

        {
            emergency_type:
            alertObj.name,

            rescue_team:
            alertObj.team,

            timestamp:
            new Date()
            .toLocaleString(),

            floor_breakdown:
            floorBreakdown
        }

    );

    alert(
        `${alertObj.name} Alert Sent`
    );
}

// ======================================================
// BUTTON EVENTS
// ======================================================

function buttonEvents(){

    document.getElementById(
        "checkin-btn"
    ).addEventListener("click",
    () => {

        processScan("checkin");

    });

    document.getElementById(
        "checkout-btn"
    ).addEventListener("click",
    () => {

        processScan("checkout");

    });

    document.getElementById(
        "sim-btn"
    ).addEventListener("click",
    () => {

        const randomType =
        Math.random() > 0.5
        ? "checkin"
        : "checkout";

        processScan(randomType);

    });

    document.getElementById(
        "danger-alert-btn"
    ).addEventListener("click",
    () => {

        document.getElementById(
            "stat-status"
        ).textContent =
        "ALL CLEAR";

        document.getElementById(
            "stat-status"
        ).className =
        "g-txt d-font";

        document.getElementById(
            "stat-status-sub"
        ).textContent =
        "No active alerts";

        document.getElementById(
            "standby-pill"
        ).innerHTML =
        `<span class="dot g-bg"></span>
        Standby`;

        addFeed(
            "✅ Emergency cleared.",
            "#10b981"
        );
    });

    document.getElementById(
        "clear-feed-btn"
    ).addEventListener("click",
    () => {

        document.getElementById(
            "feed-list"
        ).innerHTML = "";

    });
}