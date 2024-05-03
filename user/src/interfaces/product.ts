export interface IProduct {
  _id?: string;
  performerId?: string;
  imageId?: string;
  image?: any;
  type?: string;
  name?: string;
  description?: string;
  status?: string;
  price?: number;
  stock?: number;
  performer?: any;
  createdAt?: Date;
  updatedAt?: Date;
  quantity?: number;
  isBookMarked?: boolean;
}

export interface IProductCreate {
  name: string;
  description?: string;
  status: string;
  type: string;
  price: number;
  stock: number;
}

export interface IProductUpdate {
  _id: string;
  name?: string;
  price?: number;
  status?: string;
  description?: string;
  stock?: number;
  type?: string;
  image?: string;
}
