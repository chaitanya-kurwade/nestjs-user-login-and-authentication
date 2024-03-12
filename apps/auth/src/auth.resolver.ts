import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { UserLoginInput } from './users/inputs/user-login.input';
import { LoginResponse } from './users/responses/user-login.response.entity';
import { BadRequestException } from '@nestjs/common';
import { CreateUserInput } from './users/inputs/create-user.input';
import { Public } from 'common/library/decorators/public.decorator';
import { UserResponse } from './users/responses/user-response.entity';
import { User } from './users/entities/user.entity';
@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => LoginResponse)
  @Public()
  async login(
    @Args('userLoginInput') userLoginInput: UserLoginInput,
  ): Promise<LoginResponse> {
    const { email, username, phoneNumber } = userLoginInput;
    const credential = email || username || phoneNumber;
    const userLogin = await this.authService.enterUsernameOrEmailOrPhoneNumber(
      credential,
      userLoginInput.password,
    );
    return userLogin;
  }

  @Mutation(() => UserResponse)
  @Public()
  signup(
    @Args('createUserInput') createUserInput: CreateUserInput,
  ): Promise<UserResponse> {
    const user = this.authService.signup(createUserInput);
    return user;
  }

  @Mutation(() => String, { name: 'RefreshToken' })
  @Public()
  async refreshAccessToken(
    @Context() context: { req: Request },
  ): Promise<string> {
    const refreshToken =
      context.req.headers['authorization']?.split(' ')[1] || null;
    if (!refreshToken) {
      throw new BadRequestException('token not found');
    }
    const access_token =
      await this.authService.refreshAccessToken(refreshToken);
    return access_token;
  }

  @Mutation(() => UserResponse, { name: 'getUserByAccessToken' })
  async getUserByAccessToken(
    @Context() context: { req: Request },
  ): Promise<User> {
    const access_token =
      context.req.headers['authorization']?.split(' ')[1] || null;

    const user = await this.authService.getUserByAccessToken(access_token);
    return user;
  }

  @Public()
  @Mutation(() => String, { name: 'loginViaOtp' })
  async loginViaOtpAndPhoneOrEmail(@Args('phoneOrEmail') phoneOrEmail: string) {
    return await this.authService.loginViaOtpAndPhoneOrEmail(phoneOrEmail);
  }

  @Public()
  @Mutation(() => LoginResponse, { name: 'validateOtp' })
  async validateOtp(@Args('otp') otp: number) {
    return await this.authService.validateOtp(otp);
  }
}
