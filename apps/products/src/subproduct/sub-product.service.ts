import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubProductInput } from './inputs/create-subproduct.input';
import { UpdateSubProductInput } from './inputs/update-subproduct.input';
import { InjectModel } from '@nestjs/mongoose';
import { SubPorductDocument, SubProduct } from './entities/sub-product.entity';
import { Model } from 'mongoose';
import { PaginationInput } from 'common/library';
import { SubProductList } from './responses/sub-products-list.response.entity';

@Injectable()
export class SubProductService {
  constructor(
    @InjectModel(SubProduct.name)
    private readonly subProductModel: Model<SubPorductDocument>,
  ) {}
  async createSubProduct(createSubProductInput: CreateSubProductInput) {
    const product = await this.subProductModel.create(createSubProductInput);
    if (!product) {
      throw new BadRequestException('SubProduct already exists');
    }
    return product;
  }

  async getAllSubProducts(
    paginationInput: PaginationInput,
    searchFields?: string[],
  ): Promise<SubProductList> {
    // const { page, limit, search, sortField, sortOrder } = paginationInput;
    // // let allDocumentsCount = await this.subProductModel.countDocuments().exec();
    // // console.log(totalCount);
    // let query = this.subProductModel.find();
    // if (searchFields == null || !searchFields.length) {
    //   if (sortField && !['ASC', 'DESC'].includes(sortOrder)) {
    //     throw new BadRequestException(
    //       'Invalid sortOrder. It must be either ASC or DESC.',
    //     );
    //   }
    //   if (search) {
    //     query = query.where('categoryName').regex(new RegExp(search, 'i'));
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
    //     const subProducts = await query.sort({ createdAt: -1 }).exec();
    //     const totalCount = subProducts.length;
    //     return { subProducts, totalCount };
    //   }
    //   const skip = (page - 1) * limit;
    //   const subProducts = await query.skip(skip).limit(limit).exec();
    //   if (!subProducts && subProducts.length === 0) {
    //     throw new NotFoundException('subProducts not found');
    //   }
    //   const totalCount = subProducts.length;
    //   return { subProducts, totalCount };
    // } else {
    //   query = this.buildQuery(search, searchFields);
    //   // console.log(query);
    //   if (!page && !limit && !sortField && !sortOrder) {
    //     const subProducts = await query.sort({ createdAt: -1 }).exec();
    //     const totalCount = subProducts.length;
    //     return { subProducts, totalCount };
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
    //   const subProducts = await query.skip(skip).limit(limit).exec();
    //   if (!subProducts && subProducts.length == 0) {
    //     throw new NotFoundException('subProducts not found');
    //   }
    //   const totalCount = subProducts.length;
    //   return { subProducts, totalCount };
    //
    // }
    const { page, limit, search, sortOrder } = paginationInput;

    let query = this.subProductModel.find();
    let totalCountQuery = this.subProductModel.find();

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
    const subProducts = await query.exec();

    // Count total filtered documents
    const totalCount = await totalCountQuery.countDocuments();

    return { subProducts, totalCount };
  }

  private buildQuery(search: string, searchFields?: string[]): any {
    let query = this.subProductModel.find();
    if (search) {
      const orConditions = searchFields.map((field) => ({
        [field]: { $regex: new RegExp(search, 'i') },
      }));
      query = query.or(orConditions);
    }
    return query;
  }

  async getOneSubProductById(_id: string) {
    const product = await this.subProductModel.findById(_id);
    if (!product) {
      throw new NotFoundException('SubProduct not available with _id: ' + _id);
    }
    return product;
  }

  async getSubProductsByMasterProductId(masterProductId: string) {
    const subProductsList = await this.subProductModel
      .find({ masterProductId })
      .exec();
    console.log(subProductsList);
    if (!subProductsList || subProductsList.length === 0) {
      throw new NotFoundException(
        'SubProduct not available with ' + masterProductId + ' masterProductId',
      );
    }
    return subProductsList;
  }

  async updateSubProductById(
    _id: string,
    updateSubProductInput: UpdateSubProductInput,
  ) {
    const product = await this.subProductModel.findByIdAndUpdate(
      _id,
      updateSubProductInput,
    );
    if (!product) {
      throw new BadRequestException('SubProduct not updated, _id: ' + _id);
    }
    return product;
  }

  async deleteSubProductById(_id: string) {
    const product = await this.subProductModel.findByIdAndDelete(_id);
    if (!product) {
      throw new NotFoundException('SubProduct not deleted, _id: ' + _id);
    }
    return product;
  }
}
