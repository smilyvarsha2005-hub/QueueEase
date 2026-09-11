const categories = [
  {id:"all", name:"All", icon:"✦"},
  {id:"hospital", name:"Hospital", icon:"🏥"},
  {id:"college", name:"College", icon:"🎓"},
  {id:"restaurant", name:"Restaurant", icon:"🍽️"},
  {id:"salon", name:"Salon", icon:"💇"},
  {id:"rental", name:"Bike & Car Rental", icon:"🚗"},
  {id:"service", name:"Service Center", icon:"🛠️"},
  {id:"bank", name:"Bank", icon:"🏦"},
  {id:"government", name:"Government", icon:"🏛️"},
  {id:"diagnostic", name:"Diagnostics", icon:"🧪"}
];

const businesses = [
  {id:1,category:"hospital",name:"CityCare Multi-Speciality Hospital",area:"Banjara Hills",distance:"2.1 km",status:"open",wait:18,ahead:7,icon:"🏥",rating:"4.8",services:[["General Consultation",7,18],["Cardiology",4,25],["Laboratory",3,12],["Pharmacy",2,8]]},
  {id:2,category:"college",name:"SRIIT Hyderabad",area:"Maisammaguda",distance:"5.4 km",status:"open",wait:12,ahead:4,icon:"🎓",rating:"4.6",services:[["Examination Section",4,12],["Certificates",2,7],["Accounts",5,18],["Placement Cell",3,15]]},
  {id:3,category:"restaurant",name:"Spice Avenue",area:"Madhapur",distance:"3.2 km",status:"busy",wait:35,ahead:11,icon:"🍽️",rating:"4.7",services:[["Table Waiting",11,35],["Takeaway Counter",4,12],["Delivery Pickup",3,10]]},
  {id:4,category:"salon",name:"Style Studio",area:"Kukatpally",distance:"1.8 km",status:"open",wait:15,ahead:3,icon:"💇",rating:"4.9",services:[["Haircut",3,15],["Hair Styling",2,20],["Beard",1,8],["Facial",4,35]]},
  {id:5,category:"rental",name:"DriveNow Rentals",area:"Hitech City",distance:"4.7 km",status:"open",wait:10,ahead:2,icon:"🚗",rating:"4.5",services:[["Vehicle Pickup",2,10],["Vehicle Return",3,15],["Inspection",1,8]]},
  {id:6,category:"service",name:"TechFix Service Center",area:"Ameerpet",distance:"6.2 km",status:"busy",wait:28,ahead:8,icon:"🛠️",rating:"4.7",services:[["Laptop Service",8,28],["Mobile Repair",5,20],["Accessories",2,8]]},
  {id:7,category:"bank",name:"Standard City Bank",area:"Somajiguda",distance:"2.9 km",status:"open",wait:15,ahead:6,icon:"🏦",rating:"4.6",services:[["Cash Counter",6,15],["Account Service",4,22],["Loans & Support",3,30]]},
  {id:8,category:"government",name:"Citizen Service Office",area:"Lakdikapul",distance:"7.1 km",status:"open",wait:32,ahead:10,icon:"🏛️",rating:"4.4",services:[["Certificates",10,32],["Records",5,18],["Public Grievance",7,25]]},
  {id:9,category:"diagnostic",name:"Prime Diagnostics",area:"Secunderabad",distance:"8.0 km",status:"open",wait:20,ahead:5,icon:"🧪",rating:"4.8",services:[["Blood Test",5,20],["Scan & Imaging",3,30],["Report Collection",2,8]]}
];

let selectedCategory="all", selectedBusiness=null, selectedService=null, notifyMethod="browser";
let activeQueue = JSON.parse(localStorage.getItem("queueeaseActive") || "null");

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

function showToast(msg){
  const t=$("#toast"); t.textContent=msg; t.classList.add("show");
  setTimeout(()=>t.classList.remove("show"),2500);
}
function openModal(id){$("#"+id).classList.add("open")}
function closeModal(id){$("#"+id).classList.remove("open")}

function renderCategories(){
  $("#categoryGrid").innerHTML=categories.slice(1).map(c=>`
    <button class="category-card" onclick="selectCategory('${c.id}')">
      <div class="category-icon">${c.icon}</div><b>${c.name}</b>
    </button>`).join("");
  $("#discoverCategories").innerHTML=categories.map(c=>`
    <button class="filter-pill ${selectedCategory===c.id?"active":""}" onclick="selectCategory('${c.id}')">${c.icon} ${c.name}</button>
  `).join("");
}
function getFiltered(){
  const q=($("#discoverSearch")?.value || "").trim().toLowerCase();
  return businesses.filter(b=>{
    const categoryOk=selectedCategory==="all" || b.category===selectedCategory;
    const text=(b.name+" "+b.area+" "+b.category+" "+b.services.map(x=>x[0]).join(" ")).toLowerCase();
    return categoryOk && (!q || text.includes(q));
  });
}
function cardHTML(b){
  return `<article class="business-card">
    <div class="business-img">
      <span class="photo-icon">${b.icon}</span>
      <span class="wait-badge">~${b.wait} min wait</span>
    </div>
    <div class="business-info">
      <div class="business-title"><h3>${b.name}</h3><span class="status ${b.status}">${b.status==="open"?"OPEN":"BUSY"}</span></div>
      <div class="business-meta">⌖ ${b.area} · ${b.distance} &nbsp; ★ ${b.rating}</div>
      <div class="queue-row"><span>People waiting</span><b>${b.ahead}</b><span>Est. wait</span><b>${b.wait}m</b></div>
      <div class="card-buttons">
        <button class="view-btn" onclick="viewBusiness(${b.id})">View details</button>
        <button class="join-btn" onclick="openJoin(${b.id})">Join queue</button>
      </div>
    </div>
  </article>`;
}
function renderHomeBusinesses(){
  $("#homeBusinessGrid").innerHTML=businesses.slice(0,6).map(cardHTML).join("");
}
function renderDiscover(){
  const list=getFiltered();
  $("#resultCount").textContent=`${list.length} places found`;
  $("#discoverGrid").innerHTML=list.length?list.map(cardHTML).join(""):`<div class="empty-state" style="grid-column:1/-1"><h3>No matching queues</h3><p>Try another category or search term.</p></div>`;
}
function selectCategory(id){
  selectedCategory=id;
  renderCategories();
  renderDiscover();
  showPage("discover");
}
function showPage(page){
  $$(".page").forEach(p=>p.classList.remove("active"));
  $("#"+page+"Page").classList.add("active");
  window.scrollTo({top:0,behavior:"smooth"});
  if(page==="discover") renderDiscover();
  if(page==="myqueue") renderMyQueue();
}
function viewBusiness(id){
  selectedBusiness=businesses.find(b=>b.id===id);
  const b=selectedBusiness;
  $("#businessDetail").innerHTML=`
    <div class="detail-card">
      <div class="detail-cover"><div><div class="eyebrow" style="color:#c9c5ff">${b.icon} ${b.category.toUpperCase()}</div><h1>${b.name}</h1><div>⌖ ${b.area} · ${b.distance} &nbsp; ★ ${b.rating}</div></div></div>
      <div class="detail-content">
        <div class="detail-columns">
          <div>
            <div class="eyebrow">AVAILABLE SERVICES</div>
            <h2 style="margin-top:0">Choose what you need</h2>
            <div class="detail-services">${b.services.map((s,i)=>`
              <div class="service-option"><div><b>${s[0]}</b><small>${s[1]} people waiting · ~${s[2]} min</small></div><button onclick="openJoin(${b.id},${i})">Join</button></div>`).join("")}</div>
          </div>
          <aside class="live-panel"><div class="eyebrow" style="color:#9c94ff">LIVE QUEUE</div><div class="big">${b.ahead}</div><p>people currently waiting</p><div class="mini-stat"><span><small>Estimated wait</small><br><b>${b.wait} min</b></span><span><small>Status</small><br><b style="color:#35d4a5">${b.status==="open"?"Open":"Busy"}</b></span></div></aside>
        </div>
      </div>
    </div>`;
  showPage("business");
}
function openJoin(id, serviceIndex=0){
  selectedBusiness=businesses.find(b=>b.id===id);
  selectedService=selectedBusiness.services[serviceIndex];
  $("#joinBusinessName").textContent=selectedBusiness.name;
  $("#joinServiceHint").textContent="Select a service, then join the digital queue.";
  $("#serviceList").innerHTML=selectedBusiness.services.map((s,i)=>`
    <button class="service-select ${i===serviceIndex?"selected":""}" onclick="chooseService(${i})">
      <span><b>${s[0]}</b><small>${s[1]} waiting · ~${s[2]} min</small></span><span>›</span>
    </button>`).join("");
  notifyMethod="browser"; $$(".notify-option").forEach(x=>x.classList.toggle("active",x.dataset.notify==="browser"));
  openModal("joinModal");
}
function chooseService(i){
  selectedService=selectedBusiness.services[i];
  $$(".service-select").forEach((x,n)=>x.classList.toggle("selected",n===i));
}
async function confirmJoin(){
  if(!selectedBusiness || !selectedService) return;
  const btn=$("#confirmJoinBtn"); btn.disabled=true; btn.textContent="Joining…";
  let tokenData=null;
  try{
    const response=await fetch("http://localhost:8080/queue/take",{method:"POST",headers:{"Content-Type":"application/json"}});
    if(response.ok) tokenData=await response.json();
  }catch(e){}
  const fallbackNumber = `${selectedBusiness.category.slice(0,1).toUpperCase()}${Math.floor(10+Math.random()*89)}`;
  activeQueue={
    tokenNumber: tokenData?.tokenNumber ?? fallbackNumber,
    queuePosition: tokenData?.queuePosition ?? selectedService[1]+1,
    estimatedWaitingTime: tokenData?.estimatedWaitingTime ?? selectedService[2],
    business:selectedBusiness.name, service:selectedService[0], category:selectedBusiness.category,
    notify:notifyMethod, joinedAt:new Date().toISOString()
  };
  localStorage.setItem("queueeaseActive",JSON.stringify(activeQueue));
  closeModal("joinModal"); btn.disabled=false; btn.textContent="Join Queue →";
  populateTicket(); openModal("ticketModal");
  showToast(tokenData?"Token created from QueueEase backend":"Demo token created — backend not connected");
}
function populateTicket(){
  if(!activeQueue)return;
  $("#ticketBusiness").textContent=activeQueue.business;
  $("#ticketNumber").textContent=activeQueue.tokenNumber;
  $("#ticketService").textContent=activeQueue.service;
  $("#ticketAhead").textContent=Math.max(0,activeQueue.queuePosition-1);
  $("#ticketWait").textContent=`${activeQueue.estimatedWaitingTime} min`;
  $("#ticketCategory").textContent=activeQueue.category;
  $("#ticketProgress").style.width=Math.max(15,Math.min(90,100-(activeQueue.queuePosition*4)))+"%";
}
function renderMyQueue(){
  if(!activeQueue){
    $("#myQueueContent").innerHTML=`<div class="empty-state"><div style="font-size:48px">🎫</div><h2>No active queue</h2><p>Find an organization and join a queue to see your live ticket here.</p><button class="primary-btn" onclick="showPage('discover')">Discover queues →</button></div>`;
    return;
  }
  $("#myQueueContent").innerHTML=`<div class="active-ticket">
    <div class="eyebrow">ACTIVE DIGITAL TICKET</div><h2>${activeQueue.business}</h2><p style="color:var(--muted);font-size:12px">${activeQueue.service} · ${activeQueue.notify} notifications</p>
    <div class="ticket-number">${activeQueue.tokenNumber}</div>
    <div class="ticket-stats"><div><b>${Math.max(0,activeQueue.queuePosition-1)}</b><small>People ahead</small></div><div><b>${activeQueue.estimatedWaitingTime} min</b><small>Estimated wait</small></div></div>
    <div class="progress"><span style="width:${Math.max(15,Math.min(90,100-(activeQueue.queuePosition*4)))}%"></span></div>
    <p style="color:var(--muted);font-size:10px">Your position updates as the queue moves.</p>
    <div class="ticket-actions"><button class="primary-btn" onclick="openModal('ticketModal')">Open ticket</button><button class="danger-btn" onclick="leaveQueue()">Leave queue</button></div>
  </div>`;
}
function leaveQueue(){
  activeQueue=null;localStorage.removeItem("queueeaseActive");closeModal("ticketModal");renderMyQueue();showToast("You left the queue.");
}
function runSearch(value){
  $("#discoverSearch").value=value; selectedCategory="all"; renderCategories(); renderDiscover(); showPage("discover");
}
function handleLocation(){
  if(navigator.geolocation){
    navigator.geolocation.getCurrentPosition(()=>{ $("#locationChip").textContent="⌖ Current location · 10 km"; showToast("Location enabled for nearby queues."); },()=>showToast("Location permission was not granted."));
  }else showToast("Location is not available in this browser.");
}
function fakeQr(){
  $("#fakeQr").style.backgroundPosition=`${Math.random()*20}px ${Math.random()*20}px`;
}

renderCategories(); renderHomeBusinesses(); renderDiscover();

$$("[data-page]").forEach(el=>el.addEventListener("click",e=>{e.preventDefault();showPage(el.dataset.page)}));
$("#homeSearchBtn").onclick=()=>runSearch($("#homeSearch").value);
$("#homeSearch").addEventListener("keydown",e=>{if(e.key==="Enter")runSearch(e.target.value)});
$("#discoverSearch").addEventListener("input",renderDiscover);
$("#useLocationBtn").onclick=handleLocation;
$("#nearbyFilter").onclick=handleLocation;
$("#scanQrBtn").onclick=()=>{fakeQr();openModal("qrModal")};
$("#discoverQrBtn").onclick=()=>{fakeQr();openModal("qrModal")};
$("#listBusinessBtn").onclick=()=>openModal("businessModal");
$("#profileBtn").onclick=()=>showToast("Profile area coming next.");
$("#notificationBtn").onclick=()=>showToast(activeQueue?"Notifications are enabled for your active queue.":"No active queue notifications.");
$("#openMyQueueBtn").onclick=()=>{closeModal("ticketModal");showPage("myqueue")};
$("#leaveQueueBtn").onclick=leaveQueue;
$("#confirmJoinBtn").onclick=confirmJoin;
$("#qrContinueBtn").onclick=()=>{closeModal("qrModal");selectCategory("all");showToast("Choose a nearby organization to continue.")};
$("#backToDiscover").onclick=()=>showPage("discover");
$("#businessDemoBtn").onclick=()=>{closeModal("businessModal");showToast("Business dashboard can be added as the next module.")};
$$(".notify-option").forEach(btn=>btn.onclick=()=>{$$(".notify-option").forEach(x=>x.classList.remove("active"));btn.classList.add("active");notifyMethod=btn.dataset.notify});
$$("[data-close]").forEach(btn=>btn.onclick=()=>closeModal(btn.dataset.close));
$$(".modal-backdrop").forEach(bg=>bg.addEventListener("click",e=>{if(e.target===bg)bg.classList.remove("open")}));

window.selectCategory=selectCategory; window.viewBusiness=viewBusiness; window.openJoin=openJoin; window.chooseService=chooseService; window.showPage=showPage; window.leaveQueue=leaveQueue;
