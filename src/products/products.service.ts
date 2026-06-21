import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { ListProductsQueryDto } from './dto/list-products-query.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './product.entity';

export interface PaginatedProductsResponse {
  items: Product[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const SORTABLE_COLUMNS: Record<string, string> = {
  name: 'product.name',
  unit_price: 'product.unitPrice',
  stock: 'product.stock',
  category: 'product.category',
  created_at: 'product.createdAt',
};

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productsRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<Product> {
    const product = this.productsRepository.create({
      ...createProductDto,
      unitPrice: createProductDto.unitPrice.toFixed(2),
    });

    return this.productsRepository.save(product);
  }

  async findAll(
    query: ListProductsQueryDto,
  ): Promise<PaginatedProductsResponse> {
    const page = query.page;
    const limit = query.limit;
    const queryBuilder = this.productsRepository.createQueryBuilder('product');

    if (query.search_by_name) {
      queryBuilder.andWhere('product.name ILIKE :search', {
        search: `%${query.search_by_name}%`,
      });
    }

    const { column, direction } = this.parseSort(query.sort);
    queryBuilder.orderBy(column, direction);
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, total] = await queryBuilder.getManyAndCount();

    return {
      items,
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.productsRepository.findOne({ where: { id } });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    return product;
  }

  async update(
    id: string,
    updateProductDto: UpdateProductDto,
  ): Promise<Product> {
    const product = await this.findOne(id);
    const nextProduct = {
      ...updateProductDto,
      unitPrice:
        updateProductDto.unitPrice === undefined
          ? product.unitPrice
          : updateProductDto.unitPrice.toFixed(2),
    };

    Object.assign(product, nextProduct);

    return this.productsRepository.save(product);
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);
    await this.productsRepository.remove(product);
  }

  async findLowStock(threshold: number): Promise<Product[]> {
    return this.productsRepository
      .createQueryBuilder('product')
      .where('product.stock <= :threshold', { threshold })
      .orderBy('product.stock', 'ASC')
      .addOrderBy('product.name', 'ASC')
      .getMany();
  }

  private parseSort(sort?: string): {
    column: string;
    direction: 'ASC' | 'DESC';
  } {
    if (!sort) {
      return { column: 'product.createdAt', direction: 'DESC' };
    }

    const [field, direction] = sort.split('-');
    const column = SORTABLE_COLUMNS[field];
    const normalizedDirection = direction?.toUpperCase();

    if (!column || !['ASC', 'DESC'].includes(normalizedDirection)) {
      throw new BadRequestException(
        'El parámetro sort debe usar un campo permitido y dirección ASC o DESC',
      );
    }

    return {
      column,
      direction: normalizedDirection as 'ASC' | 'DESC',
    };
  }
}
