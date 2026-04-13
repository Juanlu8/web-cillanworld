'use client';

import { useState, FormEvent, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/use-cart';
import { getShippingQuote, SHIPPING_COUNTRY_OPTIONS } from '@/lib/shipping-rates';

export interface CheckoutTPVProps {
  orderId?: number;
  totalAmount?: number;
  onClose?: () => void;
}

/**
 * Componente de Checkout integrado con TPV-Virtual Redsys
 * Maneja la redirección a la pasarela de pagos
 */
export default function CheckoutTPV({ orderId, totalAmount = 0, onClose }: CheckoutTPVProps) {
  const { t } = useTranslation('common');
  const { items } = useCart();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular total si no fue pasado como prop
  const subtotal = totalAmount || items.reduce((sum, item) => {
    const price = item.product?.attributes?.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  // Datos del formulario
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    province: '',
    postalCode: '',
    country: '',
  });

  const shippingQuote = useMemo(() => {
    if (!formData.country) {
      return null;
    }

    return getShippingQuote({
      country: formData.country,
      province: formData.province,
      city: formData.city,
      postalCode: formData.postalCode,
    });
  }, [formData.country, formData.province, formData.city, formData.postalCode]);

  const shippingAmount = shippingQuote?.amount || 0;
  const payableTotal = subtotal + shippingAmount;
  const selectedCountryLabel = SHIPPING_COUNTRY_OPTIONS.find((country) => country.value === formData.country)?.label;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!formData.customerName || !formData.customerEmail) {
        throw new Error(t('checkout.validation.nameEmailRequired') || 'Name and email are required');
      }

      if (!formData.addressLine1 || !formData.city || !formData.province || !formData.postalCode || !formData.country) {
        throw new Error(t('checkout.validation.addressRequired') || 'Shipping address is required');
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Validar total
      if (subtotal <= 0) {
        throw new Error(t('checkout.validation.cartEmpty') || 'Cart is empty');
      }

      // Crear transacción TPV
      const response = await fetch(`${backendUrl}/api/payment/create-transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId || 0,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          customerPhone: formData.customerPhone,
          totalAmount: subtotal,
          shippingAddress: {
            fullName: formData.customerName,
            line1: formData.addressLine1,
            line2: formData.addressLine2,
            city: formData.city,
            province: formData.province,
            postalCode: formData.postalCode,
            country: formData.country,
            phone: formData.customerPhone,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const data = await response.json();

      const responseOrderId = data.orderId || orderId || 0;
      const responseTotal = Number(data.totalAmount);
      const persistedTotal = Number.isFinite(responseTotal) && responseTotal > 0
        ? responseTotal
        : payableTotal;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkout_orderId', String(responseOrderId));
        sessionStorage.setItem('checkout_totalAmount', String(persistedTotal));
      }

      if (data.tpvEndpoint && data.tpvParams) {
        if (typeof window === 'undefined') {
          throw new Error('Browser environment required for Redsys redirect');
        }

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.tpvEndpoint;

        Object.entries(data.tpvParams).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value ?? '');
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        return;
      }

      if (data.redirectURL) {
        window.location.href = data.redirectURL;
      } else {
        throw new Error('No TPV redirect data provided by backend');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(message);
      console.error('Checkout error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-tpv w-full max-w-2xl max-h-[92vh] overflow-y-auto mx-auto rounded-3xl bg-white shadow-2xl border border-gray-200">
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white/95 px-6 py-5 backdrop-blur-sm">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-center text-gray-900">
          {t('checkout.title') || 'Secure Checkout'}
        </h2>
      </div>

      <div className="px-5 sm:px-6 py-5 sm:py-6">
      <h2 className="sr-only">
        {t('checkout.title') || 'Secure Checkout'}
      </h2>

      <div className="mb-6 rounded-2xl border border-gray-200 bg-gradient-to-br from-gray-50 via-white to-gray-100 p-4 sm:p-5 shadow-sm">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-start mb-4">
          <div className="space-y-2">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-500">
              {t('checkout.estimatorTag') || 'Shipping estimator'}
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
              {t('checkout.estimatorTitle') || 'Estimate your shipping before checkout'}
            </h3>
            <p className="text-sm text-gray-600 leading-6 max-w-xl">
              {t('checkout.estimatorSubtitle') || 'Choose your destination and we will calculate the approximate shipping cost in real time.'}
            </p>
          </div>
          <div className="shrink-0 rounded-2xl bg-black px-4 py-4 text-white text-right shadow-lg">
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/70">
              {t('checkout.estimatedShipping') || 'Estimated shipping'}
            </div>
            <div className="text-2xl font-bold leading-tight mt-1">
              EUR {shippingAmount.toFixed(2)}
            </div>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div className="space-y-2">
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
              {t('checkout.country') || 'Country'} *
            </label>
            <select
              id="country"
              name="country"
              value={formData.country}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">{t('checkout.selectCountry') || 'Select country'}</option>
              {SHIPPING_COUNTRY_OPTIONS.map((country) => (
                <option key={country.value} value={country.value}>
                  {country.label}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white px-4 py-4 shadow-sm">
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-500">
              {t('checkout.estimatedTotal') || 'Estimated total'}
            </div>
            <div className="text-2xl font-bold text-gray-900 mt-1">
              EUR {payableTotal.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500 mt-2 leading-5">
              {selectedCountryLabel
                ? `${selectedCountryLabel}${shippingQuote ? ` · ${shippingQuote.zoneLabel}` : ''}`
                : (t('checkout.estimatorHelp') || 'Select a country to see the shipping estimate.')}
            </div>
          </div>
        </div>

        {shippingQuote && (
          <div className="mt-4 rounded-2xl bg-white/80 border border-gray-200 px-4 py-4 text-sm text-gray-700 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div className="font-semibold text-gray-900">{shippingQuote.zoneLabel}</div>
              <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                {shippingQuote.method}
              </div>
            </div>
            <div className="mt-2 text-gray-600">
              {t('checkout.estimatedLabel') || 'Estimated shipping'}: EUR {shippingAmount.toFixed(2)}
            </div>
          </div>
        )}

        <div className="mt-3 text-xs text-gray-500 leading-5">
          {t('checkout.estimatorNotice') || 'The final shipping cost will be confirmed after completing the address details.'}
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.fullName') || 'Full Name'} *
            </label>
            <input
              id="customerName"
              type="text"
              name="customerName"
              value={formData.customerName}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="John Doe"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.email') || 'Email'} *
            </label>
            <input
              id="customerEmail"
              type="email"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleInputChange}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="john@example.com"
              disabled={loading}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700 mb-1">
            {t('checkout.phone') || 'Phone'}
            </label>
            <input
              id="customerPhone"
              type="tel"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleInputChange}
              className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+34 123 456 789"
              disabled={loading}
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700 flex items-center">
            <div>
              <div className="font-semibold text-gray-900">{t('checkout.shippingTitle') || 'Shipping address'}</div>
              <div className="text-xs text-gray-500 mt-1">
                {t('checkout.addressHelper') || 'Fill in the address below to confirm the final shipping quote.'}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 sm:p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {t('checkout.shippingTitle') || 'Shipping address'}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {t('checkout.addressHelper') || 'Fill in the address below to confirm the final shipping quote.'}
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="addressLine1" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.addressLine1') || 'Address line 1'} *
              </label>
              <input
                id="addressLine1"
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Calle Mayor 123"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="addressLine2" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.addressLine2') || 'Address line 2'}
              </label>
              <input
                id="addressLine2"
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Piso, puerta, etc."
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.city') || 'City'} *
              </label>
              <input
                id="city"
                type="text"
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Madrid"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="province" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.province') || 'Province'} *
              </label>
              <input
                id="province"
                type="text"
                name="province"
                value={formData.province}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Madrid"
                disabled={loading}
              />
            </div>

            <div>
              <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                {t('checkout.postalCode') || 'Postal code'} *
              </label>
              <input
                id="postalCode"
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleInputChange}
                required
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="28001"
                disabled={loading}
              />
            </div>

            <div className="sm:col-span-2 text-xs text-gray-500">
              {shippingQuote
                ? `${t('checkout.country') || 'Country'}: ${selectedCountryLabel || formData.country}`
                : t('checkout.selectCountry') || 'Select country'}
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full rounded-2xl bg-blue-600 px-4 py-3 font-bold text-white transition-colors hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin mr-2">⚙️</span>
                {t('checkout.processing') || 'Processing...'}
              </>
            ) : (
              t('checkout.payNow') || 'Pay Now'
            )}
          </button>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="w-full mt-3 rounded-2xl bg-gray-100 px-4 py-3 font-semibold text-gray-800 transition-colors hover:bg-gray-200"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
        )}
      </form>

      {/* Nota de seguridad */}
      <div className="mt-6 border-t border-gray-200 px-6 py-4 text-xs text-gray-500 text-center">
        <p>🔒 {t('checkout.securePayment') || 'Secure payment processed by Redsys'}</p>
      </div>
      </div>
    </div>
  );
}
