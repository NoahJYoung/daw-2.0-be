import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Project } from './project.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('create')
  async createProject(@Body('name') name: string, @Request() req) {
    const user = req.user;

    const { project, uploadUrl } = await this.projectsService.createProject(
      name,
      user,
    );

    return { project, uploadUrl };
  }

  @Get()
  async getUserProjects(@Request() req) {
    const userId = req.user.id;
    return this.projectsService.getUserProjects(userId);
  }

  @Get(':id')
  async getProjectById(@Param('id') id: string) {
    return this.projectsService.getProjectById(id);
  }

  @Put(':id')
  async updateProject(@Param('id') id: string, @Body() body: Partial<Project>) {
    return this.projectsService.updateProject(id, body);
  }

  @Delete(':id')
  async deleteProject(@Param('id') id: string) {
    await this.projectsService.deleteProject(id);
    return { message: 'Project deleted successfully' };
  }
}
