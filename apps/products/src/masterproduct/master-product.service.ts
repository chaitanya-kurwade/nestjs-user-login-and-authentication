import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';

import { CreateMasterProductInput } from './inputs/create-master-product.input';
import { UpdateMasterProductInput } from './inputs/update-masterproduct.input';
import {
  MasterProduct,
  MasterProductDocument,
} from './entities/master-product.entity';
import { PaginationInput } from 'common/library';
import { CategoryService } from '../category/category.service';
import { MasterProductList } from './responses/master-products-list.response.entity';
import { SubProductService } from '../subproduct/sub-product.service';

@Injectable()
export class MasterProductService {
  constructor(
    @InjectModel(MasterProduct.name)
    private readonly masterProductModel: Model<MasterProductDocument>,
    private readonly categoryService: CategoryService,
    private readonly subProductService: SubProductService,
  ) {}

  async createMasterProduct(
    createMasterProductInput: CreateMasterProductInput,
  ) {
    const category = await this.categoryService.getCategoryById(
      createMasterProductInput.categoryId,
    );
    const existingProductName = await this.masterProductModel.findOne({
      masterProductName: createMasterProductInput.masterProductName,
    });
    if (existingProductName) {
      throw new BadGatewayException(
        'Master product already exists with this name:' + existingProductName,
      );
    }
    const existingSku = await this.masterProductModel.findOne({
      sku: createMasterProductInput.sku,
    });
    if (existingSku) {
      throw new BadGatewayException(
        'Master product already exists with this sku:' + existingSku,
      );
    }
    try {
      const product = await this.masterProductModel.create({
        ...createMasterProductInput,
        category,
      });
      return product;
    } catch (error) {
      throw new BadRequestException('MasterProduct not created');
    }
  }

  async getAllMasterProducts(
    paginationInput: PaginationInput,
    searchFields?: string[],
    categoryIds?: string[],
  ): Promise<MasterProductList> {
    const { page, limit, search, sortOrder } = paginationInput;

    // query starts form here
    let query = this.masterProductModel.find({ status: 'PUBLISHED' });
    let totalCountQuery = this.masterProductModel.find({ status: 'PUBLISHED' });

    // getMinMaxPrices
    const getMinMaxPrices = await this.subProductService.getMinMaxPrices();
    const minPrice = getMinMaxPrices.minPrice;
    const maxPrice = getMinMaxPrices.maxPrice;

    // categoryIds[] wise search
    if (categoryIds && categoryIds.length !== 0) {
      query = query.where('category._id').in(categoryIds);
      totalCountQuery = totalCountQuery.where('category._id').in(categoryIds);
    }

    // search
    if (search && searchFields && searchFields.length !== 0) {
      const searchQueries = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      const $orCondition = { $or: searchQueries };
      query = query.find($orCondition);
      totalCountQuery = totalCountQuery.find($orCondition);
    }

    // sort and default sort: DESC
    let sortOptions = {};
    if (sortOrder) {
      if (sortOrder.toUpperCase() === 'ASC') {
        sortOptions = { createdAt: 1 };
      } else if (sortOrder.toUpperCase() === 'DESC') {
        sortOptions = { createdAt: -1 };
      }
    } else {
      sortOptions = { createdAt: -1 };
    }
    query = query.sort(sortOptions);

    // pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    const masterProducts = await query.exec();
    const totalCount = await totalCountQuery.countDocuments().exec();

    return {
      masterProducts,
      totalCount,
      minPrice: minPrice,
      maxPrice: maxPrice,
    };
  }

  async getOneMasterProductById(_id: string) {
    const product = await this.masterProductModel.findById({
      _id,
    });
    if (!product || product.status !== 'PUBLISHED') {
      throw new NotFoundException(
        'Product not available with _id: ' + _id + ', or it is not published',
      );
    }
    return product;
  }

  async updateMasterProductById(
    _id: string,
    updateMasterProductInput: UpdateMasterProductInput,
  ) {
    const product = await this.masterProductModel.findByIdAndUpdate(
      _id,
      updateMasterProductInput,
    );
    if (!product || product.status !== 'PUBLISHED') {
      throw new BadRequestException('MasterProduct not updated, _id: ' + _id);
    }
    return product;
  }

  async deleteMasterProductById(_id: string) {
    const product = await this.masterProductModel.findById({
      _id,
      status: 'PUBLISHED',
    });
    if (!product) {
      throw new NotFoundException('MasterProduct not deleted, _id: ' + _id);
    }
    product.status = 'ARCHIVED';
    return product.save();
  }

  async deleteMasterProductAndItsSubProducts(
    masterProductId: string,
  ): Promise<string> {
    await this.subProductService.deleteSubProductsByMasterProductId(
      masterProductId,
    );
    await this.deleteMasterProductById(masterProductId);
    console.log(masterProductId);
    return 'master product and its sub-products are deleted successfully';
  }

  async deleteCategoryAndMasterProduct(categoryId: string): Promise<string> {
    const category = await this.categoryService.getCategoryById(categoryId);
    if (!category) {
      throw new NotFoundException(
        'category not found for this id: ' + categoryId,
      );
    }
    const masterProduct = await this.masterProductModel.find({
      'category._id': categoryId,
      status: 'PUBLISHED',
    });
    // console.log(masterProduct.map((product) => product._id));
    if (!masterProduct) {
      throw new NotFoundException('master product not found for this category');
    }
    await Promise.all(
      masterProduct.map(
        async (product) =>
          await this.deleteMasterProductAndItsSubProducts(product._id),
      ),
    );
    await this.categoryService.remove(categoryId);
    return 'category, master product and its sub-products are deleted successfully';
  }
}
