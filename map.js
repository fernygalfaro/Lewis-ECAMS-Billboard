var map = L.map('map', {
    minZoom: 2, // Set the minimum zoom level
    maxZoom: 5, // Set the maximum zoom level
  }).setView([0, 0], 1); // Set initial view
  
  // Load and add the custom image overlay as the map
  var imageUrl = 'assets/map.svg';
  var imageBounds = [[-90, -180], [90, 180]]; // Set the bounds of the image (latitude/longitude)
  L.imageOverlay(imageUrl, imageBounds).addTo(map);
  
  // Set the map boundaries
  map.setMaxBounds(imageBounds);
  map.on('drag', function() {
    map.panInsideBounds(imageBounds, { animate: false });
  });
  
  // Info to display for AS Building pin
  const ASInfo = `
  Academic Science  
  Center (AS) 12
  LOWER FLOOR
  • Physics
  • Greenhouse
  GROUND FLOOR
  • Chemistry
  • Engineering, Computing
  and Mathematical
  Sciences
  • Cadaver Lab
  • Likens Virtual Reality Lab
  • Dean, Aviation, Science
  and Technology
  • Charlie’s Place
  UPPER FLOOR
  • Biology
  `;

   // Info to display for LRC pin
   const LRCInfo = `
   FSC Learning Resource Center / LRC (LR) 33
   BASEMENT
   • Office of Technology
   • Ground Floor
   • Business Office / Bursar
   • Career Services
   • Financial Aid Services
   • International Affairs
   • Purchasing
   • Registrar
   • Residence Life
   • Student Services and Retention
   • University Police
   FIRST FLOOR
   • Library
   • Faculty Center for Teaching and Learning
   • Writing Center
   THIRD FLOOR
   • Mission & Identity
   • Academic Services
   • Community Engaged Learning
   • Flyer Success Network
   • Military Education Resource Center
   • Study Abroad
   • Veterans Affairs
   `;
  
  // Define locations of info markers (lat/long)
  var markerLocations = [
      { latlng: [37, 1], info: '<b>' + ASInfo + '</b>', icon: L.divIcon({ className: 'custom-marker' }) },
      { latlng: [-8, -42], info: '<b>' + LRCInfo + '</b>', icon: L.divIcon({ className: 'custom-marker' }) },
  ];
  
  // Add the markers to the map with custom icons and info boxes
  markerLocations.forEach(function(marker) {
      L.marker(marker.latlng, { icon: marker.icon })
      .bindPopup(marker.info)
      .addTo(map);
  });
  
  // Display the cursor's current coordinates (for testing)
  map.on('mousemove', function(e) {
    var coordinatesElement = document.getElementById('coordinates');
    if (coordinatesElement) {
      coordinatesElement.textContent = e.latlng.lat.toFixed(4) + ', ' + e.latlng.lng.toFixed(4);
    }
  });
  
  // Get all the dropdown menu options
  var options = document.querySelectorAll('.dropdown-content a');
  
  // Loop through each option and listen for click event
  options.forEach(function(option) {
    option.addEventListener('click', function(event) {
      // Prevent default link behavior
      event.preventDefault();
      // Get the href attribute of the clicked menu option
      var href = option.getAttribute('href');
      // Navigate to that HTML file
      window.location.href = href;
    });
  });
  