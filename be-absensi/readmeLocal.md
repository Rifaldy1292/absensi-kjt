# ================================

# ENDPOINT API UNTUK FRONTEND

# ================================

# 🔐 AUTH

POST /auth/login → Login Admin (return JWT)
get /auth/me

# 👥 EMPLOYEES (Data Karyawan)

GET /employees → Lihat semua karyawan
GET /employees/:id → Detail karyawan
POST /employees → Tambah karyawan
PATCH /employees/:id → Update data karyawan
DELETE /employees/:id → Hapus karyawan

# 📆 ATTENDANCE (Data Absensi)

GET /attendance → Semua data absensi
GET /attendance/daily → Absensi hari ini
GET /attendance/weekly → Absensi minggu ini
GET /attendance/monthly → Absensi bulan ini
GET /attendance/:id → Detail absensi (opsional)

# 📌 Tambahan opsional (bisa ditambahkan kalau perlu)

# GET /attendance?employee_id=UUID → Filter absensi per karyawan

# Semua endpoint (kecuali /auth/login) membutuhkan JWT token

# untuk isi seeder

npx ts-node prisma/seed.ts

# untuk start

npm run start:dev
