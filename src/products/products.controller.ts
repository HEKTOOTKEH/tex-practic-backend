import { Body, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { forkJoin, map, Observable } from 'rxjs';
import { IProduct, ProductDocument } from '../schemas/product.schema';
import { ProductsService } from './products.service';
import { Patch } from '@nestjs/common/decorators/http/request-mapping.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { IPaginatedResponse } from '../interfaces/paginated-response.interface';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {
  }

  @Get()
  getAll(
    @Query('start') start_query?: string,
    @Query('limit') limit_query?: string,
  ): Observable<IPaginatedResponse<ProductDocument[]>> {
    const start = parseInt(start_query) || undefined;
    const limit = parseInt(limit_query) || undefined;

    return forkJoin([
      this.productsService.getAll(start, limit),
      this.productsService.count(),
    ]).pipe(
      map(([data, total]) => {
        return { total, start, limit, data };
      }),
    );
  }

  @Get(':id')
  getById(@Param('id') id: string): Observable<ProductDocument> {
    return this.productsService.getById(id);
  }

  @Post()
  createOne(@Body() body: IProduct): Observable<ProductDocument> {
    return this.productsService.createOne(body);
  }

  @Delete(':id')
  deleteById(@Param('id') id: string): Observable<{ result: string }> {
    return this.productsService.deleteOne(id);
  }

  @Patch(':id')
  updateOne(
    @Param('id') id: string,
    @Body() payload: Partial<IProduct>,
  ): Observable<ProductDocument> {
    return this.productsService.updateById(id, payload);
  }
}
