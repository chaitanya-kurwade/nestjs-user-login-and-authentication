import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsPhoneNumber, IsStrongPassword } from 'class-validator';

@InputType()
export class CreateUserInput {
  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  username: string;

  @IsPhoneNumber('IN')
  @Field({ nullable: true })
  phoneNumber: string;

  @IsEmail()
  @Field()
  email: string;

  @IsStrongPassword()
  @Field()
  password: string;
}
