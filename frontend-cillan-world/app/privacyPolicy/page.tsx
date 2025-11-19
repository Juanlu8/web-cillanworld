"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

export default function PrivacyPolicyPage() {
    
    const router = useRouter();
    const goToHome = () => {
    router.push(`/`);
  };


    return (
    <div className="relative text-justify">
      {/* Fondo decorativo anilla */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <NextImage
          src="/images/anilla.webp"
          alt="Fondo anilla"
          width={943}
          height={943}
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-[10.5rem]"
        />
      </div>
      {/* Marca de agua */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-0">
        <NextImage
          src="/images/logo-top.webp"
          alt="Marca de agua"
          width={1600}
          height={900}
          className="w-64 sm:w-[21rem] md:w-[26rem] lg:w-[31rem] object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={() => goToHome()}
        />
      </div>
      <div className="z-0">
        <NavBar />
      </div>
      <div className="px-4 md:px-10 pb-24">
        <section id="privacy-policy" className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">PolÃ­tica de Privacidad</h1>
          <p className="text-sm text-gray-500 mb-6 text-center"><strong>Ãšltima actualizaciÃ³n: 07/08/2025</strong></p>

          <p className="mb-6 text-gray-800">En <strong>[Nombre de tu tienda]</strong> (en adelante, â€œnosotrosâ€ o â€œla tiendaâ€), nos tomamos muy en serio la protecciÃ³n de tus datos personales. Esta PolÃ­tica de Privacidad describe cÃ³mo recopilamos, usamos y protegemos tu informaciÃ³n cuando navegas o realizas una compra en nuestro sitio web.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">1. Â¿QuiÃ©nes somos?</h2>
          <p className="mb-2 text-gray-800">Somos una tienda online de ropa de diseÃ±ador y productos exclusivos. Puedes contactarnos a travÃ©s de:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li><strong>Email:</strong> contacto@[tudominio].com</li>
            <li><strong>Responsable del tratamiento:</strong> [Nombre legal o empresa, si aplica]</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">2. Â¿QuÃ© datos personales recopilamos?</h2>
          <p className="mb-2 text-gray-800">Recopilamos la siguiente informaciÃ³n cuando navegas por nuestro sitio o haces una compra:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li>Nombre y apellidos</li>
            <li>DirecciÃ³n de envÃ­o y facturaciÃ³n</li>
            <li>Correo electrÃ³nico</li>
            <li>NÃºmero de telÃ©fono (opcional)</li>
            <li>InformaciÃ³n de pago (a travÃ©s de Stripe)</li>
            <li>DirecciÃ³n IP y datos de navegaciÃ³n (automÃ¡ticamente mediante cookies bÃ¡sicas)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">3. Â¿Para quÃ© usamos tus datos?</h2>
          <p className="mb-2 text-gray-800">Usamos tus datos para:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li>Procesar y gestionar tus pedidos</li>
            <li>Enviar confirmaciones y actualizaciones por email</li>
            <li>Atender tus consultas y solicitudes</li>
            <li>Cumplir obligaciones legales (facturaciÃ³n, devoluciones, etc.)</li>
            <li>Mejorar la experiencia de usuario en nuestra tienda</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">4. Â¿CuÃ¡l es la base legal para tratar tus datos?</h2>
          <p className="mb-2 text-gray-800">Conforme al Reglamento General de ProtecciÃ³n de Datos (RGPD), las bases legales son:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li><strong>EjecuciÃ³n de un contrato</strong> (para tramitar tus pedidos)</li>
            <li><strong>Consentimiento</strong> (cuando aceptas recibir comunicaciones)</li>
            <li><strong>ObligaciÃ³n legal</strong> (retenciÃ³n de facturas, por ejemplo)</li>
            <li><strong>InterÃ©s legÃ­timo</strong> (prevenciÃ³n del fraude, mejora del servicio)</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">5. Â¿Con quiÃ©n compartimos tus datos?</h2>
          <p className="mb-2 text-gray-800">Solo compartimos tus datos con terceros esenciales para operar nuestra tienda:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li><strong>Stripe, Inc.</strong>, para procesar los pagos. Puedes consultar su polÃ­tica de privacidad aquÃ­: <Link href="https://stripe.com/es/privacy" target="_blank" className="text-blue-600 underline">https://stripe.com/es/privacy</Link></li>
          </ul>
          <p className="mb-6 text-gray-800">No vendemos ni cedemos tus datos personales a terceros con fines comerciales.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">6. Uso de cookies</h2>
          <p className="mb-6 text-gray-800">Este sitio utiliza cookies tÃ©cnicas necesarias para su funcionamiento. Actualmente no utilizamos cookies de terceros para anÃ¡lisis o publicidad. En caso de hacerlo, lo notificaremos adecuadamente y solicitaremos tu consentimiento.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">7. Â¿CuÃ¡les son tus derechos?</h2>
          <p className="mb-2 text-gray-800">Puedes ejercer los siguientes derechos en cualquier momento:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li>Acceder a tus datos personales</li>
            <li>Solicitar la rectificaciÃ³n o supresiÃ³n de tus datos</li>
            <li>Limitar u oponerte al tratamiento</li>
            <li>Solicitar la portabilidad de los datos</li>
            <li>Retirar tu consentimiento, si lo diste previamente</li>
          </ul>
          <p className="mb-6 text-gray-800">Para ejercerlos, escrÃ­benos a <strong>contacto@[tudominio].com</strong> con el asunto â€œProtecciÃ³n de datosâ€.</p>
          <p className="mb-6 text-gray-800">TambiÃ©n puedes presentar una reclamaciÃ³n ante la Agencia EspaÃ±ola de ProtecciÃ³n de Datos: <Link href="https://www.aepd.es" target="_blank" className="text-blue-600 underline">https://www.aepd.es</Link></p>

          <h2 className="text-xl font-semibold mt-8 mb-2">8. Seguridad de tus datos</h2>
          <p className="mb-6 text-gray-800">Adoptamos medidas tÃ©cnicas y organizativas para proteger tus datos personales, incluyendo cifrado SSL, plataformas de pago seguras (como Stripe) y controles de acceso internos.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">9. ConservaciÃ³n de los datos</h2>
          <p className="mb-6 text-gray-800">Conservamos tus datos solo el tiempo necesario para cumplir con las finalidades indicadas y con las obligaciones legales (como la conservaciÃ³n de facturas durante 5 aÃ±os).</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">10. Cambios en esta polÃ­tica</h2>
          <p className="mb-6 text-gray-800">Nos reservamos el derecho a modificar esta polÃ­tica para adaptarla a novedades legislativas o tÃ©cnicas. La fecha de la Ãºltima actualizaciÃ³n aparecerÃ¡ al principio del documento.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">11. Contacto</h2>
          <p className="mb-2 text-gray-800">Para cualquier duda relacionada con esta polÃ­tica, puedes escribirnos a:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li>contacto@[tudominio].com</li>
            <li>[DirecciÃ³n fÃ­sica, si aplica]</li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}

