export interface IVideo {
  _id: string;
  title: string;
  performerId: string;
  price: number;
  status: string;
  description: string;
  tagline: string;
}

export interface IVideoCreate {
  tags: string[];
  title: string;
  performerId: string;
  price: number;
  status: string;
  description: string;
  isSaleVideo: boolean;
  isSchedule: boolean;
  scheduledAt: any;
  tagline: string;
  participantIds: string[];
}

export interface IVideoUpdate {
  _id: string;
  performerId: string;
  title?: string;
  price?: number;
  status?: string;
  description?: string;
  thumbnail?: string;
  teaser?: string;
  isSaleVideo: boolean;
  participantIds: string[];
  video?: { url: string; thumbnails: string[] };
  performer?: { username: string };
  isSchedule: boolean;
  tags: string[];
  scheduledAt: any;
  tagline?: string;
}
