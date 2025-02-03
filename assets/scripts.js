const api_url = "https://ecams-billboard--api.azurewebsites.net";
const acp_url = "https://ecams-billboard-acp.azurewebsites.net";
const department = "ECAMS";

let data = [];
let overlayVisible = false;
let resetOverlayInterval;
let locationSet = false;
let skipButtonPressed = false;

// Variables for collection metrics
let locationName = '';
let clickCount = 0;

setInterval(function () {
  ping();
}, 120000);

setInterval(function () {
  // Reload every 1 hour
  window.location.reload();
}, 3600000);

setInterval(function () {
  // Refresh data every 10 minutes
  loadData();
  loadImg();
}, 600000);

function updateTime() {
  const now = new Date();
  
  // Format the date
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  const dateString = now.toLocaleDateString(undefined, options);
  
  // Format the time
  let hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, '0');
  const seconds = now.getSeconds().toString().padStart(2, '0');
  let ampm = 'AM';
  
  if (hours > 12) {
      hours -= 12;
      ampm = 'PM';
  }
  
  if (hours === 0) {
      hours = 12;
  }
  
  const timeString = `${hours}:${minutes}:${seconds} ${ampm}`;
  
  // Update the HTML elements
  document.getElementById('live-date').textContent = dateString;
  document.getElementById('live-time').textContent = timeString;
}

// Initial call to display time immediately
updateTime();

// Update time every second for realtime
setInterval(updateTime, 1000);

function toggleOverlay(visible) {
  const overlay = document.getElementById('overlay');
  overlay.style.display = visible ? 'flex' : 'none';
  overlayVisible = visible;
}

function resetOverlay() {
  toggleOverlay(true);
  if (locationName !== '' && clickCount > 0) {
    console.log('clickCount before send:', clickCount);
    console.log("sendData() called");
    sendData();
    clickCount = 0;
  }
}

// Add the resetOverlay function to the window click event
window.onclick = function () {
  clearInterval(resetOverlayInterval); // Clear the interval on click
  toggleOverlay(false);
  clickCount++;
  console.log("Clicks: ", clickCount);
  resetOverlayInterval = setInterval(resetOverlay, 180000); // Set the interval again
};

async function ping() {
  await fetch(api_url + "/ping", { mode: "no-cors" });
  await fetch(acp_url + "/ping", { mode: "no-cors" });
}

$(window).on("load", function () {
  ping();
});

async function getData() {
  await fetch(api_url + "/api/data/" + department)
    .then((res) => res.json())
    .then((localData) => {
      data = localData;
      return;
    });
  console.log(data);
}

async function loadData() {
  await getData();
  outputStr = "";
  data.forEach((element, index) => {
    outputStr += "<tr>";
    outputStr += `<td>${element.name}</td>`;
    outputStr += `<td>${element.room}</td>`;
    outputStr += `<td><button class="btn btn-outline-primary btn-sm" id="view-professor" onclick="openProfessorModal('${element.id}')"><i class="fa-solid fa-eye"></i></button></td>`;
    outputStr += "</tr>";
  });
  $("#profs").html(outputStr);
}

loadData();

async function getImg() {
  const imageData = await fetch(api_url + "/api/banners")
    .then((res) => res.json())
    .then((imageData) => {
      return imageData;
    });
  return imageData;
}

async function loadImg() {
  const imageData = await getImg();
  outputStr = "";
  imageData.forEach((element, index) => {
    const image_url = api_url + "/uploads/" + element.image_name;
    outputStr += `<div class="carousel-item ${
      index === 0 ? "active" : ""
    }" data-bs-interval="10000">
                    <img
                      src="${image_url}"
                      class="d-block w-100"
                      alt="${element.name}"
                      width="375"
                      height="500"
                    />
                    <div class="carousel-caption d-none d-md-block">
                      <h5>${element.name}</h5>
                    </div>
                  </div>`;
  });
  $("#carousel-body").html(outputStr);
}

function openProfessorModal(professorId) {
  const professor = data.find((element) => element.id === professorId)

  $("#professorName").html(professor.name);
  $("#professorNameTable").html(professor.name);
  $("#professorEmail").html(professor.email);
  $("#professorHours").html(professor.hours);
  $("#professorOffice").html(professor.room);
  $("#professorModal").modal("show")
}

loadImg();

// Logic for adding metrics to MongoDB
//--------------------------------------------------------

document.addEventListener('DOMContentLoaded', function() {
  const locationForm = document.getElementById('locationForm');
  locationForm.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log("Setting clicks to 0");
    clickCount = 0;
    //console.log("Clicks: " + clickCount);
    submitForm();
  });
});

function submitForm() {
  if (skipButtonPressed) {
    locationSet = false;
    document.getElementById('locationOverlay').style.display = 'none';
    document.getElementById('overlay').style.display = 'block';
    resetOverlayInterval = setInterval(resetOverlay, 5000);
  } else {
    locationName = document.getElementById('locationInput').value;
    locationSet = true;
    document.getElementById('locationOverlay').style.display = 'none';
    document.getElementById('overlay').style.display = 'block';
    resetOverlayInterval = setInterval(resetOverlay, 5000);
  }
}

function sendData() {
  const timestamp = new Date().toISOString();
  fetch('/submit-interaction', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ location: locationName, clicks: clickCount.toString(), timestamp }), // converting clickCount to string if necessary
  })
  .then(response => {
    console.log('Content-Type:', response.headers.get('Content-Type')); // Should be 'application/json'
    console.log(response); // This will show the full response object
    return response.json();
  })
  .then(data => {
    console.log('Data sent successfully:', data);
  })
  .catch(error => {
    console.error('There has been a problem with your fetch operation:', error);
  });
}

// Function to show the options for classrooms based on the selected floor
function showClassrooms() {
  var floorSelect = document.getElementById("floor-select");
  var classroomSelect = document.getElementById("classroom-select");
  if (floorSelect.value === "") {
    classroomSelect.style.display = "";
    return;
    }
  classroomSelect.style.display = "block";
  classroomSelect.innerHTML = '<option value="">Select a Classroom</option>';
  var floor = floorSelect.value;

  var classrooms = {
    "SelectFloor":["AS-Lower-Floor","AS-First-Floor","AS-Second-Floor",],
    "ASLowerFloor": ["AS-002-L", "AS-004-L","AS-006-L","AS-008-L","AS-010-L",
                     "AS-012-L","AS-014-L","AS-016-L","AS-018-L","AS-018-S",
                     "AS-019-S","AS-020-S","AS-024-S","AS-026-S","AS-028-S",
                     "AS-030-S","AS-032-S","AS-036-S","AS-054-S","AS-056-S",
                     "AS-058-S","AS-060-S",],
    "ASFirstFloor": ["AS-101-A","AS-102-A","AS-104-A","AS-106-A","AS-132-A",
                     "AS-134-A","AS-150-A","AS-155-A","AS-156-A","AS-157-A",
                     "AS-158-A","AS-159-A","AS-104-L", "AS-108-L","AS-110-L", 
                     "AS-112-L","AS-114-L","AS-116-L","AS-118-L","AS-101-S",
                     "AS-107-S","AS-108-S","AS-110-S","AS-112-S","AS-113-S",
                     "AS-118-S","AS-119-S","AS-120-S","AS-124-S","AS-126-S",
                     "AS-130-S","AS-134-S","AS-138-S","AS-140-S",],
    "ASSecondFloor": ["AS-200-L","AS-202-L", "AS-204-L","AS-206-L","AS-208-L",
                      "AS-210-L","AS-212-L","AS-214-L","AS-216-L","AS-218-L",]
    };
  classrooms[floor].forEach(function(classroom) {
    var option = document.createElement("option");
    option.value = classroom.toLowerCase().replace(/\s+/g, "");
    option.textContent = classroom;
    classroomSelect.appendChild(option);
          });
      }

function showClassroom() {
  var floorSelect = document.getElementById("floor-select");
  var classroomSelect = document.getElementById("classroom-select");
  var classroomImage = document.getElementById("classroom-image");
  if (floorSelect.value === "" || classroomSelect.value === "") {
      classroomImage.style.display = "";
      return;
          }

  var floor = floorSelect.value;
  var classroom = classroomSelect.value;
  var imagePath = "assets/classrooms/" + floor + "/" + classroom + ".jpg";
  classroomImage.src = imagePath;
  classroomImage.style.display = "block";
    }

// Assuming touchImage is the button that should be monitored
//document.getElementById('touchImage').addEventListener('click', sendData);

document.getElementById('skipButton').addEventListener('click', function() {
  var confirmResponse = confirm('Are you sure you want to skip metric logging?');
  if (confirmResponse) {
    skipButtonPressed = true;
    console.log('Metric logging skipped.');
    document.getElementById('locationInput').removeAttribute("required");
    submitForm();
  }
});
