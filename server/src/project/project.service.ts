import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './entities/project.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>
  ) {}

  async create(createProjectDto: CreateProjectDto, userId: number) {
    const { clientId, ...projectData } = createProjectDto;

    const newProject = this.projectRepository.create({
      ...projectData,
      status: 'ONGOING',
      user: { id: userId },
      client: { id: clientId },
    });

    await this.projectRepository.insert(newProject);
    return newProject;
  }

  async findAll(userId: number) {
    return await this.projectRepository.find({
      where: { user: { id: userId } },
      relations: ['client'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const project = await this.projectRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!project) {
      throw new NotFoundException(
        `해당 프로젝트(ID: ${id})를 찾을 수 없거나 권한이 없습니다.`
      );
    }
    return project;
  }

  async update(id: number, updateProjectDto: UpdateProjectDto, userId: number) {
    const project = await this.findOne(id, userId);

    const UpdatedProject = Object.assign(project, updateProjectDto);
    return await this.projectRepository.save(UpdatedProject);
  }

  async remove(id: number, userId: number) {
    const project = await this.findOne(id, userId);
    await this.projectRepository.remove(project);

    return { message: `프로젝트(ID:${id})를 성공적으로 삭제했습니다.` };
  }
}
