import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  BadRequestException,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
import { ResponseService } from './response/response.service';
import { CatchEverythingFilter } from './common/catch_everything_filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const responseService = app.get(ResponseService);
  app.useGlobalFilters(new CatchEverythingFilter(responseService));
  /*----- Global pipes -----*/
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const formattedErrors = errors.map((error: ValidationError) => {
          const firstConstraintKey = error.constraints
            ? Object.keys(error.constraints)[0]
            : null;
          const message =
            firstConstraintKey && error.constraints
              ? error.constraints[firstConstraintKey]
              : 'Invalid value';

          return {
            property: error.property,
            message,
          };
        });

        return new BadRequestException({
          // message: 'Validation failed',
          message: formattedErrors, // Send structured errors
        });
      },
      stopAtFirstError: true,
      whitelist: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.enableCors();
  app.setGlobalPrefix('api');
  /*----- swagger setup -----*/
  const options = new DocumentBuilder()
    .setTitle('Eroways Api Docs')
    .setDescription('This api documentation is for Eroways application')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://beta.erowayz.in/', 'Production')
    .addBearerAuth({ in: 'header', type: 'http' })
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
