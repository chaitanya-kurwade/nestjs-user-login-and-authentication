import { Field, Int, ObjectType } from '@nestjs/graphql';
import { SubProduct } from '../entities/sub-product.entity';

@ObjectType()
export class SubProductList {
  @Field(() => [SubProduct])
  subProducts: SubProduct[];

  @Field(() => Int)
  totalCount: number;
}
