import {
  Body,
  Controller,
  Delete,
  FileTypeValidator,
  Get,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  ParseUUIDPipe,
  Post,
  Put,
  Res,
  UploadedFile,
} from '@nestjs/common';
import { ApiExtraModels, ApiOperation, ApiParam, ApiProduces, ApiResponse, ApiTags, getSchemaPath } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateMarkerDto } from './dto/create-marker.dto';
import { UpdateMarkerDto } from './dto/update-marker.dto';
import { MarkerDto } from './dto/marker.dto';
import { UploadDto } from '../persistence/dto/upload.dto';
import { ApiImageDownload } from '../persistence/decorators/api-image-download.decorator';
import { ApiUpload } from '../persistence/decorators/api-upload.decorator';
import { MarkerService } from './marker.service';

@Controller('locations/:locationId/markers')
@ApiTags('markers')
@ApiExtraModels(MarkerDto)
export class MarkerController {
  private static readonly MAX_FILE_SIZE = Math.pow(1024, 2);

  constructor(private readonly markerService: MarkerService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new marker',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  create(@Param('locationId', ParseUUIDPipe) locationId: string, @Body() createMarkerDto: CreateMarkerDto) {
    return this.markerService.create(locationId, createMarkerDto);
  }

  @Get()
  @ApiOperation({
    summary: 'List all markers',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiResponse({
    description: 'List of marker objects',
    schema: {
      type: 'array',
      items: {
        $ref: getSchemaPath(MarkerDto),
      },
    },
  })
  findAll(@Param('locationId', ParseUUIDPipe) locationId: string): Promise<MarkerDto[]> {
    return this.markerService.findAll(locationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a single marker by its ID',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  @ApiResponse({
    description: 'Marker object',
    schema: {
      $ref: getSchemaPath(MarkerDto),
    },
  })
  async findOne(@Param('locationId', ParseUUIDPipe) locationId: string, @Param('id', ParseUUIDPipe) id: string): Promise<MarkerDto> {
    return await this.markerService.findOne(locationId, id);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a marker',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  update(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMarkerDto: UpdateMarkerDto,
  ): Promise<MarkerDto> {
    return this.markerService.update(locationId, id, updateMarkerDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a marker',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  delete(@Param('locationId', ParseUUIDPipe) locationId: string, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.markerService.delete(locationId, id);
  }

  @Get(':id/image')
  @ApiOperation({
    summary: 'Provides marker image',
  })
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  @ApiImageDownload()
  async getImage(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Res()
    response: Response,
  ): Promise<void> {
    const buffer = await this.markerService.getImage(locationId, id);
    response.type('png');
    response.end(buffer, 'binary');
  }

  @Post(':id/image/upload')
  @ApiOperation({
    summary: 'Upload for a marker image; Returns image ID; (This may change in the future)',
  })
  @ApiUpload('file', MarkerController.MAX_FILE_SIZE)
  @ApiProduces('text/plain')
  @ApiParam({ name: 'locationId', description: 'Location ID' })
  @ApiParam({ name: 'id', description: 'Marker ID' })
  async uploadImage(
    @Param('locationId', ParseUUIDPipe) locationId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() uploadDto: UploadDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: true,
        validators: [
          new MaxFileSizeValidator({ maxSize: MarkerController.MAX_FILE_SIZE }),
          new FileTypeValidator({ fileType: new RegExp('png|jpeg|jpg') }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<string> {
    return this.markerService.uploadImage(locationId, id, file);
  }
}
