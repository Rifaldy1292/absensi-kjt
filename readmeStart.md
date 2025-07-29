## pastikan env di frontEnd dan BackEnd sudah sesuai ,dan untuk port pastikan sama dengan yang awal

# 1. Install semua dependency (root, frontend, backend)

npm run install:dep

# 2. Hapus semua tabel & generate ulang schema sesuai schema.prisma/pastikan npx generate prisma sudah dijalankan

npm run db:reset

# 3. Build frontend & backend

# build ulang tiap ganti env next js

npm run build

# 4. Jalankan frontend & backend secara bersamaan

# untuk test dev / untuk running di production run dengan nssm

npm start

# jalankan nssm di directory nssm

## Kontrol Layanan absensi-jfe

-nssm install absensi-jfe
-isi path npm / cari dengan where npm
-argumen "run start"
-start up directori beri "" jika ada spasi ,C:\rifky data penting\project-pak-rahmat-bekasi\absensi-jfe

- jalankan untuk start pertama nssm start absensi-jfe

### Stop sementara

nssm stop absensi-jfe

### Stop total (hapus setting)

nssm remove absensi-jfe confirm

### Nonaktifkan startup otomatis

sc config absensi-jfe start= disabled

### Aktifkan lagi startup otomatis

sc config absensi-jfe start= auto
