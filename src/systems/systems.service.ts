import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import * as defaultConfig from './default.config.json';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Faculty } from 'src/faculties/entities/faculty.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class SystemsService implements OnModuleInit {
  private _config = defaultConfig;
  constructor(
    @InjectRepository(Faculty) private facultiesRepository: Repository<Faculty>,
  ) {}

  onModuleInit() {
    try {
      const config = readFileSync(join(process.cwd(), 'config.json'));
      this._config = JSON.parse(config.toString());
    } catch {
      this._config = defaultConfig;

      this.updateConfigFile();
    }
  }

  get config() {
    return this._config;
  }

  updateBlockedWords(words: string[]) {
    this._config.blocked_words = words;

    this.updateConfigFile();

    return this._config.blocked_words;
  }

  async getFacultyBlockedWords(id?: number) {
    if (!id) {
      return this._config.blocked_words;
    }
    const faculty = await this.facultiesRepository.findOne(id);

    if (!faculty) {
      throw new NotFoundException(`Faculty with id ${id} not found`);
    }

    return faculty.blocked_words.concat(this._config.blocked_words);
  }
  async updateFacultyBlockedWords(id: number, blocked_words: string[]) {
    this.facultiesRepository.update(id, { blocked_words });
  }

  private updateConfigFile() {
    writeFileSync(
      join(process.cwd(), 'config.json'),
      JSON.stringify(this._config),
    );
  }
}
