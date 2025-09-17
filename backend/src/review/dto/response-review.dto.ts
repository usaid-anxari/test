import { ApiProperty } from '@nestjs/swagger';

export class MediaDto {
  @ApiProperty({ example: 'video' })
  type: string;

  @ApiProperty({ example: 'businesses/123/reviews/456/video-file.mp4' })
  s3Key: string;
}

export class ReviewResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'video', enum: ['text', 'audio', 'video'] })
  type: string;

  @ApiProperty({ example: 'Great service!' })
  title: string;

  @ApiProperty({ example: 'I had a very good experience.' })
  bodyText: string;

  @ApiProperty({ example: 5 })
  rating: number;

  @ApiProperty({ example: 'John Doe' })
  reviewerName: string;

  @ApiProperty({ type: [MediaDto] })
  media: MediaDto[];

  @ApiProperty({ example: '2025-09-15T18:23:00Z' })
  publishedAt: Date;
}
