# TPV-Virtual Redsys Integration - Testing Guide

## 🎯 Current Status

✅ **Integration Complete** - All components are built and configured
- Backend: Payment controller with 3 endpoints ready
- Frontend: CartModal → CheckoutTPV component flow integrated
- Environment: Sandbox mode enabled with test credentials

## ⚡ Quick Start

### 1. Verify Services Running

**Frontend** (Next.js dev server):
```
✓ Running on: http://localhost:3000
Terminal ID: 9cca3bf0-fbe0-43cc-b9c5-09603eb21976
```

**Backend** (Strapi):
```bash
# If not already running:
cd backend-cillan-world
npm run develop
# Should be available on: http://localhost:1337
```

### 2. Test Payment Flow

1. **Open frontend**: http://localhost:3000

2. **Add product to cart**
   - Click on any product
   - Select size/color
   - Click "Agregar al carrito"

3. **Initiate checkout**
   - Click cart icon → see items
   - Click "FINALIZAR COMPRA" button
   - **Expected**: Order form appears with fields for name, email, phone

4. **Fill & submit form**
   - Name: "Test User"
   - Email: "test@example.com"
   - Phone: "666123456"
   - Click submit
   - **Expected**: Redirect to Redsys TPV payment page

### 3. Complete Test Payment

On Redsys test environment:

**Test Card Details**:
- Card: `4548812049400004`
- Expiry: Any future date (e.g., 12/26)
- CVC: `123`
- CVV2: `123`

**Expected behavior**:
1. Fill card fields on Redsys page
2. Click "Pagar" → redirects to success page
3. Success page shows:
   - Order ID
   - Status: "Paid"
   - Payment confirmation
   - "Volver al inicio" button
4. Cart should be empty

## 🔍 Validation Checklist

**Frontend**:
- [ ] Cart shows products correctly
- [ ] CheckoutTPV form appears (no old popup)
- [ ] Form validation works
- [ ] Form submits without errors

**Payment Gateway**:
- [ ] Form submission triggers spinner/loading state
- [ ] Redirect to Redsys URL happens
- [ ] Test card accepted

**Backend**:
- [ ] Order created in DB (check Strapi admin)
- [ ] Order status: `pending` → `paid` after payment
- [ ] Webhook receives TPV notification

**Post-Payment**:
- [ ] Success page displays correctly
- [ ] Order details visible (ID, amount, email)
- [ ] Cart cleared (removeAll() called)

## 🐛 Troubleshooting

### Issue: Old popup still shows
**Solution**: Hard refresh frontend (Ctrl+Shift+R)
- Import may be cached
- DevTools → Application → Clear Cache

### Issue: Form doesn't submit
**Check**:
1. Network tab in DevTools
2. POST to `http://localhost:1337/api/payment/create-transaction`
3. Look for 400/500 errors
4. Check browser console for errors

### Issue: Redirect to TPV doesn't happen
**Check**:
1. Response from create-transaction includes `redirectURL`
2. No JavaScript errors in console
3. Verify REDSYS_* variables in `.env`

### Issue: Success page shows "Error"
**Check**:
1. SessionStorage has `orderId` saved
2. GET `/api/payment/check-order/:orderId` responds
3. Backend webhook received notification

## 📊 Files Modified

### Backend
- `src/api/order/services/tpv.js` - Signature generation
- `src/api/order/controllers/payment.js` - Payment endpoints
- `src/api/order/routes/payment-routes.js` - Route definitions
- `src/api/order/content-types/order/schema.json` - Payment fields

### Frontend
- `components/CartModal.tsx` - CheckoutTPV integration
- `components/CheckoutTPV.tsx` - Payment form
- `app/success/page.tsx` - Payment result page
- `app/checkout/error/page.tsx` - Error handling
- `.env.local` - API endpoints

## 🔐 Sandbox Credentials

Located in `backend-cillan-world/.env`:

```
REDSYS_SANDBOX_MODE=true
REDSYS_MERCHANT_CODE=999008881
REDSYS_TERMINAL=1
REDSYS_SECRET_KEY=sqIU87NqNvSGdkqUGKBP2w0qwqQYQ80Z
```

**Note**: These are test credentials only. Replace with production credentials before going live.

## 📱 API Endpoints (now available)

### Create Transaction
```
POST /api/payment/create-transaction
Body: {
  orderId: number,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  totalAmount: number
}
Response: { redirectURL: "https://..." }
```

### Check Order Status
```
GET /api/payment/check-order/:orderId
Response: { 
  id: number,
  status: "pending|paid|failed|processing",
  tpvTransactionId?: string,
  tpvAuthCode?: string
}
```

### Webhook Notification
```
POST /api/payment/notification
(Redsys calls this after payment)
```

## ✅ Next Steps After Testing

1. **Production Credentials**: Request from your bank
2. **Update .env**:
   - `REDSYS_SANDBOX_MODE=false`
   - `REDSYS_MERCHANT_CODE=` (real code)
   - `REDSYS_SECRET_KEY=` (real key)
   - `REDSYS_MERCHANT_URL_OK/KO=` (production domain)
3. **DNS/SSL**: Configure for production domain
4. **Final QA**: Complete payment flow with real card

## 📞 Support

If you encounter issues:
1. Check DevTools Network tab
2. Review backend logs
3. Verify environment variables
4. Check database for order creation

Good luck! 🚀
