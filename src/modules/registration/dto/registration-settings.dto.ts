import { Expose } from 'class-transformer';

export class RegistrationSettingsDto {
  @Expose()
  isOpen: boolean;

  @Expose()
  semester: boolean;
}
