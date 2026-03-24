import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ClientService } from './client.service';
import { CreateClientDto } from './dto/create-client.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateClientDto } from './dto/update-client.dto';

@Controller('client')
@UseGuards(JwtAccessGuard)
export class ClientController {
  constructor(private readonly clientService: ClientService) {}

  // 클라이언트 등록하기
  @Post()
  create(
    @Body() CreateClientDto: CreateClientDto,
    // @CurrentUser('sub') userId: number
    @Req() req: any
  ) {
    const userId = req.user.sub;
    return this.clientService.create(CreateClientDto, userId);
  }

  // 클라이언트 목록 조회
  @Get()
  findAll(@Req() req: any) {
    const userId = req.user.sub
    return this.clientService.findAll(userId);
  }

  // 클라이언트 수정
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClientDto: UpdateClientDto,
    @CurrentUser('sub') userId: number
  ) {
    return this.clientService.update(id, updateClientDto, userId);
  }

  // 클라이언트 삭제
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number
  ) {
    return this.clientService.remove(id, userId);
  }
}
