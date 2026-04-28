/**
 * Dashboard Analytics & Visualization
 * Geoportal Kriminalitas - dashboard.html
 */

// Global chart instances
let chartTrend, chartJenis, chartTingkat, chartLokasi;

/**
 * Initialize Dashboard
 */
function initDashboard() {
  loadDashboardData();
  setupFilterListeners();
  console.log('✅ Dashboard initialized');
}

/**
 * Load data from Firebase and update dashboard
 */
function loadDashboardData(filters = {}) {
  // TODO: Query Firestore with optional filters
  // For now, use mock data

  const mockData = {
    totalLaporan: 245,
    laporanDitangani: 189,
    laporanPending: 56,
    tingkatKeparahan: 'Sedang',
    laporan: [
      {
        id: '1',
        tanggal: new Date('2026-04-28'),
        pelapor: 'Budi Santoso',
        jenis: 'pencurian',
        lokasi: 'Jakarta Pusat',
        tingkat: 'medium',
        status: 'pending',
        ket: 'Pencurian di area parkir mall'
      },
      {
        id: '2',
        tanggal: new Date('2026-04-27'),
        pelapor: 'Siti Nurhaliza',
        jenis: 'penganiayaan',
        lokasi: 'Jakarta Selatan',
        tingkat: 'high',
        status: 'ditangani',
        ket: 'Penganiayaan di sekolah'
      },
      {
        id: '3',
        tanggal: new Date('2026-04-26'),
        pelapor: 'Ahmad Wijaya',
        jenis: 'penipuan',
        lokasi: 'Jakarta Timur',
        tingkat: 'low',
        status: 'ditangani',
        ket: 'Penipuan online'
      }
    ],
    trendData: {
      labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
      data: [45, 52, 48, 61]
    },
    jenisData: {
      pencurian: 85,
      perampokan: 32,
      penganiayaan: 56,
      kekerasan: 28,
      penipuan: 44
    },
    tingkatData: {
      low: 95,
      medium: 120,
      high: 30
    },
    lokasiData: {
      'Jakarta Pusat': 65,
      'Jakarta Selatan': 58,
      'Jakarta Timur': 45,
      'Jakarta Barat': 52,
      'Jakarta Utara': 25
    }
  };

  updateStatistics(mockData);
  updateCharts(mockData);
  updateTable(mockData.laporan);
}

/**
 * Update statistics cards
 */
function updateStatistics(data) {
  document.getElementById('totalLaporan').textContent = data.totalLaporan;
  document.getElementById('laporanDitangani').textContent = data.laporanDitangani;
  document.getElementById('laporanPending').textContent = data.laporanPending;
  document.getElementById('tingkatKeparahan').textContent = data.tingkatKeparahan;
}

/**
 * Update all charts
 */
function updateCharts(data) {
  updateTrendChart(data.trendData);
  updateJenisChart(data.jenisData);
  updateTingkatChart(data.tingkatData);
  updateLokasiChart(data.lokasiData);
}

/**
 * Update Trend Chart
 */
function updateTrendChart(data) {
  const ctx = document.getElementById('chartTrend').getContext('2d');

  if (chartTrend) {
    chartTrend.destroy();
  }

  chartTrend = new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Laporan Kriminalitas',
        data: data.data,
        borderColor: '#e74c3c',
        backgroundColor: 'rgba(231, 76, 60, 0.1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 6,
        pointBackgroundColor: '#e74c3c',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          labels: {
            font: { size: 14 },
            padding: 15
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 12 }
          }
        },
        x: {
          ticks: {
            font: { size: 12 }
          }
        }
      }
    }
  });
}

/**
 * Update Jenis Kriminalitas Chart
 */
function updateJenisChart(data) {
  const ctx = document.getElementById('chartJenis').getContext('2d');

  if (chartJenis) {
    chartJenis.destroy();
  }

  chartJenis = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data).map(k => capitalize(k)),
      datasets: [{
        data: Object.values(data),
        backgroundColor: [
          '#e74c3c',
          '#3498db',
          '#f39c12',
          '#27ae60',
          '#9b59b6'
        ],
        borderColor: '#fff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            font: { size: 12 },
            padding: 15
          }
        }
      }
    }
  });
}

/**
 * Update Tingkat Keparahan Chart
 */
function updateTingkatChart(data) {
  const ctx = document.getElementById('chartTingkat').getContext('2d');

  if (chartTingkat) {
    chartTingkat.destroy();
  }

  const labels = {
    low: 'Rendah',
    medium: 'Sedang',
    high: 'Tinggi'
  };

  chartTingkat = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data).map(k => labels[k]),
      datasets: [{
        label: 'Jumlah Laporan',
        data: Object.values(data),
        backgroundColor: [
          '#27ae60',
          '#f39c12',
          '#e74c3c'
        ],
        borderRadius: 5,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            font: { size: 12 }
          }
        }
      }
    }
  });
}

/**
 * Update Lokasi Chart
 */
function updateLokasiChart(data) {
  const ctx = document.getElementById('chartLokasi').getContext('2d');

  if (chartLokasi) {
    chartLokasi.destroy();
  }

  chartLokasi = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Jumlah Laporan',
        data: Object.values(data),
        backgroundColor: '#e74c3c',
        borderRadius: 5,
        borderWidth: 0
      }]
    },
    options: {
      indexAxis: 'x',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: { size: 12 }
          }
        },
        x: {
          ticks: {
            font: { size: 11 }
          }
        }
      }
    }
  });
}

/**
 * Update data table
 */
function updateTable(laporan) {
  const tableBody = document.getElementById('tableBody');
  
  if (!laporan || laporan.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="7" class="text-center">Data tidak tersedia</td></tr>';
    return;
  }

  const rows = laporan.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${formatDateShort(item.tanggal)}</td>
      <td>${item.pelapor}</td>
      <td>${capitalize(item.jenis || '')}</td>
      <td>${item.lokasi}</td>
      <td><span class="badge ${item.tingkat}">${capitalize(item.tingkat)}</span></td>
      <td><span class="badge ${item.status}">${capitalize(item.status || 'pending')}</span></td>
    </tr>
  `).join('');

  tableBody.innerHTML = rows;
}

/**
 * Setup filter event listeners
 */
function setupFilterListeners() {
  document.getElementById('btnFilter').addEventListener('click', () => {
    const filters = {
      bulan: document.getElementById('filterBulan').value,
      tahun: document.getElementById('filterTahun').value,
      jenis: document.getElementById('filterJenis').value
    };

    console.log('🔍 Applying filters:', filters);
    loadDashboardData(filters);
  });

  document.getElementById('btnReset').addEventListener('click', () => {
    document.getElementById('filterBulan').value = '';
    document.getElementById('filterTahun').value = '';
    document.getElementById('filterJenis').value = '';
    console.log('↻ Filters reset');
    loadDashboardData();
  });
}

/**
 * Initialize on page load
 */
document.addEventListener('DOMContentLoaded', () => {
  initDashboard();
});

console.log('✅ dashboard.js loaded');
