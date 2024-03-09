import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { FacultiesService } from './faculties.service';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Faculties')
@Controller('faculties')
export class FacultiesController {
  constructor(private readonly facultiesService: FacultiesService) {}

  @Post()
  @Roles(UserRole.ADMINISTRATOR)
  create(@Body() createFacultyDto: CreateFacultyDto) {
    return this.facultiesService.create(createFacultyDto);
  }

  @Get()
  findAll() {
    return this.facultiesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.facultiesService.findOne(+id);
  }

  @Patch(':id')
  @Roles(UserRole.ADMINISTRATOR)
  update(@Param('id') id: string, @Body() updateFacultyDto: CreateFacultyDto) {
    return this.facultiesService.update(+id, updateFacultyDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMINISTRATOR)
  remove(@Param('id') id: string) {
    return this.facultiesService.remove(+id);
  }
}
