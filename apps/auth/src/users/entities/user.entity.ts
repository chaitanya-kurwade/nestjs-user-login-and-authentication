import { ObjectType, Field, GraphQLISODateTime } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsEmail, IsPhoneNumber, IsStrongPassword } from 'class-validator';

@ObjectType()
@Schema({ timestamps: true })
export class User {
  @Field()
  _id: string;

  @Prop()
  @Field()
  firstName: string;

  @Prop()
  @Field()
  lastName: string;

  @Prop()
  @Field({ nullable: true })
  username: string;

  @IsPhoneNumber('IN')
  @Prop()
  @Field({ nullable: true })
  phoneNumber: string;

  @IsEmail()
  @Prop()
  @Field()
  email: string;

  @IsStrongPassword()
  @Prop()
  @Field()
  password: string;

  // @Prop({ type: Date, required: false, default: new Date() })
  @Field(() => GraphQLISODateTime, { nullable: false })
  createdAt: Date;

  // @Prop({ type: Date, required: false, default: new Date() })
  @Field(() => GraphQLISODateTime, { nullable: false })
  updatedAt: Date;

  @Prop()
  @Field({ nullable: false })
  hashedRefreshToken: string;

  @Prop()
  @Field({ nullable: true })
  emailOtp: number;

  @Prop()
  @Field(() => GraphQLISODateTime, { nullable: true })
  emailOtpExpiryTime: Date;

  @Prop()
  @Field({ nullable: true })
  phoneOtp: number;

  @Prop()
  @Field(() => GraphQLISODateTime, { nullable: true })
  phoneOtpExpiryTime: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserDocument = User & Document;
