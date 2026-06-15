import { ArrayMaxSize, IsArray, IsIn, IsString, MaxLength, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class MessageAssistantDto {
  @IsIn(['user', 'assistant'])
  role: 'user' | 'assistant';

  @IsString()
  @MaxLength(1000)
  contenu: string;
}

// DTO de la requête envoyée à l'assistant IA public (page d'accueil)
export class AskAssistantDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => MessageAssistantDto)
  messages: MessageAssistantDto[];
}
