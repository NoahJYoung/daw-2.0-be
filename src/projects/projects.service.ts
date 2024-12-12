import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from './project.entity';
import { User } from '../users/user.entity';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private projectsRepository: Repository<Project>,
    private readonly storageService: StorageService,
  ) {}

  async createProject(
    name: string,
    owner: User,
    collaborators?: string[] | null,
  ): Promise<{ project: Project; uploadUrl: string }> {
    const project = this.projectsRepository.create({
      name,
      owner,
      collaborators,
    });
    const savedProject = await this.projectsRepository.save(project);

    const storagePath = `${owner.id}/${savedProject.id}.zip`;

    savedProject.storagePath = storagePath;
    await this.projectsRepository.save(savedProject);

    const uploadUrl = await this.storageService.generateUploadPresignedUrl(
      owner.id,
      savedProject.id,
    );

    return { project: savedProject, uploadUrl };
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
