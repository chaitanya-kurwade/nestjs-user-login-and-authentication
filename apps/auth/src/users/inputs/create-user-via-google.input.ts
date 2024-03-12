import { InputType, Field } from '@nestjs/graphql';
import { IsEmail } from 'class-validator';

@InputType()
export class CreateUserViaGoogleInput {
  @IsEmail()
  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;
}
