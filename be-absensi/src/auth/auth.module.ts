import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport'; // ✅ WAJIB
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtStrategy } from './jwt.strategy'; // ✅ WAJIB

@Module({
  imports: [
    PassportModule, // ✅ WAJIB untuk bisa pakai @UseGuards(AuthGuard('jwt'))
    JwtModule.register({
      secret: 'RAHASIA_JWT_LO', // nanti bisa pakai process.env.JWT_SECRET
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, UsersService, JwtStrategy], // ✅ Tambah JwtStrategy di sini
})
export class AuthModule {}
