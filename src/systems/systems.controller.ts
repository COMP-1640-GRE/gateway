import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request as ExpressRequest, Router } from 'express';
import {
  JwtPayload,
  JwtPayloadType,
} from 'src/decorators/jwt-payload.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { UserRole } from 'src/users/entities/user.entity';
import { SystemDto } from './dto/system.dto';
import { SystemsService } from './systems.service';

@ApiTags('systems')
@Controller('systems')
export class SystemsController {
  constructor(private readonly systemsService: SystemsService) {}

  @Get('blocked-words')
  getBlockedWords(@JwtPayload() { role, faculty }: JwtPayloadType) {
    switch (role) {
      case UserRole.ADMINISTRATOR:
      case UserRole.UNIVERSITY_MARKETING_MANAGER:
        return this.systemsService.config.blocked_words;
      default:
        if (!faculty) {
          throw new NotFoundException('Faculties not found');
        }

        return this.systemsService.getFacultyBlockedWords(faculty.id);
    }
  }

  @Post('blocked-words')
  @Roles(
    UserRole.ADMINISTRATOR,
    UserRole.UNIVERSITY_MARKETING_MANAGER,
    UserRole.FACULTY_MARKETING_COORDINATOR,
  )
  updateBlockedWords(
    @Body() words: string[],
    @JwtPayload() { role, faculty }: JwtPayloadType,
  ) {
    switch (role) {
      case UserRole.ADMINISTRATOR:
      case UserRole.UNIVERSITY_MARKETING_MANAGER:
        return this.systemsService.updateBlockedWords(words);
      case UserRole.FACULTY_MARKETING_COORDINATOR:
        if (!faculty) {
          throw new NotFoundException('Faculties not found');
        }
        return this.systemsService.updateFacultyBlockedWords(faculty.id, words);
      default:
        break;
    }
  }

  @Get('config')
  @Roles(UserRole.ADMINISTRATOR)
  getConfig() {
    const { blocked_words, ...config } = this.systemsService.config;

    return config;
  }

  @Patch('config')
  @Roles(UserRole.ADMINISTRATOR)
  updateConfig(@Body() dto: SystemDto) {
    return this.systemsService.updateConfigs(dto);
  }

  @Get('available-guest-resources')
  getAvailableGuestResources(@Request() req: ExpressRequest) {
    const router = req.app._router as Router;
    return router.stack
      .map((layer) => layer.route?.path)
      .filter((item) => item !== undefined && item.includes('/dashboard/'));
  }

  @Get('guest-resources')
  getGuestResources(@JwtPayload() { faculty }: JwtPayloadType) {
    return this.systemsService.getFacultyGuestResources(faculty?.id);
  }

  @Post('guest-resources')
  @Roles(UserRole.FACULTY_MARKETING_COORDINATOR)
  updateGuestResources(
    @JwtPayload() { faculty }: JwtPayloadType,
    @Body() words: string[],
  ) {
    return this.systemsService.updateGuestResources(faculty?.id, words);
  }
}
