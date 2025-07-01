var map = L.map('map').setView([51.574349, -1.310892], 17);
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

var image1 = 'info/BaseOver.png'
var imageBounds = [[51.57168183170403, -1.3173294067382815], [51.57701619673675, -1.304454803466797]];
L.imageOverlay(image1, imageBounds).addTo(map);

var image2 = 'info/BaseUnder.png'
var imageBounds = [[51.57168183170403, -1.3173294067382815], [51.57701619673675, -1.304454803466797]];
L.imageOverlay(image2, imageBounds, {opacity:0.65}).addTo(map);



let marker = L.marker([51.574349, -1.310892]).addTo(map);
var circle = L.circle([51.574349, -1.310892], {
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5,
    radius: 25
}).addTo(map);

async function getText(file) {
    let filein = await fetch(file);
    let text = await filein.json();
    for (const group of text) {
        console.log(group)
        let data = group["beamlines"]
        for (let beam of data) {
            let pos = beam["position"]
            let marker = L.marker(pos).addTo(map);
            var circle = L.circle(pos, {
                color: 'red',
                fillColor: '#f03',
                fillOpacity: 0.5,
                radius: 4
            }).addTo(map);
        }
    }
}

getText("info/beamlines_data.json")


// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(map);

// var polygon = L.polygon([
//     [51.509, -0.08],
//     [51.503, -0.06],
//     [51.51, -0.047]
// ]).addTo(map);

var popup = L.popup()
    .setLatLng([51.513, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(map);

// function onMapClick(e) {
//     alert("You clicked the map at " + e.latlng);
// }

// map.on('click', onMapClick);



// var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(map);
}

map.on('click', onMapClick);