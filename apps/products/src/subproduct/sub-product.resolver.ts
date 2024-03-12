import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { SubProduct } from './entities/sub-product.entity';
import { SubProductService } from './sub-product.service';
import { CreateSubProductInput } from './inputs/create-subproduct.input';
import { UpdateSubProductInput } from './inputs/update-subproduct.input';
import { PaginationInput } from 'common/library';
import { SubProductList } from './responses/sub-products-list.response.entity';

@Resolver(() => SubProduct)
export class SubProductResolver {
  constructor(private readonly subProductService: SubProductService) {}

  @Mutation(() => SubProduct)
  createSubProduct(
    @Args('createSubProductInput') createSubProductInput: CreateSubProductInput,
  ) {
    return this.subProductService.createSubProduct(createSubProductInput);
  }

  @Query(() => SubProductList, { name: 'getAllSubProducts' })
  async getAllSubProducts(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('searchFields', { type: () => [String], nullable: true })
    searchFields: string[],
  ) {
    const subProducts = await this.subProductService.getAllSubProducts(
      paginationInput,
      searchFields ?? [],
    );
    return subProducts;
  }

  @Query(() => SubProduct, { name: 'getOneSubProductById' })
  getOneSubProductById(@Args('_id') _id: string) {
    return this.subProductService.getOneSubProductById(_id);
  }

  @Query(() => [SubProduct], { name: 'getSubProductByMasterProductId' })
  getSubProductsByMasterProductId(
    @Args('masterProductId') masterProductId: string,
  ) {
    console.log(masterProductId);
    return this.subProductService.getSubProductsByMasterProductId(
      masterProductId,
    );
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
