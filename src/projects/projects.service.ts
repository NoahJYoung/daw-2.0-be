import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
  ) {}

  async createProject(
    name: string,
    storagePath: string,
    collaborators: string[] | null,
    owner: User,
  ): Promise<Project> {
    const project = this.projectsRepository.create({
      name,
      storagePath,
      collaborators,
      owner,
    });
    return this.projectsRepository.save(project);
  }

  async getUserProjects(ownerId: string): Promise<Project[]> {
    return this.projectsRepository.find({
      where: { owner: { id: ownerId } },
      relations: ['owner'],
    });
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async updateProject(
    id: string,
    updateData: Partial<Project>,
  ): Promise<Project | null> {
    await this.projectsRepository.update(id, updateData);
    return this.getProjectById(id);
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectsRepository.delete(id);
  }
}
