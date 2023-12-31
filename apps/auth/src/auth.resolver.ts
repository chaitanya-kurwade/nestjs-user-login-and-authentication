import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { AuthService } from "./auth.service";
import { UserLoginInput } from "./responses/user.login.input";
import { LoginResponse } from "./responses/user.login.response";
import { NotFoundException, UseGuards } from "@nestjs/common";
import { User } from "./users/entities/user.entity";
import { CreateUserInput } from "./users/dto/create-user.input";
import { JwtAuthGuard } from "./guards/jwt.auth.guard";
@Resolver()
export class AuthResolver{

    constructor(private readonly authService:AuthService) { }

    @Mutation(() => LoginResponse)
    async login(@Args('userLoginInput') userLoginInput:UserLoginInput):Promise<{access_token: string}>{
        const loginResponse = await this.authService.login(userLoginInput.email, userLoginInput.password);
        if (!userLoginInput.email) {
            throw new NotFoundException('Invalid email in auth resolver')
        }
        if (!loginResponse) {
            throw new Error('Invalid response in auth resolver')
        }
        return loginResponse;
    }

    @Mutation(()=>User)
    signup(@Args('createUserInput') createUserInput: CreateUserInput){
        const token = this.authService.signup(createUserInput);
        return token;
    }

}