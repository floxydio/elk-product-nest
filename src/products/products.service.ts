import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductDto } from './dto/products_dto';
import { ProductQuery } from './query/products_query';
import { ElasticsearchWrapperService } from 'src/elk/elastisearch_wrapper.service';

@Injectable()
export class ProductsService {
    constructor(private prisma: PrismaService, private readonly elasticSearchService: ElasticsearchWrapperService) { }

    async syncDataProduct() {
        let data = await this.prisma.products.findMany()
        for (let i = 0; i < data.length; i++) {
            await this.elasticSearchService.index({
                index: 'products',
                id: data[i].product_id.toString(),
                body: {
                    product_id: data[i].product_id,
                    product_name: data[i].product_name,
                    product_desc: data[i].product_desc,
                    product_price: data[i].product_price,
                    product_tag: data[i].product_tag
                }
            })
        }

        return {
            status: 200,
            error: false,
            message: 'Successfully Sync Data to Elastic Search'
        }
    }

    async getProduct(page: number, limit: number) {
        const offset = (page - 1) * limit;
        try {
            let total = await this.prisma.products.count()
            let data = await this.prisma.products.findMany(
                {
                    orderBy: {
                        product_id: 'desc'
                    },
                    take: limit,
                    skip: offset
                },
            )
            if (data.length > 0) {
                return {
                    status: 200,
                    error: false,
                    data: data,
                    total_page: Math.ceil(total / limit),
                    current_page: page,
                    total_data: total,
                    message: 'Successfully Getting Product List'
                }
            } else {
                return {
                    status: 200,
                    error: true,
                    data: [],
                    message: 'Data Not Found'
                }
            }
        } catch (err) {
            return {
                status: 500,
                error: true,
                message: err.message
            }
        }
    }

    async createProduct(productForm: ProductDto) {
        try {
            await this.prisma.products.create({
                data: {
                    product_name: productForm.product_name,
                    product_desc: productForm.product_desc,
                    product_price: productForm.product_price,
                    product_tag: productForm.product_tag
                }
            })
            return {
                status: 201,
                error: false,
                message: 'Successfully Creating Product'
            }
        } catch (err) {
            return {
                status: 500,
                error: true,
                message: err.message
            }
        }
    }

    async searchProduct(query: ProductQuery) {
        const must: any[] = [];


        if (query.product_name !== "" && query.product_name !== undefined) {
            must.push({
                term: {
                    product_name: query.product_name
                }
            });
        }

        if (query.product_desc !== "" && query.product_desc !== undefined) {
            must.push({
                term: {
                    product_desc: query.product_desc
                }
            });
        }

        if (query.product_tag !== "" && query.product_tag !== undefined) {
            must.push({
                term: {
                    product_tag: query.product_tag
                }
            })
        }

        const data = await this.elasticSearchService.search({
            query: {
                bool: {
                    must: must
                }
            }
        });
        const hits = data.hits.hits.map((hit) => hit._source);

        return {
            status: 200,
            data: {
                products: hits
            }
        };
    }
}
