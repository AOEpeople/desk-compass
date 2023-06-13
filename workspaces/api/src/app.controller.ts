import {
  Body,
  Controller,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  Res,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { AppService } from './app.service';
import { SizeAwareUploadDto } from './persistence/dto/size-aware-upload.dto';
import { ApiUpload } from './persistence/decorators/api-upload.decorator';
import { ApiImageDownload } from './persistence/decorators/api-image-download.decorator';

@Controller()
@ApiTags('floorplan')
export class AppController {
  private static readonly MAX_FILE_SIZE = 5 * Math.pow(1024, 2); // 5 MB

  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({
    summary: 'Provides the floor plan image to display as map background',
  })
  @ApiImageDownload()
  async getFloorPlan(
    @Res()
    response: Response,
  ): Promise<void> {
    const imageContainer = await this.appService.getFloorPlan();
    response.type('png');
    response.end(imageContainer.image, 'binary');
  }

  @Post()
  @ApiOperation({
    summary:
      'Upload for floor plan image; Returns image ID; (This may change in the future)',
  })
  @ApiUpload('file', AppController.MAX_FILE_SIZE)
  @ApiProduces('text/plain')
  async uploadFloorPlan(
    @Body() uploadDto: SizeAwareUploadDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: AppController.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: new RegExp('png|jpeg|jpg') }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    return this.appService.uploadFloorPlan(
      file,
      uploadDto.width,
      uploadDto.height,
    );
  }

  @Get('info')
  @ApiOperation({
    summary: 'Provides target dimensions of floor plan image',
  })
  @ApiResponse({
    description:
      'Image dimensions for display, which do not necessarily match the actual image size',
    schema: {
      type: 'object',
      properties: { width: { type: 'number' }, height: { type: 'number' } },
    },
  })
  async getFloorPlanMetaData(): Promise<{ width: number; height: number }> {
    const imageContainer = await this.appService.getFloorPlan();
    return { width: imageContainer.width, height: imageContainer.height };
  }
}
