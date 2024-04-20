import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import morgan from 'morgan';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { handlebars } from 'hbs';

// const DEFAULT_API_VERSION = '1';
const PORT = process.env.PORT || '3000';
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // const corsOrigin = process.env.CORS_ORIGIN.split(',') || [
  //   'http://localhost:3000',
  // ];
  app.enableCors({
    // allowedHeaders: ['content-type'],
    origin: '*',
    // credentials: true,
  });

  app.use(morgan('tiny'));
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.useStaticAssets(join(__dirname, '.', 'static'));
  app.setBaseViewsDir(join(__dirname, '.', 'views'));

  // Register a new function called 'increasePrice'
  handlebars.registerHelper('ifCond', function (v1, operator, v2, options) {
    // console.log('🚀 ~ v2:', v1, operator, v2);
    switch (operator) {
      case '==':
        return v1 == v2 ? options.fn(this) : options.inverse(this);
      case '===':
        return v1 === v2 ? options.fn(this) : options.inverse(this);
      case '!=':
        return v1 != v2 ? options.fn(this) : options.inverse(this);
      case '!==':
        return v1 !== v2 ? options.fn(this) : options.inverse(this);
      case '<':
        return v1 < v2 ? options.fn(this) : options.inverse(this);
      case '<=':
        return v1 <= v2 ? options.fn(this) : options.inverse(this);
      case '>':
        return v1 > v2 ? options.fn(this) : options.inverse(this);
      case '>=':
        return v1 >= v2 ? options.fn(this) : options.inverse(this);
      case '&&':
        return v1 && v2 ? options.fn(this) : options.inverse(this);
      case '||':
        return v1 || v2 ? options.fn(this) : options.inverse(this);
      default:
        return options.inverse(this);
    }
  });
  handlebars.registerHelper('plus', function (v1, v2) {
    return v1 + v2;
  });

  app.setViewEngine('hbs');
  if (process.env.APP_ENV !== 'production') {
    const options = new DocumentBuilder()
      .setTitle('API docs')
      // .setVersion(DEFAULT_API_VERSION)
      .addBearerAuth()
      .build();
    // const globalPrefix = 'docs';
    // app.setGlobalPrefix(globalPrefix);
    // app.enableVersioning({
    //   defaultVersion: DEFAULT_API_VERSION,
    //   type: VersioningType.URI,
    // });
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
  await app.listen(PORT);
  Logger.log(`🚀 Application is running in port ${PORT}`);
}
bootstrap();
