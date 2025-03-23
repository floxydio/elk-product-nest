import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ElasticsearchWrapperService } from 'src/elk/elastisearch_wrapper.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProductsController],
  providers: [ProductsService, ElasticsearchWrapperService],
  exports: [ElasticsearchWrapperService]
})
export class ProductsModule { }
