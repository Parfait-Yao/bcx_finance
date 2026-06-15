import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AssistantService } from './assistant.service';
import { AskAssistantDto } from './dto/ask-assistant.dto';

@Controller('assistant')
export class AssistantController {
  constructor(private assistantService: AssistantService) {}

  // Endpoint public (page d'accueil) : limité à 10 requêtes / 5 min par IP
  @Throttle({ default: { limit: 10, ttl: 5 * 60 * 1000 } })
  @Post('ask')
  async ask(@Body() dto: AskAssistantDto) {
    const reponse = await this.assistantService.repondre(dto.messages);
    return { reponse };
  }
}
