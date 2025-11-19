"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

const COMPANY_NAME = "Cillan World S.L.";
const COMPANY_ID = "CIF B12345678";
const COMPANY_ADDRESS = "Calle de la Moda 123, 28001 Madrid, España";
const CONTACT_EMAIL = "contacto@cillan.world";

export default function PrivacyPolicyPage() {
  const router = useRouter();
  const goToHome = () => router.push(`/`);

  return (
    <div className="relative text-justify">
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <NextImage
          src="/images/anilla.webp"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-[10.5rem]"
        />
      </div>

      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-0">
        <NextImage
          src="/images/logo-top.webp"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-[21rem] md:w-[26rem] lg:w-[31rem] object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={goToHome}
        />
      </div>

      <div className="z-0">
        <NavBar />
      </div>

      <div className="px-4 md:px-10 pb-24">
        <section className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8 space-y-6">
          <header className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Política de privacidad</h1>
            <p className="text-sm text-gray-500">
              <strong>Última actualización: 07/08/2025</strong>
            </p>
          </header>

          <p className="text-gray-800">
            En <strong>{COMPANY_NAME}</strong> ({COMPANY_ID}) tratamos tus datos con arreglo al Reglamento
            General de Protección de Datos. Operamos desde {COMPANY_ADDRESS} y puedes contactarnos
            en <strong>{CONTACT_EMAIL}</strong>. Esta política resume qué datos recopilamos, para qué los usamos
            y cómo puedes ejercer tus derechos.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">Datos que recopilamos</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>Datos identificativos (nombre, apellidos, correo y teléfono opcional).</li>
              <li>Direcciones de envío y facturación.</li>
              <li>Información de pago procesada íntegramente por Stripe.</li>
              <li>Datos técnicos de navegación (IP, idioma, dispositivo) para mejorar el servicio.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Finalidades y base legal</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>Ejecución del contrato: gestionar pedidos, envíos, devoluciones y soporte.</li>
              <li>Obligaciones legales: facturación y contabilidad.</li>
              <li>Consentimiento: comunicaciones comerciales si las aceptas.</li>
              <li>Interés legítimo: prevención del fraude y mejora de la experiencia web.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Encargados y destinatarios</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>
                <strong>Stripe, Inc.</strong> para el procesamiento seguro de los pagos
                (<Link href="https://stripe.com/es/privacy" target="_blank" className="text-blue-600 underline">
                  política
                </Link>).
              </li>
              <li>
                <strong>Correos Express Paquetería Urgente, S.A.</strong> para la logística y entrega de pedidos.
              </li>
            </ul>
            <p className="text-gray-800 mt-2">
              No vendemos ni cedemos datos personales a terceros con fines comerciales.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Derechos de los usuarios</h2>
            <p className="text-gray-800">
              Puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición en cualquier
              momento enviando un correo a <strong>{CONTACT_EMAIL}</strong> con el asunto “Protección de datos”.
              Si consideras que tus derechos no han sido atendidos, puedes reclamar ante la Agencia Española de
              Protección de Datos (
              <Link href="https://www.aepd.es" target="_blank" className="text-blue-600 underline">
                www.aepd.es
              </Link>
              ).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Seguridad y conservación</h2>
            <p className="text-gray-800">
              Aplicamos cifrado TLS, control de accesos y revisiones periódicas para proteger tus datos. Conservamos
              la información el tiempo imprescindible para prestar el servicio y cumplir obligaciones legales (p. ej.,
              facturas durante cinco años).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Contacto</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>Email: {CONTACT_EMAIL}</li>
              <li>Dirección: {COMPANY_ADDRESS}</li>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
