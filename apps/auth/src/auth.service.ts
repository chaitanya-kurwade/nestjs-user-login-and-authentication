import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { CreateUserInput } from './users/dto/create-user.input';
import { User } from './users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validate(email: string, password: string) {
    const user = await this.userService.getUserByEmailId(email);
    const pass = await bcrypt.compare(password, (await user).password);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return pass ? user : null;
  }

  async login(email: string, password: string) {
    const user = await this.userService.getUserByEmailId(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials : email not found');
    } else {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Invalid credentials : wrong password');
      }
      const payload = { email: user?.email, _id: user?._id };
      return {
        access_token: this.jwtService.sign(payload, {
          secret: this.configService.get('JWT_SECRET'),
        }),
      };
    }
  }

  async signup(signupUserInput: CreateUserInput) {
    const user = await this.userService.getUserByEmailId(signupUserInput.email);
    if (user) {
      throw new BadRequestException('User already exists');
    }
    const password = await bcrypt.hash(signupUserInput.password, 10);
    return this.userService.create({
      ...createUserInput,
      password,
    });
  }

  async verify(token: string): Promise<User> {
    const decoded = await this.jwtService.verify(token, {
      secret: this.configService.get('JWT_SECRET'),
    });
    const user = await this.userService.getUserByEmailId(decoded.email);
    return user;
  }
}
