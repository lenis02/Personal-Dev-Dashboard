import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Patch,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserSbdDto } from './dto/update-user.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 로그인 or 가입
  @Post('login')
  async login(@Body() createUserDto: CreateUserDto) {
    const { name, socialId, provider } = createUserDto;
    return await this.userService.findBySocialIdOrSave(
      name,
      socialId,
      provider
    );
  }

  // 특정 유저 조회
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.userService.findById(id);
  }

  // 조회한 유저 기본 정보 업데이트
  @Patch(':id/sbd')
  async updateSbd(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserSbdDto: UpdateUserSbdDto
  ) {
    return await this.userService.updateSBD(id, updateUserSbdDto);
  }
}
