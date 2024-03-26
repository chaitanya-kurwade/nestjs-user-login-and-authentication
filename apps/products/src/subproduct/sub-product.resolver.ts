import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { SubProduct } from './entities/sub-product.entity';
import { SubProductService } from './sub-product.service';
import { CreateSubProductInput } from './inputs/create-subproduct.input';
import { UpdateSubProductInput } from './inputs/update-subproduct.input';
import { PaginationInput } from 'common/library';
import { SubProductList } from './responses/sub-products-list.response.entity';
import { ROLES } from 'apps/auth/src/users/enums/role.enum';
import { Roles } from 'common/library/decorators/roles.decorator';
import { ContextService } from 'common/library/service/context.service';
import { Request } from 'express';

@Resolver(() => SubProduct)
export class SubProductResolver {
  constructor(private readonly subProductService: SubProductService) {}

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN)
  @Mutation(() => SubProduct)
  createSubProduct(
    @Args('createSubProductInput') createSubProductInput: CreateSubProductInput,
  ) {
    return this.subProductService.createSubProduct(createSubProductInput);
  }

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.MANAGER)
  @Query(() => SubProductList, { name: 'getAllSubProducts' })
  async getAllSubProducts(
    @Context() context: { req: Request },
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('searchFields', { type: () => [String], nullable: true })
    searchFields: string[],
    @Args('masterProductIds', { type: () => [String], nullable: true })
    masterProductIds: string[],
    @Args('categoryIds', { type: () => [String], nullable: true })
    categoryIds: string[],
  ) {
    const { role } = await new ContextService().getContextInfo(context.req);
    const subProducts = await this.subProductService.getAllSubProducts(
      paginationInput,
      searchFields ?? [],
      masterProductIds ?? [],
      categoryIds ?? [],
      role,
    );
    return subProducts;
  }

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.MANAGER)
  @Query(() => SubProduct, { name: 'getOneSubProductById' })
  async getOneSubProductById(
    @Context() context: { req: Request },
    @Args('_id') _id: string,
  ) {
    const { role } = await new ContextService().getContextInfo(context.req);
    const subProduct = await this.subProductService.getOneSubProductById(
      _id,
      role,
    );
    return subProduct;
  }

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN, ROLES.MANAGER)
  @Query(() => [SubProduct], { name: 'getSubProductByMasterProductId' })
  async getSubProductsByMasterProductId(
    @Context() context: { req: Request },
    @Args('masterProductId') masterProductId: string,
  ) {
    const { role } = await new ContextService().getContextInfo(context.req);
    const subProductsByMasterProductId =
      await this.subProductService.getSubProductsByMasterProductId(
        masterProductId,
        role,
      );

    return subProductsByMasterProductId;
  }

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN)
  @Mutation(() => SubProduct)
  async updateSubProductById(
    @Context() context: { req: Request },
    @Args('updateSubProductInput') updateSubProductInput: UpdateSubProductInput,
  ) {
    const { role } = await new ContextService().getContextInfo(context.req);

    const updatedProduct = await this.subProductService.updateSubProductById(
      updateSubProductInput._id,
      updateSubProductInput,
      role,
    );

    return updatedProduct;
  }

  @Roles(ROLES.ADMIN, ROLES.SUPERADMIN)
  @Mutation(() => SubProduct)
  deleteSubProductById(@Args('_id') _id: string) {
    return this.subProductService.deleteSubProductById(_id);
  }
}
