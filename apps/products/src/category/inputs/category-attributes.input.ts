import { Field, InputType } from '@nestjs/graphql';

@InputType()
export class CategoryAttributesInput {
  @Field({ nullable: true })
  id: string;

  @Field({ nullable: true })
  attributeName: string;

  @Field({ nullable: true })
  value: string;
}
