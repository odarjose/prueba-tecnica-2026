import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  it('creates a product with unit price formatted to two decimals', async () => {
    const create = jest.fn();
    const save = jest.fn();
    const product = {
      name: 'Laptop',
      description: 'Laptop para oficina',
      unitPrice: '1200.50',
      stock: 8,
      category: 'Tecnología',
    } as Product;
    create.mockReturnValue(product);
    save.mockResolvedValue(product);
    const repository = {
      create,
      save,
    } as unknown as Repository<Product>;
    const service = new ProductsService(repository);

    const result = await service.create({
      name: 'Laptop',
      description: 'Laptop para oficina',
      unitPrice: 1200.5,
      stock: 8,
      category: 'Tecnología',
    });

    expect(create).toHaveBeenCalledWith({
      name: 'Laptop',
      description: 'Laptop para oficina',
      unitPrice: '1200.50',
      stock: 8,
      category: 'Tecnología',
    });
    expect(result).toBe(product);
  });
});
