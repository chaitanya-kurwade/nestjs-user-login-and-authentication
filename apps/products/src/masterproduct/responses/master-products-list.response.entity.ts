import { Field, Int, ObjectType } from '@nestjs/graphql';
import { MasterProduct } from '../entities/master-product.entity';

@ObjectType()
export class MasterProductList {
  @Field(() => [MasterProduct])
  masterProducts: MasterProduct[];

  @Field(() => Int)
  totalCount: number;
}
