# Integración TPV-Virtual Redsys - Guía de Uso

## 📋 Resumen de la Integración

Se ha implementado la integración completa de la **pasarela de pagos TPV-Virtual de Redsys** en el proyecto Cillan-World siguiendo la guía oficial v2.2 (RS.TE.CEL.MAN.0036).

**Modelo implementado**: **Redirección estándar** (sin requerimientos PCI-DSS, seguro y rápido de implementar)

---

## 🏗️ Estructura de la Implementación

### Backend (Strapi - `/backend-cillan-world`)

#### 1. **Servicio TPV** (`src/api/order/services/tpv.js`)
Contiene toda la lógica criptográfica:
- `generateSignature()` - Genera firma SHA256+Base64 para redirección
- `validateSignature()` - Valida firma de respuesta del TPV
- `decodeParams()` - Decodifica parámetros Base64
- `buildTransactionParams()` - Construye parámetros de transacción
- `buildRedirectURL()` - Crea URL de redirección a TPV

#### 2. **Controller de Pagos** (`src/api/order/controllers/payment.js`)
Expone 3 endpoints principales:
- `POST /api/payment/create-transaction` - Inicia pago
- `POST /api/payment/notification` - Webhook asíncrono del TPV
- `GET /api/payment/check-order/:orderId` - Consulta estado

#### 3. **Rutas** (`src/api/order/routes/payment-routes.js`)
Define rutas públicas sin autenticación para TPV

#### 4. **Schema Order actualizado** (`src/api/order/content-types/order/schema.json`)
Nuevos campos:
- `paymentMethod`: enum [card, wallet, bizum, transfer]
- `tpvTransactionId`: ID de transacción en TPV
- `tpvAuthCode`: Código de autorización TPV

### Frontend (Next.js - `/frontend-cillan-world`)

#### 1. **Componente CheckoutTPV** (`components/CheckoutTPV.tsx`)
Formulario de checkout con:
- Captura de datos cliente (nombre, email, teléfono)
- Validación local
- Envío a `/api/payment/create-transaction`
- Redirección automática a TPV

#### 2. **Página de Success mejorada** (`app/success/page.tsx`)
- Valida estado de orden via `/api/payment/check-order/:orderId`
- Muestra estados: success/processing/failed/error
- Limpia carrito si pago exitoso
- Información de transacción

#### 3. **Página de Error** (`app/checkout/error/page.tsx`)
Página para cuando cliente cancela o error

#### 4. **Variables de entorno** (`.env.local`)
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:1337
STRAPI_URL=http://localhost:1337
NEXT_PUBLIC_REDSYS_SANDBOX_MODE=true
```

---

## ⚙️ Configuración Requerida

### Backend `.env`

```env
# TPV-Virtual Redsys
REDSYS_MERCHANT_CODE=999008881      # Tu código de comercio (del banco)
REDSYS_TERMINAL=1                   # Terminal (del banco)
REDSYS_MERCHANT_NAME=Cillan World  # Nombre mostrado en TPV
REDSYS_SECRET_KEY=sqIU87NqNvSGdkqUGKBP2w0qwqQYQ80Z  # Clave secreta (del banco)
REDSYS_MERCHANT_URL_OK=http://localhost:3000/checkout/success
REDSYS_MERCHANT_URL_KO=http://localhost:3000/checkout/error
REDSYS_METHOD=T                     # Tarjeta
REDSYS_SANDBOX_MODE=true            # Cambiar a false en producción
```

**⚠️ Variables a solicitar al banco:**
- REDSYS_MERCHANT_CODE
- REDSYS_TERMINAL  
- REDSYS_SECRET_KEY

---

## 🔄 Flujo de Pago

```
1. Usuario selecciona productos y va a checkout
   ↓
2. CheckoutTPV component (frontend) captura datos
   ↓
3. POST /api/payment/create-transaction (backend)
   ├─ Valida datos
   ├─ Genera firma SHA256
   ├─ Crea parámetros transacción
   └─ Retorna URL de redirección
   ↓
4. Cliente redirigido a TPV Redsys (pasarela segura)
   │
   ├─ [Si pago OK] → URL_OK con parámetros
   └─ [Si pago KO] → URL_KO
   ↓
5. Cliente redirigido a /checkout/success o /checkout/error
   ├─ Página valida estado via GET /api/payment/check-order/:orderId
   ├─ Muestra confirmación o error
   └─ Limpia carrito si pagado
   ↓
6. Paralelamente: POST /api/payment/notification (webhook asíncrono)
   ├─ Recibido desde TPV (reintentos garantizados)
   ├─ Valida firma
   ├─ Actualiza estado order a "paid" o "failed"
   └─ Registra detalles TPV en metadata
```

---

## 🧪 Testing en Sandbox

### Tarjetas de Prueba (Redsys Sandbox)

Las credenciales actualmente configuradas en `.env` corresponden a **cuentas de prueba de Redsys**.

**Para probar transacciones:**

1. Iniciar proyecto:
   ```bash
   # Terminal 1 - Backend
   cd backend-cillan-world
   npm run develop
   
   # Terminal 2 - Frontend
   cd frontend-cillan-world
   npm run dev
   ```

2. Ir a http://localhost:3000/, agregar productos al carrito

3. Hacer click en "Pagar" y diligenciar formulario

4. En la pasarela Redsys sandbox, usar:
   - **Número de tarjeta**: 4548812049400004 (Visa test)
   - **Fecha**: 12/25
   - **CVV**: 123
   - **3D Secure**: Completar con cualquier código (en tests Redsys no hay restricción)

5. Confirmar pago → Ver "Payment Successful" 

### Monitoreo

- **Órdenes**: Strapi admin panel (`http://localhost:1337/admin`)
- **Logs del server**: Ver terminal del backend para logs TPV
- **Firmas**: Revisar parámetros en logs de `/api/payment/notification`

---

## 🔐 Seguridad - Firma SHA256

La seguridad se basa en validación de firmas con algoritmo **HMAC_SHA256_V1**:

```
FIRMA = Base64(SHA256(Base64(params) + secretKey))
```

**Validación en backend:**
```javascript
const tpvService = strapi.service('api::order.tpv');
const isValid = tpvService.validateSignature(paramBase64, signature);
```

**Nota**: Nunca envíar `REDSYS_SECRET_KEY` al frontend. Solo el backend debe validar firmas.

---

## 📊 Estados de Orden

```
pending    → Orden creada, espera inicio de pago
processing → Pago en trámite/confirmación desde TPV
paid       → Pago exitoso, confirmado por TPV
failed     → Pago rechazado o cliente canceló
refunded   → Devolución procesada (manual vía admin)
```

---

## 🚀 Deployment a Producción

### Cambios necesarios:

1. **Backend `.env`:**
   ```env
   REDSYS_SANDBOX_MODE=false
   REDSYS_MERCHANT_URL_OK=https://tudominio.com/checkout/success
   REDSYS_MERCHANT_URL_KO=https://tudominio.com/checkout/error
   PUBLIC_URL=https://api.tudominio.com  # Para webhooks
   ```

2. **Frontend `.env.local`:**
   ```env
   NEXT_PUBLIC_BACKEND_URL=https://api.tudominio.com
   NEXT_PUBLIC_REDSYS_SANDBOX_MODE=false
   ```

3. **Activar con el banco:**
   - Contactar Redsys
   - Proporcionar REDSYS_SECRET_KEY
   - Activar modo producción
   - Realizar transacciones test finales

---

## 🆘 Troubleshooting

### "Invalid signature" en webhook
- Verificar `REDSYS_SECRET_KEY` correcta
- Verificar que secret no cambió entre test y prod

### Orden no actualiza a "paid"
- Revisar logs de `/api/payment/notification`
- Verificar que response code del TPV es '0000' (OK)
- Confirmar que webhook está alcanzable (URL pública)

### Cliente redirigido a error sin motivo
- Revisar que URL_OK/URL_KO sean accesibles
- Revisar CORS del backend (`CORS_ORIGINS` en .env)
- Comprobar `NEXT_PUBLIC_BACKEND_URL` en frontend

### Carrito no se limpia
- Verificar que localStorage/sessionStorage funciona
- Revisar logs de error en browser console
- Validar que pago fue exitoso (status === "paid")

---

## 📚 Archivos Generados

```
backend-cillan-world/
├── src/api/order/
│   ├── controllers/payment.js (NUEVO)
│   ├── routes/payment-routes.js (NUEVO)
│   ├── services/tpv.js (NUEVO)
│   └── content-types/order/schema.json (ACTUALIZADO)
└── .env (ACTUALIZADO)

frontend-cillan-world/
├── app/
│   ├── success/page.tsx (REEMPLAZADO)
│   └── checkout/
│       └── error/page.tsx (NUEVO)
├── components/CheckoutTPV.tsx (NUEVO)
└── .env.local (NUEVO)
```

---

## 🔗 Referencias

- **Guía oficial TPV**: `9999_TPV-Virtual Guía SIS V2.2.pdf` (en raíz del proyecto)
- **Redsys**: https://www.redsys.es/
- **PCI-DSS**: Cumplimiento de estándares de seguridad de tarjeta
- **3D Secure**: Autenticación adicional (transparente para usuario)
- **PSD2**: Directiva europea (SCA - Strong Customer Authentication requerida)

---

## ✅ Checklist Después de Implementación

- [ ] Backend corriendo sin errores (`npm run develop`)
- [ ] Frontend corriendo sin errores (`npm run dev`)
- [ ] Transacción test completada exitosamente
- [ ] Orden visible en admin Strapi con estado "paid"
- [ ] Carrito limpiado después de pago
- [ ] Webhook notification procesado correctamente
- [ ] Emails de confirmación enviados (si RESEND_API_KEY configurado)
- [ ] URLs correctas en archivo `.env`

---

**Última actualización**: Marzo 2026  
**Versión**: 1.0 (TPV Redsys v2.2 Integration)
