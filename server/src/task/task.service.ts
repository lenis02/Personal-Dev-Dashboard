import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { LessThan, Repository } from 'typeorm';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);

  constructor(
    @InjectRepository(Task)
    private taskRepository: Repository<Task>
  ) {}

  // 할 일 생성
  async create(createTaskDto: CreateTaskDto, userId: number) {
    const { projectId, ...taskData } = createTaskDto;

    await this.taskRepository.insert({
      ...taskData,
      isDone: false,
      status: 'PENDING',
      project: { id: projectId },
    });
    return { message: '할 일이 성공적으로 생성되었습니다.' };
  }

  async findAll(userId: number, projectId?: number) {
    const where = projectId
      ? { project: { id: projectId, user: { id: userId } } }
      : { project: { user: { id: userId } } };

    return await this.taskRepository.find({
      where,
      relations: ['project', 'project.client'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number, userId: number) {
    const task = await this.taskRepository.findOne({
      where: {
        id,
        project: { user: { id: userId } },
      },
    });

    if (!task) {
      throw new NotFoundException(
        `할 일(ID: ${id})을 찾을 수 없거나 권한이 없습니다.`
      );
    }

    return task;
  }

  async update(id: number, updateTaskDto: UpdateTaskDto, userId: number) {
    const task = await this.findOne(id, userId);

    const updatedTask = Object.assign(task, updateTaskDto);

    if (updateTaskDto.isDone === true) {
      updatedTask.status = 'COMPLETED';
    } else if (updateTaskDto.isDone === false) {
      updatedTask.status = 'PENDING';
    }

    return await this.taskRepository.save(updatedTask);
  }

  async remove(id: number, userId: number) {
    const task = await this.findOne(id, userId);

    await this.taskRepository.remove(task);
    return { message: `할 일(ID: ${id})이 성공적으로 삭제되었습니다.` };
  }

  // CronExpression.EVERY_DAY_AT_MIDNIGHT
  @Cron('*/10 * * * * *')
  async handleOverdueTasks() {
    this.logger.debug('마감기한 지난 할 일 체크 중...');

    const now = new Date();

    // 미완료, 지연된 할 일 체크
    const overdueTasks = await this.taskRepository.find({
      where: {
        isDone: false,
        dueDate: LessThan(now),
        status: 'PENDING',
      },
    });

    if (overdueTasks.length === 0) return;

    // 병렬처리로 Task들 동시에 상태 업데이트
    await Promise.all(
      overdueTasks.map((task) =>
        this.taskRepository.update(task.id, { status: 'OVERDUE' })
      )
    );

    this.logger.debug(
      `총 ${overdueTasks.length}개의 할 일이 OVERDUE 처리되었습니다!`
    );
  }
}
