import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Patch,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PersonalInfoService } from './personal-info.service';
import { Serialize } from 'src/shared/interceptors/serialize.interceptors';
import { PersonalInfoDto } from './dto/personal-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { RolesGuard } from '../role/guards/roles.guard';
import { Roles } from '../role/decorators/roles.decorator';
import { RoleEnum } from '../role/enums/role.enum';
import { FileInterceptor } from '@nestjs/platform-express';
import { currentUser } from 'src/shared/decorators/current-user.decorator';
import { IPayloud } from 'src/shared/interfaces/payloud.interface';
import { User } from '../user/entities/user.entity';

@Controller()
@UseGuards(JwtGuard, RolesGuard)
@Serialize(PersonalInfoDto)
export class PersonalInfoController {
  constructor(private readonly personalInfoService: PersonalInfoService) {}

  @Get('/students/:id/personal-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  findById(@Param('id', ParseUUIDPipe) id: User['id']) {
    return this.personalInfoService.findOne(id);
  }

  @Get('/me/personal-info')
  @Roles(RoleEnum.STUDENT)
  findMe(@currentUser() user: IPayloud) {
    return this.personalInfoService.findOne(user.id);
  }

  @Put('/students/:id/personal-info')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  updateById(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    return this.personalInfoService.update(id, updatePersonalInfoDto);
  }

  @Patch('/students/:id/avatar')
  @Roles(RoleEnum.ADMIN, RoleEnum.OFFICER)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateAvatarById(
    @Param('id', ParseUUIDPipe) id: User['id'],
    @UploadedFile(
      new ParseFilePipe({
        validators: PersonalInfoController.fileValidators(),
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.personalInfoService.updateAvatar(id, file);
  }

  @Patch('/me/avatar')
  @Roles(RoleEnum.STUDENT)
  @UseInterceptors(FileInterceptor('avatar'))
  async updateMyAvatar(
    @currentUser() user: IPayloud,
    @UploadedFile(
      new ParseFilePipe({
        validators: PersonalInfoController.fileValidators(),
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.personalInfoService.updateAvatar(user.id, file);
  }

  private static fileValidators() {
    return [
      new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
      new FileTypeValidator({ fileType: /(jpeg|png|webp)$/ }),
    ];
  }
}
