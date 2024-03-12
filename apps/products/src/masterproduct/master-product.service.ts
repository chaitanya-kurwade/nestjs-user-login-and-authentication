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

@Injectable()
export class MasterProductService {
  constructor(
    @InjectModel(MasterProduct.name)
    private readonly masterProductModel: Model<MasterProductDocument>,
    private readonly categoryService: CategoryService,
  ) {}

  async createMasterProduct(
    createMasterProductInput: CreateMasterProductInput,
  ) {
    const category = await this.categoryService.getCategoryById(
      createMasterProductInput.categoryId,
    );
    const existingProduct = await this.masterProductModel.findOne({
      masterProductName: createMasterProductInput.masterProductName,
    });
    if (existingProduct) {
      throw new BadGatewayException('Master product already exists');
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
  ): Promise<MasterProductList> {
    // const { page, limit, search, sortField, sortOrder } = paginationInput;
    // // let allDocumentsCount = await this.masterProductModel.countDocuments().exec();
    // // console.log(totalCount);
    // let query = this.masterProductModel.find();
    // if (searchFields == null || !searchFields.length) {
    //   if (sortField && !['ASC', 'DESC'].includes(sortOrder)) {
    //     throw new BadRequestException(
    //       'Invalid sortOrder. It must be either ASC or DESC.',
    //     );
    //   }
    //   if (search) {
    //     query = query.where('masterProductName').regex(new RegExp(search, 'i'));
    //   }
    //   if (sortField && !['ASC', 'DESC'].includes(sortOrder)) {
    //     throw new BadRequestException(
    //       'Invalid sortOrder. It must be either ASC or DESC.',
    //     );
    //   }
    //   if (sortField && sortOrder) {
    //     // console.log(sortOrder, 'single', sortField);
    //     const sortOptions: { [key: string]: SortOrder } = {};
    //     sortOptions[sortField] = sortOrder.toLowerCase() as SortOrder;
    //     query = query.sort(sortOptions);
    //   }
    //   if (!page && !limit && !sortField && !sortOrder) {
    //     const masterProducts = await query.sort({ createdAt: -1 }).exec();
    //     const totalCount = masterProducts.length;
    //     return { masterProducts, totalCount };
    //   }
    //   const skip = (page - 1) * limit;
    //   const masterProducts = await query.skip(skip).limit(limit).exec();
    //   if (!masterProducts && masterProducts.length === 0) {
    //     throw new NotFoundException('masterProducts not found');
    //   }
    //   const totalCount = masterProducts.length;
    //   return { masterProducts, totalCount };
    // } else {
    //   query = this.buildQuery(search, searchFields);
    //   // console.log(query);
    //   if (!page && !limit && !sortField && !sortOrder) {
    //     const masterProducts = await query.sort({ createdAt: -1 }).exec();
    //     const totalCount = masterProducts.length;
    //     return { masterProducts, totalCount };
    //   }
    //   if (sortField && !['ASC', 'DESC'].includes(sortOrder)) {
    //     // console.log(sortOrder, 'sortOrder', sortField);
    //     throw new BadRequestException(
    //       'Invalid sortOrder. It must be either ASC or DESC.',
    //     );
    //   }
    //   if (sortField && sortOrder) {
    //     // console.log(sortOrder, 'all', sortField);
    //     const sortOptions: { [key: string]: SortOrder } = {};
    //     sortOptions[sortField] = sortOrder.toLowerCase() as SortOrder;
    //     query = query.sort(sortOptions);
    //   }
    //   const skip = (page - 1) * limit;
    //   const masterProducts = await query.skip(skip).limit(limit).exec();
    //   if (!masterProducts && masterProducts.length == 0) {
    //     throw new NotFoundException('masterProducts not found');
    //   }
    //   const totalCount = masterProducts.length;
    //   return { masterProducts, totalCount };
    // }
    const { page, limit, search, sortOrder } = paginationInput;

    let query = this.masterProductModel.find();
    let totalCountQuery = this.masterProductModel.find();

    // Apply search if search term is provided
    // if (search && searchFields.length >= 0) {
    //   console.log(search);
    //   const searchQuery = {};
    //   searchFields.forEach((field) => {
    //     searchQuery[field] = { $regex: search, $options: 'i' };
    //   });
    //   query = query.find({ $or: [searchQuery] });
    //   totalCountQuery = totalCountQuery.find({ $or: [searchQuery] });
    // }
    if (search && searchFields.length > 0) {
      const searchQueries = searchFields.map((field) => ({
        [field]: { $regex: search, $options: 'i' },
      }));
      const $orCondition = { $or: searchQueries };
      query = query.find($orCondition);
      totalCountQuery = totalCountQuery.find($orCondition);
    }

    // Apply sorting
    if (sortOrder) {
      query = query.sort(sortOrder);
    }

    // Apply pagination
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);

    // Execute the query
    const masterProducts = await query.exec();

    // Count total filtered documents
    const totalCount = await totalCountQuery.countDocuments();

    return { masterProducts, totalCount };
  }

  private buildQuery(search: string, searchFields?: string[]): any {
    let query = this.masterProductModel.find();
    if (search) {
      const orConditions = searchFields.map((field) => ({
        [field]: { $regex: new RegExp(search, 'i') },
      }));
      query = query.or(orConditions);
    }
    return query;
  }

  async getOneMasterProductById(_id: string) {
    const product = await this.masterProductModel.findById(_id);
    if (!product) {
      throw new NotFoundException(
        'MasterProduct not available with Id: ' + _id,
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
    if (!product) {
      throw new BadRequestException('MasterProduct not updated, _id: ' + _id);
    }
    return product;
  }

  async deleteMasterProductById(_id: string) {
    const product = await this.masterProductModel.findByIdAndDelete(_id);
    if (!product) {
      throw new NotFoundException('MasterProduct not deleted, _id: ' + _id);
    }
    return product;
  }
}
