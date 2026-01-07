# 🔗 LOGE System - Integrated Venue & Logistics Management

Sistem LOGE adalah platform manajemen inventaris dan lokasi yang terintegrasi dengan ekosistem **TitikTemu**. Proyek ini menggunakan arsitektur microservices dengan API Gateway berbasis **GraphQL Schema Stitching**.

---

## 🚀 Persiapan Lingkungan

Sebelum menjalankan sistem, pastikan komponen berikut sudah tersedia:
- **Node.js** (v18+)
- **MySQL** berjalan pada port **3308** (atau sesuaikan di `.env`)
- **TitikTemu Event Service** berjalan pada port **3002** (untuk data event rill)

---

## 🛠️ Instalasi & Setup

Jalankan perintah berikut di setiap folder layanan (`venue-provider`, `logistics-service`, `inventory-consumer`, `api-gateway`):

```bash
npm install
```

### Konfigurasi Database
Pastikan MySQL aktif, lalu jalankan setup database pada layanan backend:

```bash
# Di folder venue-provider, logistics-service, & inventory-consumer
node setup-db.js
node sync-db.js
```

---

## 🚦 Menjalankan Layanan

Jalankan semua layanan berikut secara berurutan:

1.  **Venue Provider**: `node index.js` (Port 4002)
2.  **Logistics Service**: `node index.js` (Port 4003)
3.  **Inventory Consumer**: `node index.js` (Port 4004)
4.  **API Gateway**: `node index.js` (Port 4000)

## 🛑 Mematikan Layanan

Untuk menghentikan layanan yang sedang berjalan:
1.  Tekan **`Ctrl + C`** pada masing-masing terminal yang menjalankan layanan.
2.  Jika port masih tersangkut (error `EADDRINUSE`), gunakan perintah berikut (Windows PowerShell):
    ```powershell
    # Contoh untuk mematikan port 4000
    Get-NetTCPConnection -LocalPort 4000 | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
    ```

---

## 🔍 Pengujian dengan Postman

Akses API Gateway melalui endpoint:
👉 **`http://localhost:4000/graphql`**

### Cara Pengujian di Postman:
1.  Buat request baru dengan method **POST**.
2.  Masukkan URL `http://localhost:4000/graphql`.
3.  Pilih tab **Body**, pilih **GraphQL**.
4.  Masukkan Query/Mutasi yang diinginkan.

### 📥 1. Consumer (Pengambilan Data)
Gunakan kategori ini untuk melihat status dan informasi dari sistem LOGE.

#### A. Dashboard Terpadu (Venue & Logistik)
```graphql
query GetDashboard {
  venues {
    name
    address
    rooms { name capacity }
  }
  items {
    name
    availableStock
  }
}
```

#### B. Cek Kelayakan Event (Analyzer)
Fungsi utama untuk memverifikasi event berdasarkan data TitikTemu.
```graphql
query CheckEvent($eventId: String!) {
  checkFeasibility(eventId: $eventId) {
    eventId
    feasibility
    venue { available message room }
    logistics {
      available
      items { name status }
    }
  }
}
```
*Variables:* `{ "eventId": "101" }`

---

### 📤 2. Provider (Penyediaan/Input Data)
Gunakan kategori ini untuk menambahkan atau memperbarui data dalam sistem.

#### A. Registrasi Venue & Ruangan Baru
```graphql
# Tambah Gedung/Venue
mutation AddVenue {
  addVenue(name: "Gedung Pusat", address: "Jl. Sudirman No. 1") {
    id
    name
  }
}

# Tambah Ruangan ke Venue (Gunakan ID dari langkah di atas)
mutation AddRoom {
  addRoom(venueId: "1", name: "Aula Utama", capacity: 100) {
    id
    name
  }
}
```

#### B. Input Inventaris Logistik
```graphql
mutation AddLogisticItem {
  addItem(
    name: "Screen LED P3", 
    category: "Electronics", 
    totalStock: 5
  ) {
    id
    name
    totalStock
  }
}
```

---

## 🏗️ Struktur Proyek
- `api-gateway`: Pintu masuk utama (GraphQL Gateway).
- `venue-provider`: Manajemen lokasi dan reservasi.
- `logistics-service`: Manajemen alat dan stok barang.
- `inventory-consumer`: Logika kelayakan acara & Integrasi API TitikTemu.

---
**Status: Sistem Siap Digunakan & Terintegrasi**
