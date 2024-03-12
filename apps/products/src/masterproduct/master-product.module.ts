import { Module } from '@nestjs/common';
import { MasterProductService } from './master-product.service';
import { MasterProductResolver } from './master-product.resolver';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MasterProduct,
  MasterProductSchema,
} from './entities/master-product.entity';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloFederationDriver,
  ApolloFederationDriverConfig,
} from '@nestjs/apollo';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [
    CategoryModule,
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forFeature([
      {
        name: MasterProduct.name,
        schema: MasterProductSchema,
      },
    ]),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_DB_URL'),
      }),
    }),
    GraphQLModule.forRoot<ApolloFederationDriverConfig>({
      driver: ApolloFederationDriver,
      autoSchemaFile: {
        federation: 2,
      },
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      playground: false,
    }),
  ],
  providers: [MasterProductResolver, MasterProductService],
})
export class MasterProductModule {}
