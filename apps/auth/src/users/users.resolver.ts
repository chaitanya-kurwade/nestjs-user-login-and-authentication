import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { UpdateUserInput } from './inputs/update-user.input';
import { UserResponse } from './responses/user-response.entity';
import { PaginationInput, Public } from 'common/library';
import { NotFoundException } from '@nestjs/common';

@Resolver(() => User)
export class UsersResolver {
  constructor(private readonly usersService: UsersService) {}

  // @Mutation(() => User)
  // createUser(@Args('createUserInput') createUserInput: CreateUserInput) {
  //   return this.usersService.create(createUserInput);
  // }

  @Query(() => [UserResponse], { name: 'getAllUsers' })
  getAllUsers(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('searchFields', { type: () => [String], nullable: true })
    searchFields?: string[],
  ) {
    return this.usersService.getAllUsers(paginationInput, searchFields ?? []);
  }

  // @Query(() => User, { name: 'user' })
  // findOne(@Args('id') _id: string) {
  //   return this.usersService.findOne(_id);
  // }

  @Mutation(() => UserResponse)
  updateUser(@Args('updateUserInput') updateUserInput: UpdateUserInput) {
    return this.usersService.update(updateUserInput._id, updateUserInput);
  }

  // @Mutation(() => User)
  // removeUser(@Args('_id') _id: string) {
  //   return this.usersService.remove(_id);
  // }

  @Query(() => UserResponse, { name: 'userByEmail' })
  getUserByEmailId(@Args('email') email: string) {
    return this.usersService.getUserByEmailId(email);
  }

  @Mutation(() => String, { name: 'userLogout' })
  userLogout(@Args('email') email: string) {
    return this.usersService.userLogout(email);
  }

  @Public()
  @Mutation(() => String, { name: 'forgetPassword' })
  async forgetPasswordSendEmail(@Args('email') email: string) {
    const user = await this.usersService.getUserByEmailId(email);
    if (!user) {
      throw new NotFoundException('user not found');
    }
    return await this.usersService.forgetPassword(user.email);
  }

  @Mutation(() => String, { name: 'receiveForgetPasswordToken' })
  async receiveForgetPasswordToken(newPassword: string, reset_token: string) {
    return await this.usersService.receiveForgetPasswordToken(
      newPassword,
      reset_token,
    );
  }
}
