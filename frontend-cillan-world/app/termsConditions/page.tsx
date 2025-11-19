"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

const COMPANY_NAME = "Cillan World S.L.";
const COMPANY_ADDRESS = "Calle de la Moda 123, 28001 Madrid, España";
const CONTACT_EMAIL = "contacto@cillan.world";
const LOGISTICS_PROVIDER = "Correos Express Paquetería Urgente, S.A.";

export default function TermsConditionsPage() {
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
            <h1 className="text-3xl font-bold">Términos y condiciones</h1>
            <p className="text-sm text-gray-500">
              <strong>Última actualización: 07/08/2025</strong>
            </p>
          </header>

          <p className="text-gray-800">
            Estas condiciones regulan el uso de la tienda online operada por {COMPANY_NAME} desde {COMPANY_ADDRESS}.
            Al acceder o comprar aceptas expresamente estos términos.
          </p>

          <div>
            <h2 className="text-xl font-semibold mb-2">Contacto</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>Email: {CONTACT_EMAIL}</li>
              <li>Dirección fiscal: {COMPANY_ADDRESS}</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Condiciones de venta</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>Todos los precios incluyen IVA en euros.</li>
              <li>El pedido se considera aceptado cuando recibes la confirmación de pago.</li>
              <li>Los pagos se procesan exclusivamente a través de Stripe.</li>
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Envíos y devoluciones</h2>
            <p className="text-gray-800">
              Trabajamos con {LOGISTICS_PROVIDER}. El plazo estimado es de 2 a 5 días hábiles en España peninsular.
              Dispones de 14 días naturales para solicitar una devolución escribiendo a {CONTACT_EMAIL}. El producto
              debe estar en perfecto estado y con su embalaje original.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Propiedad intelectual</h2>
            <p className="text-gray-800">
              Todo el contenido del sitio (textos, imágenes, logotipos) pertenece a {COMPANY_NAME} o a terceros
              licenciantes. No está permitido reutilizarlo sin autorización.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Protección de datos</h2>
            <p className="text-gray-800">
              Tratamos los datos personales conforme a nuestra{" "}
              <Link href="/privacyPolicy" className="text-blue-600 underline">
                Política de privacidad
              </Link>.
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Ley aplicable</h2>
            <p className="text-gray-800">
              Los presentes términos se rigen por la legislación española y cualquier disputa se resolverá ante los
              juzgados y tribunales de Madrid (España).
            </p>
          </div>

          <div>
            <h2 className="text-xl font-semibold mb-2">Contacto para reclamaciones</h2>
            <ul className="list-disc list-inside text-gray-800 space-y-1">
              <li>{CONTACT_EMAIL}</li>
              <li>{COMPANY_ADDRESS}</li>
            </ul>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
