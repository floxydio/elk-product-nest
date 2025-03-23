import { Body, Controller, Get, HttpCode, HttpException, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from './dto/products_dto';
import { ProductQuery } from './query/products_query';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Get("/")
  @HttpCode(200)
  async fetchData(@Query('page') page: number, @Query('limit') limit: number) {
    if (Number(limit) == 0) {
      limit = 10
    }
    let response = await this.productsService.getProduct(Number(page), Number(limit))

    if (response.error) {
      throw new HttpException(response, response.status)
    } else {
      return response
    }
  }

  @Post("/create")
  @HttpCode(201)
  async createData(@Body() productForm: ProductDto) {
    let response = await this.productsService.createProduct(productForm)
    if (response.error) {
      throw new HttpException(response, response.status)
    } else {
      return response
    }
  }

  @Get("/sync-product")
  async syncData() {
    let response = await this.productsService.syncDataProduct()
    if (response.error) {
      throw new HttpException(response, response.status)
    } else {
      return response
    }
  }

  @Get("/search")
  async searchProduct(@Query() productQuery: ProductQuery) {
    let response = await this.productsService.searchProduct(productQuery)
    return response
  }
}
