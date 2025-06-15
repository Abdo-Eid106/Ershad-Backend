import { Module } from '@nestjs/common';
import { I18nModule, AcceptLanguageResolver } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: join(process.cwd(), '/src/shared/i18n/translations'),
        watch: true,
      },
      resolvers: [AcceptLanguageResolver],
    }),
  ],
})
export class TranslationModule {}
