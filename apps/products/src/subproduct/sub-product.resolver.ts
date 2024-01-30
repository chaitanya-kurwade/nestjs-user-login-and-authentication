import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SubProduct } from './entities/sub-product.entity';
import { SubProductService } from './sub-product.service';
import { CreateSubProductInput } from './inputs/create-subproduct.input';
import { UpdateSubProductInput } from './inputs/update-subproduct.input';

@Resolver(() => SubProduct)
export class SubProductResolver {
  constructor(private readonly subProductService: SubProductService) {}

  @Mutation(() => SubProduct)
  createSubProduct(
    @Args('createSubProductInput') createSubProductInput: CreateSubProductInput,
  ) {
    return this.subProductService.createSubProduct(createSubProductInput);
  }

  @Query(() => [SubProduct], { name: 'getAllSubProducts' })
  getAllSubProducts() {
    return this.subProductService.getAllSubProducts();
  }

  @Query(() => SubProduct, { name: 'getOneSubProductById' })
  getOneSubProductById(@Args('_id') _id: string) {
    return this.subProductService.getOneSubProductById(_id);
  }

  @Mutation(() => SubProduct)
  updateSubProductById(
    @Args('updateSubProductInput') updateSubProductInput: UpdateSubProductInput,
  ) {
    return this.subProductService.updateSubProductById(
      updateSubProductInput._id,
      updateSubProductInput,
    );
  }

  @Mutation(() => SubProduct)
  deleteSubProductById(@Args('_id') _id: string) {
    return this.subProductService.deleteSubProductById(_id);
  }
}
