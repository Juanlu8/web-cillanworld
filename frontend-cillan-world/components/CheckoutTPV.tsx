'use client';

import { useState, FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useCart } from '@/hooks/use-cart';

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
  const total = totalAmount || items.reduce((sum, item) => {
    const price = item.product?.attributes?.price || 0;
    return sum + (price * (item.quantity || 1));
  }, 0);

  // Datos del formulario
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
      if (!backendUrl) {
        throw new Error('Backend URL not configured');
      }

      // Validar total
      if (total <= 0) {
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
          totalAmount: total,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const data = await response.json();

      const responseOrderId = data.orderId || orderId || 0;
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('checkout_orderId', String(responseOrderId));
        sessionStorage.setItem('checkout_totalAmount', String(total));
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
    <div className="checkout-tpv max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {t('checkout.title') || 'Secure Checkout'}
      </h2>

      {/* Resumen del carrito */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <div className="text-sm text-gray-600 mb-2">
          {t('checkout.items') || 'Items'}: {items.length}
        </div>
        <div className="text-2xl font-bold text-gray-900">
          €{total.toFixed(2)}
        </div>
      </div>

      {/* Errores */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="john@example.com"
            disabled={loading}
          />
        </div>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="+34 123 456 789"
            disabled={loading}
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition-colors"
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
            className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition-colors"
          >
            {t('common.cancel') || 'Cancel'}
          </button>
        )}
      </form>

      {/* Nota de seguridad */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-xs text-gray-500 text-center">
        <p>🔒 {t('checkout.securePayment') || 'Secure payment processed by Redsys'}</p>
      </div>
    </div>
  );
}
