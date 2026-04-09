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
  Query,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { JwtAccessGuard } from '../auth/guard/jwt-access.guard';
import { CurrentUser } from '../auth/decorator/current-user.decorator';
import { UpdateProjectDocumentDto } from './dto/update-project-document.dto';

@Controller('project')
@UseGuards(JwtAccessGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // 프로젝트 등록
  @Post()
  create(
    @Body() createProjectDto: CreateProjectDto,
    // @CurrentUser('sub') userId: number
    @Req() req: any
  ) {
    const userId = req.user.sub;
    return this.projectService.create(createProjectDto, userId);
  }

  // 전체 프로젝트 목록 조회
  @Get()
  findAll(@CurrentUser('sub') userId: number) {
    return this.projectService.findAll(userId);
  }

  @Get('revenue/summary')
  getRevenueSummary(
    @CurrentUser('sub') userId: number,
    @Query('months') months?: string
  ) {
    const parsedMonths = months ? Number(months) : 12;
    return this.projectService.getRevenueSummary(userId, parsedMonths);
  }

  @Get('revenue/month')
  getRevenueByMonth(
    @CurrentUser('sub') userId: number,
    @Query('month') month?: string
  ) {
    if (!month) {
      const now = new Date();
      month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }
    return this.projectService.getRevenueByMonth(userId, month);
  }

  // 프로젝트 수정
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProjectDto: UpdateProjectDto,
    @CurrentUser('sub') userId: number
  ) {
    return this.projectService.update(id, updateProjectDto, userId);
  }

  @Get(':id/documents')
  getDocuments(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number
  ) {
    return this.projectService.getDocuments(id, userId);
  }

  @Patch(':id/documents/:documentId')
  updateDocument(
    @Param('id', ParseIntPipe) id: number,
    @Param('documentId', ParseIntPipe) documentId: number,
    @Body() updateProjectDocumentDto: UpdateProjectDocumentDto,
    @CurrentUser('sub') userId: number
  ) {
    return this.projectService.updateDocument(
      id,
      documentId,
      updateProjectDocumentDto,
      userId
    );
  }

  // 프로젝트 삭제
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('sub') userId: number
  ) {
    return this.projectService.remove(id, userId);
  }
}
