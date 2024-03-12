import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { MasterProduct } from './entities/master-product.entity';
import { MasterProductService } from './master-product.service';
import { CreateMasterProductInput } from './inputs/create-master-product.input';
import { UpdateMasterProductInput } from './inputs/update-masterproduct.input';
import { PaginationInput } from 'common/library';
import { MasterProductList } from './responses/master-products-list.response.entity';

@Resolver(() => MasterProduct)
export class MasterProductResolver {
  constructor(private readonly masterProductService: MasterProductService) {}

  @Mutation(() => MasterProduct)
  createMasterProduct(
    @Args('createMasterProductInput')
    createMasterProductInput: CreateMasterProductInput,
  ) {
    return this.masterProductService.createMasterProduct(
      createMasterProductInput,
    );
  }

  @Query(() => MasterProductList, { name: 'getAllMasterProduct' })
  async getAllMasterProducts(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('searchFields', { type: () => [String], nullable: true })
    searchFields?: string[],
  ): Promise<MasterProductList> {
    const products = await this.masterProductService.getAllMasterProducts(
      paginationInput,
      searchFields ?? [],
    );
    return products;
  }

  @Query(() => MasterProduct, { name: 'getMasterProduct' })
  getOneMasterProductById(@Args('_id') _id: string) {
    return this.masterProductService.getOneMasterProductById(_id);
  }

  @Mutation(() => MasterProduct)
  updateMasterProductById(
    @Args('updateMasterProductInput')
    updateMasterProductInput: UpdateMasterProductInput,
  ) {
    return this.masterProductService.updateMasterProductById(
      updateMasterProductInput._id,
      updateMasterProductInput,
    );
  }

  @Mutation(() => MasterProduct)
  deleteMasterProductById(@Args('_id', { type: () => String }) _id: string) {
    return this.masterProductService.deleteMasterProductById(_id);
  }
}
