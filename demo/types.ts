/**
 * @file demo/types.ts
 * Shared demo types.
 */

export type User = {
  name: string;
  email: string;
  age: number;
};

export type CartItem = { id: number; name: string; price: number };

export type Cart = {
  items: CartItem[];
  total: number;
};
