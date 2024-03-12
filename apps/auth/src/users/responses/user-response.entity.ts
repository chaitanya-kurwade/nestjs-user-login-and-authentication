import { Field, GraphQLISODateTime, ObjectType } from '@nestjs/graphql';
import { IsPhoneNumber } from 'class-validator';

@ObjectType()
export class UserResponse {
  @Field()
  _id: string;

  @Field()
  email: string;

  @Field()
  firstName: string;

  @Field()
  lastName: string;

  @Field({ nullable: true })
  username?: string;

  @IsPhoneNumber('IN')
  @Field({ nullable: true })
  phoneNumber?: string;

  // @Prop({ type: Date, required: true, default: new Date() })
  @Field(() => GraphQLISODateTime, { nullable: false })
  createdAt: Date;

  // @Prop({ type: Date, required: true, default: new Date() })
  @Field(() => GraphQLISODateTime, { nullable: false })
  updatedAt: Date;
}
