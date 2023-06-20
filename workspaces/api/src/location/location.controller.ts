import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
  UploadedFile,
  ParseUUIDPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  Res,
} from '@nestjs/common';
import {
  ApiExtraModels,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
  getSchemaPath,
} from '@nestjs/swagger';
import { Response } from 'express';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationDto } from './dto/location.dto';
import { UploadDto } from '../persistence/dto/upload.dto';
import { ApiImageDownload } from '../persistence/decorators/api-image-download.decorator';
import { ApiUpload } from '../persistence/decorators/api-upload.decorator';
import { LocationService } from './location.service';

@Controller(['locations'])
@ApiTags('locations')
@ApiExtraModels(LocationDto)
export class LocationController {
  private static readonly MAX_FILE_SIZE = Math.pow(1024, 2);

  constructor(private readonly locationService: LocationService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new location',
  })
  create(@Body() createLocationDto: CreateLocationDto) {
    return this.locationService.create(createLocationDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all locations',
  })
  @ApiResponse({
    description: 'List of location objects',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(LocationDto),
      },
    },
  })
  findAll(): Promise<LocationDto[]> {
    return this.locationService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single location by its ID',
  })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  @ApiResponse({
    description: 'Marker object',
    schema: {
      $ref: getSchemaPath(LocationDto),
    },
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<LocationDto> {
    return await this.locationService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a location',
  })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkerDto: UpdateLocationDto,
  ): Promise<LocationDto> {
    return this.locationService.update(id, updateMarkerDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a location',
  })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  delete(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.locationService.delete(id);
  }

  @Get(':id/image')
  @ApiOperation({
    summary: 'Provides location image',
  })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  @ApiImageDownload()
  async getImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Res()
    response: Response,
  ): Promise<void> {
    const buffer = await this.locationService.getImage(id);
    response.type('png');
    response.end(buffer, 'binary');
  }

  @Post(':id/image/upload')
  @ApiOperation({
    summary:
      'Upload for a location image; Returns image ID; (This may change in the future)',
  })
  @ApiUpload('file', LocationController.MAX_FILE_SIZE)
  @ApiProduces('text/plain')
  @ApiParam({ name: 'id', description: 'Marker ID' })
  async uploadImage(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() uploadDto: UploadDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: LocationController.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: new RegExp('png|jpeg|jpg') }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    return this.locationService.uploadImage(id, file);
  }
}
