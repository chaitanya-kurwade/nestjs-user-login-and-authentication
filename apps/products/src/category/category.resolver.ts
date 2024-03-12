import { Resolver, Query, Mutation, Args } from '@nestjs/graphql';
import { CategoryService } from './category.service';
import { Category } from './entities/category.entity';
import { CreateCategoryInput } from './inputs/create-category.input';
import { UpdateCategoryInput } from './inputs/update-category.input';
import { PaginationInput } from 'common/library/pagination/inputs/pagination.input';
import { CategoryList } from './responses/category-lists-response.entity';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Mutation(() => Category)
  createCategory(
    @Args('createCategoryInput') createCategoryInput: CreateCategoryInput,
  ) {
    return this.categoryService.create(createCategoryInput);
  }

  @Query(() => CategoryList, { name: 'categories' })
  async getAllCategories(
    @Args('paginationInput', { nullable: true })
    paginationInput: PaginationInput,
    @Args('searchFields', { type: () => [String], nullable: true })
    searchFields?: string[],
  ): Promise<CategoryList> {
    const categoryList = await this.categoryService.findAll(
      paginationInput,
      searchFields ?? [],
    );
    return categoryList;
  }

  @Query(() => Category, { name: 'category' })
  getCategoryById(@Args('_id') _id: string) {
    return this.categoryService.getCategoryById(_id);
  }

  @Mutation(() => Category)
  updateCategory(
    @Args('updateCategoryInput') updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoryService.update(
      updateCategoryInput._id,
      updateCategoryInput,
    );
  }

  @Mutation(() => Category)
  removeCategory(@Args('_id') _id: string) {
    return this.categoryService.remove(_id);
  }
}
