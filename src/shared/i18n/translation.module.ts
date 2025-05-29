import { Module } from '@nestjs/common';
import { AcceptLanguageResolver, I18nModule } from 'nestjs-i18n';
import { join } from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      loaderOptions: {
        path: join(process.cwd(), '/src/shared/i18n/translations'),
        watch: true,
      },
      fallbackLanguage: 'en',
      resolvers: [AcceptLanguageResolver],
    }),
  ],
})
export class TranslationModule {}
