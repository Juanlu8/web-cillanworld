import { ProductType } from "./product";

export interface CartItemType {
  product: ProductType; // El objeto del producto completo
  size: string;         // Talla seleccionada
  quantity: number;     // Cantidad (1-20)
  color: string;      // Color seleccionado 
}