import { Test, TestingModule } from '@nestjs/testing';
import { ProjectsService } from './projects.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Project } from './project.entity';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';

describe('ProjectsService', () => {
  let service: ProjectsService;
  let repo: Repository<Project>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProjectsService,
        {
          provide: getRepositoryToken(Project),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    repo = module.get<Repository<Project>>(getRepositoryToken(Project));
  });

  it('should create a project', async () => {
    const mockUser: User = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      authProvider: 'LOCAL',
      createdAt: new Date(),
      updatedAt: new Date(),
      projects: [],
      password: 'hashedpassword',
      validatePassword: jest.fn(),
    };

    const mockProject = {
      name: 'Test Project',
      storagePath: '/test.zip',
      owner: mockUser,
    } as Project;

    jest.spyOn(repo, 'save').mockResolvedValue(mockProject);

    expect(
      await service.createProject('Test Project', '/test.zip', null, mockUser),
    ).toEqual(mockProject);
  });
});
