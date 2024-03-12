import { Field, InputType } from '@nestjs/graphql';
import { IsStrongPassword } from 'class-validator';

@InputType()
export class UserLoginInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  username?: string;

  @Field({ nullable: true })
  phoneNumber?: string;

  @Field()
  @IsStrongPassword()
  password: string;
}
