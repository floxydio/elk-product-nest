import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { PrismaModule } from './prisma/prisma.module';
import { ElasticsearchWrapperService } from './elk/elastisearch_wrapper.service';

@Module({
  imports: [ProductsModule, PrismaModule,],
  exports: [ElasticsearchWrapperService],
  providers: [ElasticsearchWrapperService],
})
export class AppModule { }
