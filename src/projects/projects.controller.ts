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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Project } from './project.entity';

@Controller('projects')
@UseGuards(JwtAuthGuard) // Protect all routes
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, file.originalname + '-' + uniqueSuffix + '.zip');
        },
      }),
    }),
  )
  async uploadProject(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
    @Body() body,
  ) {
    const { name, collaborators } = body;
    const user = req.user;
    const storagePath = file.path;

    return this.projectsService.createProject(
      name,
      storagePath,
      collaborators ? JSON.parse(collaborators) : null,
      user,
    );
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
