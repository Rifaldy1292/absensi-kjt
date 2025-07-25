# 1. Hapus migrasi lama (opsional tapi bersih)

rm -rf prisma/migrations

# 2. Reset database & apply schema terbaru

npx prisma migrate reset

# ➜ akan hapus semua tabel & data

# ➜ tanya mau seeding atau tidak (y/N)

# 3. Buat ulang migration dari schema yang baru

npx prisma migrate dev --name init-clean

# 4. Regenerate Prisma Client

npx prisma generate

# 5. (Opsional) Buka GUI untuk cek data

npx prisma studio

# isi seed

npm run seed //tidak perlu di production
