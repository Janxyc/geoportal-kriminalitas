
var map = L.map('map').setView([-0.95,100.36],13);

L.tileLayer(
'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
).addTo(map);

var marker;

map.on('click',function(e){

if(marker){
map.removeLayer(marker);
}

marker = L.marker(e.latlng).addTo(map);

document.getElementById("lat").value = e.latlng.lat;
document.getElementById("lng").value = e.latlng.lng;

});

function loadReports(){

db.collection("laporan").onSnapshot(function(snapshot){

snapshot.forEach(function(doc){

var d = doc.data();

var popup = "<b>"+d.nama+"</b><br>"+d.keterangan;

L.marker([d.lat,d.lng])
.addTo(map)
.bindPopup(popup);

});

});

}

loadReports();

document.getElementById("reportForm").addEventListener("submit",function(e){

e.preventDefault();

var data={
nama:document.getElementById("nama").value,
hp:document.getElementById("hp").value,
keterangan:document.getElementById("ket").value,
lat:document.getElementById("lat").value,
lng:document.getElementById("lng").value,
tanggal:new Date()
};

db.collection("laporan").add(data);

alert("Laporan berhasil dikirim");

});
