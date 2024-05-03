import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import { PageableData } from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { FileService } from 'src/modules/file/services';
import { UserDto } from 'src/modules/user/dtos';
import { PERFORMER_PHOTO_MODEL_PROVIDER } from '../providers';
import { PhotoModel } from '../models';
import { PhotoDto } from '../dtos';
import { PhotoSearchRequest } from '../payloads';
import { GalleryService } from './gallery.service';

@Injectable()
export class PhotoSearchService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    private readonly galleryService: GalleryService,
    private readonly fileService: FileService
  ) { }

  public async adminSearch(req: PhotoSearchRequest, jwToken: string): Promise<PageableData<PhotoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.galleryId) query.galleryId = req.galleryId;
    if (req.status) query.status = req.status;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.photoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.photoModel.countDocuments(query)
    ]);

    const performerIds = data.map((d) => d.performerId);
    const galleryIds = data.map((d) => d.galleryId);
    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));
    const [performers, galleries, files] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      galleryIds.length ? this.galleryService.findByIds(galleryIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);
    photos.forEach((v) => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find((p) => p._id.toString() === v.performerId.toString());
      if (performer) {
        // eslint-disable-next-line no-param-reassign
        v.performer = {
          username: performer.username
        };
      }

      if (v.galleryId) {
        const gallery = galleries.find((p) => p._id.toString() === v.galleryId.toString());
        // eslint-disable-next-line no-param-reassign
        if (gallery) v.gallery = gallery;
      }

      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        const url = file.getUrl();
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url: jwToken ? `${url}?photoId=${v._id}&token=${jwToken}` : url || null,
          width: file.width,
          height: file.height,
          mimeType: file.mimeType
        };
      }
    });

    return {
      data: photos,
      total
    };
  }

  public async performerSearch(req: PhotoSearchRequest, user: UserDto, jwToken: string): Promise<PageableData<PhotoDto>> {
    const query = {} as any;
    if (req.q) query.title = { $regex: req.q };
    query.performerId = user._id;
    if (req.galleryId) query.galleryId = req.galleryId;
    if (req.status) query.status = req.status;
    const [data, total] = await Promise.all([
      this.photoModel
        .find(query)
        .lean()
        .sort('-createdAt')
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.photoModel.countDocuments(query)
    ]);

    const performerIds = data.map((d) => d.performerId);
    const galleryIds = data.map((d) => d.galleryId);
    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));
    const [performers, galleries, files] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      galleryIds.length ? this.galleryService.findByIds(galleryIds) : [],
      fileIds.length ? this.fileService.findByIds(fileIds) : []
    ]);
    photos.forEach((v) => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find((p) => p._id.toString() === v.performerId.toString());
      if (performer) {
        // eslint-disable-next-line no-param-reassign
        v.performer = {
          username: performer.username
        };
      }

      if (v.galleryId) {
        const gallery = galleries.find((p) => p._id.toString() === v.galleryId.toString());
        // eslint-disable-next-line no-param-reassign
        if (gallery) v.gallery = gallery;
      }

      const file = files.find((f) => f._id.toString() === v.fileId.toString());
      if (file) {
        const url = file.getUrl();
        // eslint-disable-next-line no-param-reassign
        v.photo = {
          thumbnails: file.getThumbnails(),
          url: jwToken ? `${url}?photoId=${v._id}&token=${jwToken}` : url || null,
          width: file.width,
          height: file.height,
          mimeType: file.mimeType
        };
      }
    });

    return {
      data: photos,
      total
    };
  }

  public async getModelPhotosWithGalleryCheck(req: PhotoSearchRequest, user: UserDto, jwToken: string) {
    const query = {
      performerId: req.performerId,
      status: 'active',
      processing: false
      // isGalleryCover: false,
    } as any;
    if (req.galleryId) query.galleryId = req.galleryId;
    const sort = { createdAt: -1 };
    // // if gallery photo, do not response gallery item
    // query.$or = [
    //   {
    //     isGalleryCover: true
    //   },
    //   {
    //     isGalleryCover: false,
    //     galleryId: null
    //   }
    // ];
    const [data, total] = await Promise.all([
      this.photoModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.photoModel.countDocuments(query)
    ]);

    const fileIds = data.map((d) => d.fileId);
    const photos = data.map((v) => new PhotoDto(v));

    // check subscribe
    const check = await this.performerService.checkSubscribed(query.performerId, user);
    if (check.subscribed) {
      const galleryIds = data.filter((d) => d.galleryId).map((p) => p.galleryId);
      const [galleries, files] = await Promise.all([
        galleryIds.length ? this.galleryService.findByIds(galleryIds) : [],
        fileIds.length ? this.fileService.findByIds(fileIds) : []
      ]);
      photos.forEach((v) => {
        if (v.galleryId) {
          const gallery = galleries.find(
            (p) => p._id.toString() === v.galleryId.toString()
          );
          // eslint-disable-next-line no-param-reassign
          if (gallery) v.gallery = gallery;
        }

        const file = files.find((f) => f._id.toString() === v.fileId.toString());
        if (file) {
          const url = file.getUrl();
          // eslint-disable-next-line no-param-reassign
          v.photo = {
            thumbnails: file.getThumbnails(),
            url: jwToken ? `${url}?photoId=${v._id}&token=${jwToken}` : url || null,
            width: file.width,
            height: file.height,
            mimeType: file.mimeType
          };
        }
      });
    }

    return {
      data: photos,
      total
    };
  }
}
