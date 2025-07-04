//var map = L.map('map').setView([51.574349, -1.310892], 17);
var map = L.map('map', {
    center: [51.574349, -1.310892],
    zoom: 17.4,
});
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



// let marker = L.marker([51.574349, -1.310892]).addTo(map);
// var circle = L.circle([51.574349, -1.310892], {
//     color: 'red',
//     fillColor: '#f03',
//     fillOpacity: 0.5,
//     radius: 25
// }).addTo(map);

let beamlinepos = {}

async function getText(file) {
    let filein = await fetch(file);
    let text = await filein.json();
    let overlayMaps = {}

    for (const group of text) {
        //console.log(group)
        let data = group["beamlines"]
        var group_layer = L.layerGroup()

        for (let beam of data) {
            let pos = beam["position"]
            beamlinepos[beam["name"]] = pos
            let url = group["markerColour"]

            let newIcon = new L.Icon({
                iconUrl: url,
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            let marker = L.marker(pos, {icon: newIcon}).addTo(group_layer);


            // var circle = L.circle(pos, {
            //     color: 'red',
            //     fillColor: '#f03',
            //     fillOpacity: 0.5,
            //     radius: 4
            // }).addTo(map);
            
            marker.bindPopup(`

                <div style="background-image: url('${group["icon"]}'); background-size: 30%; background-attachment: fixed; margin: auto;">
                    <h1>${beam["name"]}</h1> 
                    <p class="beam-des">${beam["description"]}</p>
                    Find out more 
                    <a href=${beam["url"]} target="-blank">here</a>.
                </div>
                
                <style>
                    .leaflet-popup-content-wrapper{
                         background-color: #FCFACE;
                    }
                </style>

            `)
            .openPopup();

            //markers.push(marker)
        }
        
        group_layer.addTo(map)
        
        overlayMaps[group["name"]] = group_layer

        map["layers"] = group

    }
        
    var layerControl = L.control.layers(null, overlayMaps).addTo(map);
    //layerControl.addBaselay(group_layer, `${group["name"]}`);
    
}

getText("info/beamlines_data.json")



let userpos = [0,0]

map.locate({watch:true})

let usericon = new L.Icon({
    iconUrl: 'https://static.vecteezy.com/system/resources/thumbnails/027/293/544/small_2x/map-pointer-marker-pin-with-a-person-user-icon-people-location-concept-3d-png.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [41, 41],
    iconAnchor: [20.5,38],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    shadowAnchor: [10, 39]
});

let mark = L.marker([0,0], {icon: usericon}).addTo(map).setZIndexOffset(999999);
let usercircle = L.circle([0,0], 0).addTo(map);

function modulus([x1, y1], [x2, y2]) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

let rest = true

function onLocationFound(e) {
    var radius = e.accuracy;
    
    mark.setLatLng(e.latlng);

    if (rest){
        mark.bindPopup("You are within " + radius.toPrecision(2) + " meters from this point").openPopup();
    }
        
    rest = false
    setTimeout(() => {
        mark.closePopup();
        rest = true;
    }, 2500)
    map.removeLayer(usercircle)
    usercircle = L.circle(e.latlng, radius).addTo(map);

    userpos = [e.latlng["lat"],e.latlng["lng"]]
}

map.on('locationfound', onLocationFound);

function onLocationError(e) {
    alert(e.message);
}

map.on('locationerror', onLocationError);




let closestbutton = L.control({position:"topright"});

let targeticon = new L.Icon({
                iconUrl: 'https://github.com/pointhi/leaflet-color-markers/blob/master/img/marker-icon-2x-yellow.png?raw=true',
                //shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                //shadowSize: [41, 41]
});

let targetmarker = L.marker([0,0])

function closestbeamline(event) {
    L.DomEvent.stopPropagation(event)
    let distance = 0
    let min = 50000000
    let minpos
    for (let [beamname, beampos] of Object.entries(beamlinepos)) {
        distance = modulus(userpos,beampos)
        if (distance < min) {
            min = distance
            minpos = beampos
        }
    }
    
    targetmarker = L.marker(minpos,{icon:targeticon}).bindPopup("<h3>This is the closest beamline.</h3>").addTo(map);
    //window.addEventListener("keydown", function() {
    targetmarker.openPopup()
    setTimeout(() => {
        map.removeLayer(targetmarker);
    }, 3000)
    //});
}

closestbutton.onAdd =
    function() {
        let div = L.DomUtil.create("div");
        div.innerHTML = "<button>Closest Beamline to Me</button>";
        div.firstChild.addEventListener("click", () => closestbeamline(event))
        return div
    };
closestbutton.addTo(map)


let zoombutton = L.control({position:"topleft"})

zoombutton.onAdd =
    function() {
        let div = L.DomUtil.create("div");
        div.innerHTML = "<button>Zoom Back</button>";
        div.firstChild.addEventListener("click", function(){
            map.setView(userpos,17.4);
        })
        return div
    };
zoombutton.addTo(map)

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


// function onMapClick(e) {
//     alert("You clicked the map at " + e.latlng);
// }

// map.on('click', onMapClick);



// var popup = L.popup();

// function onMapClick(e) {
//     popup
//         .setLatLng(e.latlng)
//         .setContent("You clicked the map at " + e.latlng.toString())
//         .openOn(map);
// }

// map.on('click', onMapClick);