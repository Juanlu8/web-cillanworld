# CheckoutTPV - Ejemplos de Uso

## Uso Básico en Página de Carrito

```tsx
// app/cart/page.tsx (o donde manejes el checkout)
'use client';

import { useState } from 'react';
import CheckoutTPV from '@/components/CheckoutTPV';
import { useCart } from '@/hooks/use-cart';

export default function CartPage() {
  const { items, getTotalPrice } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Cuando el usuario hace click en "Proceder al Pago"
  const handleCheckout = async () => {
    // 1. Crear orden en backend
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/orders`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: {
            products: items.map(item => ({
              id: item.id,
              quantity: item.quantity,
              name: item.name,
              size: item.size,
              color: item.color,
            })),
            totalAmount: getTotalPrice(),
            currency: 'EUR',
            status: 'pending',
          }
        })
      }
    );

    const data = await response.json();
    if (data.data?.id) {
      setOrderId(data.data.id);
      setShowCheckout(true);
    }
  };

  return (
    <div>
      <h1>Your Cart</h1>
      
      {items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          <div className="cart-items">
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <span>{item.name}</span>
                <span>€{item.price}</span>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <p>Total: €{getTotalPrice().toFixed(2)}</p>
          </div>

          {!showCheckout ? (
            <button 
              onClick={handleCheckout}
              className="btn-checkout"
            >
              Proceed to Payment
            </button>
          ) : (
            <CheckoutTPV 
              orderId={orderId}
              onClose={() => setShowCheckout(false)}
            />
          )}
        </>
      )}
    </div>
  );
}
```

---

## Uso en Modal/Dialog

```tsx
// Para usar dentro de un modal o drawer

import { Dialog, DialogContent } from '@/components/ui/dialog'; // o tu librería modal
import CheckoutTPV from '@/components/CheckoutTPV';

export function CheckoutModal({ isOpen, onClose, orderId }) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <CheckoutTPV 
          orderId={orderId}
          onClose={onClose}
        />
      </DialogContent>
    </Dialog>
  );
}
```

---

## Props disponibles

```typescript
interface CheckoutTPVProps {
  orderId?: number;        // ID de la orden creada en backend
  onClose?: () => void;    // Callback cuando usuario cancela
}
```

---

## Flujo Recomendado

```
1. Usuario visualiza carrito con items
   ↓
2. Click en "Pagar" → Crear orden en backend → Obtener orderId
   ↓
3. Mostrar componente CheckoutTPV con orderId
   ↓
4. Usuario ingresa datos (nombre, email, teléfono)
   ↓
5. Click "Pay Now" → Envía a /api/payment/create-transaction
   ↓
6. Redirección automática a TPV Redsys (window.location.href)
   ↓
7. Después del pago → Redirección a /checkout/success o /checkout/error
```

---

## Manejo de Errores

El componente maneja automáticamente:
- ✅ Validación de campos requeridos
- ✅ Errors del backend
- ✅ Estado de loading
- ✅ Deshabilitación de botones mientras procesa

Errores se muestran en un banner rojo dentro del componente.

---

## Integración con TypeScript

```typescript
// types/checkout.ts
export interface CheckoutData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  totalAmount: number;
}

export interface PaymentResponse {
  success: boolean;
  redirectURL: string;
  paramBase64: string;
  signature: string;
}
```

---

## Internacionalización (i18n)

El componente utiliza las siguientes keys de traducción. Asegúrate de que existan en tus archivos `locales`:

```json
// locales/es/common.json
{
  "checkout": {
    "title": "Compra Segura",
    "fullName": "Nombre Completo",
    "email": "Correo Electrónico",
    "phone": "Teléfono",
    "items": "Artículos",
    "payNow": "Pagar Ahora",
    "processing": "Procesando...",
    "securePayment": "Pago seguro procesado por Redsys",
    "validation": {
      "nameEmailRequired": "Nombre y email son requeridos",
      "cartEmpty": "El carrito está vacío"
    }
  },
  "common": {
    "cancel": "Cancelar"
  }
}

// locales/en/common.json
{
  "checkout": {
    "title": "Secure Checkout",
    "fullName": "Full Name",
    "email": "Email",
    "phone": "Phone",
    "items": "Items",
    "payNow": "Pay Now",
    "processing": "Processing...",
    "securePayment": "Secure payment processed by Redsys",
    "validation": {
      "nameEmailRequired": "Name and email are required",
      "cartEmpty": "Cart is empty"
    }
  },
  "common": {
    "cancel": "Cancel"
  }
}
```

---

## Debugging

Para ver parámetros de TPV en consola:

```typescript
// En CheckoutTPV.tsx - agregar en handleSubmit:
if (data.paramBase64) {
  const decoded = JSON.parse(
    Buffer.from(data.paramBase64, 'base64').toString()
  );
  console.log('TPV Params:', decoded);
  console.log('Signature:', data.signature);
}
```

---

## Nota Importante: SessionStorage

El componente guarda `checkout_orderId` y `checkout_totalAmount` en `sessionStorage` antes de redirigir a TPV:

```javascript
sessionStorage.setItem('checkout_orderId', String(orderId));
sessionStorage.setItem('checkout_totalAmount', String(totalAmount));
```

La página de `success` los utiliza para validar la orden. Se limpian automáticamente después de usos.

---

**Versión**: 1.0  
**Última actualización**: Marzo 2026
