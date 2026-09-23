/** Bentuk data yang dikirim backend Hadish Cake. */

export type Role = "ADMIN" | "CUSTOMER";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "READY"
  | "COMPLETED"
  | "CANCELLED";

export type User = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
};

/** Balasan dari POST /auth/login dan POST /auth/register. */
export type AuthResponse = {
  user: User;
  accessToken: string;
  tokenType: "Bearer";
};

export type Category = {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  tone: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
  tone: string;
  bestSeller: boolean;
  isAvailable: boolean;
  categoryId: string;
  category: Category;
};

export type OrderItem = {
  id: string;
  productId: string;
  quantity: number;
  /** Harga saat order dibuat — bukan harga menu saat ini. */
  unitPrice: number;
  subtotal: number;
  product: Pick<Product, "id" | "name" | "emoji" | "tone" | "price">;
};

export type Order = {
  id: string;
  orderNumber: string;
  userId: string;
  user: Pick<User, "id" | "name" | "email" | "phone">;
  pickupDate: string;
  status: OrderStatus;
  totalPrice: number;
  notes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
};

/** Bentuk response berpaginasi, dipakai /products dan /orders. */
export type Paginated<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

/** Bentuk body error yang seragam dari AllExceptionsFilter di backend. */
export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string | string[];
  path: string;
  timestamp: string;
};
