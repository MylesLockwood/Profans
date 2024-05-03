export interface IProduct {
  _id: string;
  name: string;
  description: string;
  status: string;
  type: string;
  performerId: string;
  price: number;
  stock: number;
}

export interface IProductCreate {
  name: string;
  description: string;
  status: string;
  type: string;
  performerId: string;
  price: number;
  stock: number;
}

export interface IProductUpdate {
  _id: string;
  performerId: string;
  name?: string;
  price?: number;
  status?: string;
  description?: string;
  stock?: number;
  type: string;
  image?: string;
  performer?: { username: string };
}
