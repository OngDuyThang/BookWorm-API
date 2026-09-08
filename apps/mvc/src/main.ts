import { NestFactory } from '@nestjs/core';
import { MvcModule } from './mvc.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { getEnvFilePath, getViewPath, hbsJsonHelper } from '@app/common';
import { join } from 'path';
import * as hbs from 'hbs';
import * as dotenv from 'dotenv'

const hbsutils = require('hbs-utils')(hbs);

const viewDirectories = [
  'category',
  'author',
  'product',
  'promotion',
  'review',
  'order'
]

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(MvcModule);
  const logger = app.get(Logger);

  dotenv.config({
    path: getEnvFilePath('mvc')
  });

  app.enableCors({
    origin: true,
    credentials: true
  });

  app.use(cookieParser());

  app.setViewEngine('hbs');
  app.useStaticAssets(join(__dirname, 'public'));
  app.setBaseViewsDir([
    ...viewDirectories.map(dir => getViewPath(dir)),
    join(__dirname, 'views')
  ])
  hbsutils.registerWatchedPartials(join(__dirname, 'views', 'partials'));
  hbsJsonHelper()

  const port = process.env.PORT || 8081
  await app.listen(port);
  logger.log(`MVC app is listening on port ${port}`);
}
bootstrap();
