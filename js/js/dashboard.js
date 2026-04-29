
let daerahCount={};
let total=0;

db.collection("laporan").get().then(function(snapshot){

snapshot.forEach(function(doc){

let d=doc.data();

total++;

let daerah="Tidak diketahui";

if(d.daerah){
daerah=d.daerah;
}

if(daerahCount[daerah]){
daerahCount[daerah]++;
}else{
daerahCount[daerah]=1;
}

});

document.getElementById("total").innerHTML=total;

new Chart(document.getElementById("chartDaerah"),{
type:"bar",
data:{
labels:Object.keys(daerahCount),
datasets:[{
label:"Jumlah Laporan",
data:Object.values(daerahCount)
}]
}
});

});
