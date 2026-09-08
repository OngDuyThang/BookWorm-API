import { Logger, MiddlewareConsumer, Module, NestModule, Provider } from '@nestjs/common';
import { CategoryController } from './controllers/category.controller';
import { AuthorController } from './controllers/author.controller';
import { EnvModule } from '@app/env';
import { HttpExceptionFilter, LoggerMiddleware, getEnvFilePath } from '@app/common';
import { EnvValidation } from './env.validation';
import { APP_FILTER } from '@nestjs/core';
import { DashboardMiddleware } from './middlewares/dashboard.middleware';
import { MvcController } from './mvc.controller';
import { ProductController } from './controllers/product.controller';
import { PromotionController } from './controllers/promotion.controller';
import { ReviewController } from './controllers/review.controller';
import { OrderController } from './controllers/order.controller';

const providers: Provider[] = [
  {
    provide: APP_FILTER,
    useClass: HttpExceptionFilter
  }
]

@Module({
  imports: [
    EnvModule.forRoot(
      getEnvFilePath('mvc'),
      EnvValidation as any
    )
  ],
  controllers: [
    MvcController,
    ProductController,
    CategoryController,
    AuthorController,
    PromotionController,
    ReviewController,
    OrderController
  ],
  providers: [Logger, ...providers],
})
export class MvcModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DashboardMiddleware).exclude('callback').forRoutes('*')
    consumer.apply(LoggerMiddleware).forRoutes('*')
  }
}
