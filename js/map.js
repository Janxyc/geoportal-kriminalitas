/**
 * Peta Interaktif & Form Handler
 * Geoportal Kriminalitas - index.html
 */

let map;
let marker;

/**
 * Initialize Map
 */
function initMap() {
  // Initialize Leaflet map - centered at Jakarta
  map = L.map('map').setView([-6.2088, 106.8456], 13);
  
  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  console.log('✅ Map initialized');
}

/**
 * Handle map click - select location
 */
function setupMapClickListener() {
  map.on('click', function(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    // Remove old marker
    if (marker) {
      map.removeLayer(marker);
    }

    // Create new marker
    marker = L.marker([lat, lng], {
      icon: L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    }).addTo(map).bindPopup(`
      <b>📍 Lokasi Terpilih</b><br>
      Lat: ${lat.toFixed(4)}<br>
      Lng: ${lng.toFixed(4)}
    `).openPopup();

    // Fill hidden inputs
    document.getElementById('lat').value = lat;
    document.getElementById('lng').value = lng;

    console.log('📍 Location selected:', lat, lng);
  });
}

/**
 * Load and display all reports from Firestore
 */
function loadReportsRealTime() {
  db.collection("laporan").onSnapshot(function(snapshot) {
    // Clear existing markers (except current selection)
    map.eachLayer(function(layer) {
      if (layer instanceof L.Marker && layer !== marker) {
        map.removeLayer(layer);
      }
    });

    // Add markers for each report
    snapshot.forEach(function(doc) {
      const data = doc.data();
      
      if (data.lat && data.lng) {
        const tingkat = data.tingkat || 'medium';
        const color = getMarkerColor(tingkat);
        const icon = L.icon({
          iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34],
          shadowSize: [41, 41]
        });

        const jenisBadge = {
          'pencurian': '🚨',
          'perampokan': '🔫',
          'penganiayaan': '👊',
          'kekerasan': '💥',
          'penipuan': '💰',
          'narkoba': '💊',
          'lainnya': '📌'
        };

        const popup = `
          <div style="width: 250px;">
            <b>${jenisBadge[data.jenis] || '📌'} ${capitalize(data.jenis || 'Lainnya')}</b><br>
            <hr style="margin: 8px 0;">
            <b>👤 Pelapor:</b> ${data.nama || '-'}<br>
            <b>📱 HP:</b> ${data.hp || '-'}<br>
            <b>⚠️ Tingkat:</b> 
            <span style="background: ${getColorByTingkat(tingkat)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
              ${capitalize(tingkat)}
            </span><br>
            <b>📝 Status:</b> 
            <span style="background: ${getColorByStatus(data.status)}; color: white; padding: 2px 6px; border-radius: 3px; font-size: 11px;">
              ${capitalize(data.status || 'pending')}
            </span><br>
            <b>📅 Tanggal:</b> ${formatDate(data.createdAt)}<br>
            <hr style="margin: 8px 0;">
            <b>📄 Keterangan:</b><br>
            ${data.keterangan || '-'}
            ${data.fotoUrl ? `<br><br><img src="${data.fotoUrl}" style="max-width: 100%; border-radius: 5px; margin-top: 10px;">` : ''}
          </div>
        `;

        L.marker([data.lat, data.lng], { icon }).addTo(map).bindPopup(popup);
      }
    });

    console.log('🗺️ Reports loaded on map');
  });
}

/**
 * Get marker color by severity
 */
function getMarkerColor(tingkat) {
  const colors = {
    'low': 'green',
    'medium': 'orange',
    'high': 'red'
  };
  return colors[tingkat] || 'blue';
}

/**
 * Get color by tingkat for badge
 */
function getColorByTingkat(tingkat) {
  const colors = {
    'low': '#27ae60',
    'medium': '#f39c12',
    'high': '#e74c3c'
  };
  return colors[tingkat] || '#95a5a6';
}

/**
 * Get color by status for badge
 */
function getColorByStatus(status) {
  const colors = {
    'pending': '#f39c12',
    'ditangani': '#27ae60',
    'selesai': '#3498db'
  };
  return colors[status] || '#95a5a6';
}

/**
 * Handle form submission
 */
function setupFormSubmit() {
  document.getElementById('reportForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const lat = document.getElementById('lat').value;
    const lng = document.getElementById('lng').value;

    // Validate location
    if (!lat || !lng) {
      alert('❌ Silakan klik peta untuk memilih lokasi kejadian');
      return;
    }

    // Get form data
    const nama = document.getElementById('nama').value.trim();
    const hp = document.getElementById('hp').value.trim();
    const jenis = document.getElementById('jenis').value;
    const tingkat = document.getElementById('tingkat').value;
    const keterangan = document.getElementById('ket').value.trim();
    const fotoFile = document.getElementById('foto').files[0];

    // Validate required fields
    if (!nama) {
      alert('❌ Nama pelapor wajib diisi');
      return;
    }

    if (!jenis) {
      alert('❌ Jenis kriminalitas wajib dipilih');
      return;
    }

    if (!keterangan) {
      alert('❌ Keterangan kejadian wajib diisi');
      return;
    }

    // Update submit button
    const submitBtn = document.getElementById('submitBtn');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = '⏳ Mengirim...';

    try {
      // Get Geolocation address (reverse geocoding)
      let address = 'Jakarta';
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );
        const data = await response.json();
        address = data.address?.city || data.address?.suburb || 'Jakarta';
      } catch (err) {
        console.log('⚠️ Could not get address, using default');
      }

      // Prepare report data
      const reportData = {
        nama,
        hp,
        jenis,
        tingkat,
        keterangan,
        lokasi: {
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          address
        },
        status: 'pending'
      };

      // Add report to Firestore
      const reportId = await firebaseApp.addReport(reportData);
      console.log('✅ Report added:', reportId);

      // Upload photo if provided
      if (fotoFile) {
        try {
          const fotoUrl = await firebaseApp.uploadPhoto(fotoFile, reportId);
          await firebaseApp.updateReport(reportId, { fotoUrl });
          console.log('✅ Photo uploaded');
        } catch (fotoErr) {
          console.warn('⚠️ Photo upload failed:', fotoErr);
        }
      }

      // Success message
      alert('✅ Laporan berhasil dikirim!\n\nData Anda telah kami terima dan akan segera diproses.');

      // Reset form
      document.getElementById('reportForm').reset();
      document.getElementById('lat').value = '';
      document.getElementById('lng').value = '';

      // Remove marker
      if (marker) {
        map.removeLayer(marker);
        marker = null;
      }

    } catch (error) {
      console.error('❌ Error:', error);
      alert('❌ Gagal mengirim laporan.\n\n' + error.message);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
}

/**
 * Format date
 */
function formatDate(timestamp) {
  if (!timestamp) return '-';
  const date = timestamp instanceof Date ? timestamp : (timestamp.toDate ? timestamp.toDate() : new Date(timestamp));
  return date.toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Capitalize string
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 Initializing Geoportal...');
  
  initMap();
  setupMapClickListener();
  setupFormSubmit();
  
  // Wait for Firebase to be ready
  const checkFirebase = setInterval(() => {
    if (typeof firebaseApp !== 'undefined') {
      clearInterval(checkFirebase);
      console.log('✅ Firebase ready');
      loadReportsRealTime();
    }
  }, 100);
});

console.log('✅ map.js loaded');