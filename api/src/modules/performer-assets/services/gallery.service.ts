import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { Model } from 'mongoose';
import {
  EntityNotFoundException,
  PageableData
} from 'src/kernel';
import { PerformerService } from 'src/modules/performer/services';
import { ReactionService } from 'src/modules/reaction/services/reaction.service';
import { UserDto } from 'src/modules/user/dtos';
import { ObjectId } from 'mongodb';
import { merge } from 'lodash';
import { FileService } from 'src/modules/file/services';
import { REACTION, REACTION_TYPE } from 'src/modules/reaction/constants';
import { GalleryUpdatePayload } from '../payloads/gallery-update.payload';
import { GalleryDto } from '../dtos';
import { GalleryCreatePayload, GallerySearchRequest } from '../payloads';
import { GalleryModel, PhotoModel } from '../models';
import {
  PERFORMER_GALLERY_MODEL_PROVIDER,
  PERFORMER_PHOTO_MODEL_PROVIDER
} from '../providers';
import { PhotoService } from './photo.service';

@Injectable()
export class GalleryService {
  constructor(
    @Inject(forwardRef(() => PerformerService))
    private readonly performerService: PerformerService,
    @Inject(forwardRef(() => ReactionService))
    private readonly reactionService: ReactionService,
    @Inject(PERFORMER_GALLERY_MODEL_PROVIDER)
    private readonly galleryModel: Model<GalleryModel>,
    // Circular dependency, cannot query
    @Inject(PERFORMER_PHOTO_MODEL_PROVIDER)
    private readonly photoModel: Model<PhotoModel>,
    private readonly fileService: FileService,
    @Inject(forwardRef(() => PhotoService))
    private readonly photoService: PhotoService
  ) {}

  public async create(
    payload: GalleryCreatePayload,
    creator?: UserDto
  ): Promise<GalleryDto> {
    if (payload.performerId) {
      const performer = await this.performerService.findById(
        payload.performerId
      );
      if (!performer) {
        throw new EntityNotFoundException('Performer not found!');
      }
    }

    // eslint-disable-next-line new-cap
    const model = new this.galleryModel(payload);
    model.createdAt = new Date();
    model.updatedAt = new Date();
    if (creator) {
      if (!model.performerId) {
        model.performerId = creator._id;
      }
      model.createdBy = creator._id;
      model.updatedBy = creator._id;
    }

    await model.save();
    return GalleryDto.fromModel(model);
  }

  public async update(
    id: string | ObjectId,
    payload: GalleryUpdatePayload,
    creator?: UserDto
  ): Promise<GalleryDto> {
    const gallery = await this.galleryModel.findById(id);
    if (!gallery) {
      throw new EntityNotFoundException('Gallery not found!');
    }

    merge(gallery, payload);
    gallery.updatedAt = new Date();
    if (creator) {
      gallery.updatedBy = creator._id;
    }

    await gallery.save();
    return GalleryDto.fromModel(gallery);
  }

  public async findByIds(ids: string[] | ObjectId[]): Promise<GalleryDto[]> {
    const galleries = await this.galleryModel.find({
      _id: {
        $in: ids
      }
    });

    return galleries.map((g) => new GalleryDto(g));
  }

  public async findById(id: string | ObjectId): Promise<GalleryDto> {
    const gallery = await this.galleryModel.findOne({ _id: id });
    if (!gallery) {
      throw new EntityNotFoundException();
    }
    return new GalleryDto(gallery);
  }

  public async details(id: string | ObjectId, user: UserDto) {
    const gallery = await this.galleryModel.findOne({ _id: id });
    if (!gallery) {
      throw new EntityNotFoundException();
    }

    const dto = new GalleryDto(gallery);
    if (gallery.performerId) {
      const performer = await this.performerService.findById(
        gallery.performerId
      );
      if (performer) {
        dto.performer = {
          username: performer.username
        };
      }
    }
    const bookmark = await this.reactionService.checkExisting(dto._id, user._id, REACTION.BOOK_MARK, REACTION_TYPE.GALLERY);
    dto.isBookMarked = !!bookmark;
    return dto;
  }

  public async adminSearch(
    req: GallerySearchRequest
  ): Promise<PageableData<GalleryDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    if (req.status) query.status = req.status;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.galleryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.galleryModel.countDocuments(query)
    ]);

    const performerIds = data.map((d) => d.performerId);
    const galleries = data.map((g) => new GalleryDto(g));
    const coverPhotoIds = data.map((d) => d.coverPhotoId);

    const [performers, coverPhotos] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      coverPhotoIds.length
        ? this.photoModel
          .find({ _id: { $in: coverPhotoIds } })
          .lean()
          .exec()
        : []
    ]);
    const fileIds = coverPhotos.map((c) => c.fileId);
    const files = await this.fileService.findByIds(fileIds);

    galleries.forEach((g) => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find(
        (p) => p._id.toString() === g.performerId.toString()
      );
      if (performer) {
        // eslint-disable-next-line no-param-reassign
        g.performer = {
          username: performer.username
        };
      }
      if (g.coverPhotoId) {
        const coverPhoto = coverPhotos.find(
          (c) => c._id.toString() === g.coverPhotoId.toString()
        );
        if (coverPhoto) {
          const file = files.find(
            (f) => f._id.toString() === coverPhoto.fileId.toString()
          );
          if (file) {
            // eslint-disable-next-line no-param-reassign
            g.coverPhoto = {
              url: file.getUrl(),
              thumbnails: file.getThumbnails()
            };
          }
        }
      }
    });

    return {
      data: galleries,
      total
    };
  }

  public async performerSearch(
    req: GallerySearchRequest,
    user: UserDto
  ): Promise<PageableData<GalleryDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    query.performerId = user._id;
    if (req.status) query.status = req.status;
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.galleryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.galleryModel.countDocuments(query)
    ]);

    const performerIds = data.map((d) => d.performerId);
    const galleries = data.map((g) => new GalleryDto(g));
    const coverPhotoIds = data.map((d) => d.coverPhotoId);

    const [performers, coverPhotos] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      coverPhotoIds.length
        ? this.photoModel
          .find({ _id: { $in: coverPhotoIds } })
          .lean()
          .exec()
        : []
    ]);
    const fileIds = coverPhotos.map((c) => c.fileId);
    const files = await this.fileService.findByIds(fileIds);

    galleries.forEach((g) => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find(
        (p) => p._id.toString() === g.performerId.toString()
      );
      if (performer) {
        // eslint-disable-next-line no-param-reassign
        g.performer = {
          username: performer.username
        };
      }
      if (g.coverPhotoId) {
        const coverPhoto = coverPhotos.find(
          (c) => c._id.toString() === g.coverPhotoId.toString()
        );
        if (coverPhoto) {
          const file = files.find(
            (f) => f._id.toString() === coverPhoto.fileId.toString()
          );
          if (file) {
            // eslint-disable-next-line no-param-reassign
            g.coverPhoto = {
              url: file.getUrl(),
              thumbnails: file.getThumbnails()
            };
          }
        }
      }
    });

    return {
      data: galleries,
      total
    };
  }

  public async userSearch(
    req: GallerySearchRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    user?: UserDto
  ): Promise<PageableData<GalleryDto>> {
    const query = {} as any;
    if (req.q) query.name = { $regex: req.q };
    if (req.performerId) query.performerId = req.performerId;
    query.status = 'active';
    let sort = {};
    if (req.sort && req.sortBy) {
      sort = {
        [req.sortBy]: req.sort
      };
    }
    const [data, total] = await Promise.all([
      this.galleryModel
        .find(query)
        .lean()
        .sort(sort)
        .limit(req.limit ? parseInt(req.limit as string, 10) : 10)
        .skip(parseInt(req.offset as string, 10)),
      this.galleryModel.countDocuments(query)
    ]);

    const performerIds = data.map((d) => d.performerId);
    const galleries = data.map((g) => new GalleryDto(g));
    const coverPhotoIds = data.map((d) => d.coverPhotoId);
    const galleryIds = data.map((d) => d._id);

    const [performers, coverPhotos, bookmarks] = await Promise.all([
      performerIds.length ? this.performerService.findByIds(performerIds) : [],
      coverPhotoIds.length
        ? this.photoModel
          .find({ _id: { $in: coverPhotoIds } })
          .lean()
          .exec()
        : [],
      user && user._id ? this.reactionService.findByQuery({
        objectType: REACTION_TYPE.GALLERY, objectId: { $in: galleryIds }, createdBy: user._id
      }) : []
    ]);
    const fileIds = coverPhotos.map((c) => c.fileId);
    const files = await this.fileService.findByIds(fileIds);

    galleries.forEach((g) => {
      // TODO - should get picture (thumbnail if have?)
      const performer = performers.find(
        (p) => p._id.toString() === g.performerId.toString()
      );
      if (performer) {
        // eslint-disable-next-line no-param-reassign
        g.performer = {
          username: performer.username
        };
      }
      if (g.coverPhotoId) {
        const coverPhoto = coverPhotos.find(
          (c) => c._id.toString() === g.coverPhotoId.toString()
        );
        if (coverPhoto) {
          const file = files.find(
            (f) => f._id.toString() === coverPhoto.fileId.toString()
          );
          if (file) {
            // eslint-disable-next-line no-param-reassign
            g.coverPhoto = {
              url: file.getUrl(),
              thumbnails: file.getThumbnails()
            };
          }
        }
      }
      if (!user || !user._id) {
        // eslint-disable-next-line no-param-reassign
        g.isBookMarked = false;
      } else {
        const bookmarked = bookmarks.find((l) => l.objectId.toString() === g._id.toString() && l.action === REACTION.BOOK_MARK);
        // eslint-disable-next-line no-param-reassign
        g.isBookMarked = !!bookmarked;
      }
    });

    return {
      data: galleries,
      total
    };
  }

  public async updateCover(
    galleryId: string | ObjectId,
    photoId: ObjectId
  ): Promise<boolean> {
    await this.galleryModel.updateOne(
      { _id: galleryId },
      {
        coverPhotoId: photoId
      }
    );
    return true;
  }

  public async delete(id: string | ObjectId) {
    const gallery = await this.galleryModel.findById(id);
    if (!gallery) {
      throw new EntityNotFoundException();
    }
    await gallery.remove();
    await this.photoService.deleteByGallery(gallery._id);
    return true;
  }
}
