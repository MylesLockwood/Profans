export interface IBanner {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  position?: string;
  photo?: { url: string; thumbnails: string[] };
}

export interface IBannerSearch {
  position?: string;
  status?: string;
}
