import { Controller, Get } from '@nestjs/common';
import { HashService } from './hash.service';

@Controller('hash')
export class HashController {
  constructor(private readonly hashService: HashService) {}

  @Get()
  async generateHash(): Promise<{ hash: string }> {
    const hash = await this.hashService.generateHash();
    return { hash };
  }
}
