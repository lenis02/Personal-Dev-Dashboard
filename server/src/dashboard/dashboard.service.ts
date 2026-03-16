import { Injectable } from '@nestjs/common';
import { CreateDashboardDto } from './dto/create-dashboard.dto';
import { UpdateDashboardDto } from './dto/update-dashboard.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Client } from '../client/entities/client.entity';
import { Repository } from 'typeorm';
import { Task } from '../task/entities/task.entity';
import { Project } from '../project/entities/project.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Client) private clientRepo: Repository<Client>,
    @InjectRepository(Project) private projectRepo: Repository<Project>,
    @InjectRepository(Task) private taskRepo: Repository<Task>
  ) {}

  async getSummary(userId: number) {
    const [totalClients, ongoingProjects, pendingTasks] = await Promise.all([
      this.clientRepo.count({ where: { user: { id: userId } } }),
      this.projectRepo.count({
        where: { user: { id: userId }, status: 'ONGOING' },
      }),
      this.taskRepo.count({
        where: { project: { user: { id: userId } }, isDone: false },
      }),
    ]);

    return {
      totalClients,
      ongoingProjects,
      pendingTasks,
    };
  }

  // create(createDashboardDto: CreateDashboardDto) {
  //   return 'This action adds a new dashboard';
  // }

  // findAll() {
  //   return `This action returns all dashboard`;
  // }

  // findOne(id: number) {
  //   return `This action returns a #${id} dashboard`;
  // }

  // update(id: number, updateDashboardDto: UpdateDashboardDto) {
  //   return `This action updates a #${id} dashboard`;
  // }

  // remove(id: number) {
  //   return `This action removes a #${id} dashboard`;
  // }
}
