"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";

export default function TermsConditionsPage() {
    
    const router = useRouter();
    const goToHome = () => {
    router.push(`/`);
  };


    return (
    <div className="relative text-justify">
      {/* Fondo decorativo anilla */}
      <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-0">
        <img
          src="/images/anilla.png"
          alt="Fondo anilla"
          className="w-4/5 max-w-[450px] md:w-full md:max-w-[600px] h-auto opacity-20 select-none object-contain mt-0 md:mt-48 md:ms-42"
        />
      </div>
      {/* Marca de agua */}
      <div className="pt-14 md:pt-10 left-0 w-full flex justify-center z-00">
        <img
          src="/images/logo-top.png"
          alt="Marca de agua"
          className="w-64 sm:w-84 md:w-104 lg:w-124 object-contain transition duration-300 ease-in-out hover:scale-105"
          onClick={() => goToHome()}
        />
      </div>
      <div className="z-0">
        <NavBar />
      </div>
      <div className="px-4 md:px-10 pb-24">
        <section id="terms-conditions" className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">Términos y Condiciones de la tienda</h1>
          <p className="text-sm text-gray-500 mb-6 text-center"><strong>Última actualización: 07/08/2025</strong></p>

          <p className="mb-6 text-gray-800">Bienvenido a <strong>[Nombre de tu tienda]</strong>. Al acceder y utilizar nuestro sitio web y/o realizar una compra, aceptas estar sujeto a los siguientes Términos y Condiciones. Te recomendamos leerlos detenidamente antes de usar nuestros servicios.</p>

          <h2 className="text-xl font-semibold strong mt-8 mb-2">1. Información general</h2>
          <p className="mb-2 text-gray-800">Este sitio web es operado por <strong>[Nombre legal o comercial]</strong>. En todo el sitio, los términos “nosotros”, “nuestro” o “la tienda” se refieren a <strong>[Nombre de tu tienda]</strong>.</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li><strong>Email de contacto:</strong> contacto@[tudominio].com</li>
            <li><strong>Dirección física (si aplica):</strong> [Calle, ciudad, país]</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">2. Uso del sitio web</h2>
          <p className="mb-2 text-gray-800">Al usar este sitio, declaras que tienes al menos 18 años o que tienes autorización legal para realizar compras online en tu país de residencia.</p>
          <p className="mb-6 text-gray-800">No puedes usar nuestros productos con fines ilegales o no autorizados ni violar ninguna ley en tu jurisdicción (incluyendo, pero no limitado a, derechos de autor).</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">3. Productos y disponibilidad</h2>
          <p className="mb-2 text-gray-800">Todos los productos mostrados en nuestra tienda están sujetos a disponibilidad. Nos reservamos el derecho de retirar o modificar productos sin previo aviso.</p>
          <p className="mb-6 text-gray-800">Los colores de los productos pueden variar ligeramente según la configuración de pantalla del usuario.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">4. Precios y pagos</h2>
          <p className="mb-2 text-gray-800">Todos los precios están indicados en euros (€) e incluyen IVA, salvo que se indique lo contrario.</p>
          <p className="mb-6 text-gray-800">Aceptamos pagos seguros a través de Stripe, mediante tarjetas de crédito y débito. El cargo se realizará en el momento de confirmar el pedido.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">5. Envíos y entregas</h2>
          <p className="mb-2 text-gray-800">Los envíos se realizan a través de [nombre de empresa de mensajería si aplica]. El tiempo de entrega estimado es de [X a Y días hábiles] desde la confirmación del pedido.</p>
          <p className="mb-6 text-gray-800">Los gastos de envío se calculan y muestran antes de finalizar la compra.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">6. Cambios y devoluciones</h2>
          <p className="mb-2 text-gray-800">Aceptamos devoluciones dentro de un plazo de 14 días naturales desde la recepción del pedido, siempre que el producto no haya sido usado y esté en su embalaje original.</p>
          <p className="mb-2 text-gray-800">Para solicitar una devolución, escríbenos a contacto@[tudominio].com indicando el número de pedido y motivo.</p>
          <p className="mb-6 text-gray-800">Los gastos de envío de la devolución corren por cuenta del cliente, salvo que el producto esté defectuoso o haya habido un error por nuestra parte.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">7. Propiedad intelectual</h2>
          <p className="mb-6 text-gray-800">Todo el contenido de este sitio (textos, imágenes, logotipos, diseño web, etc.) es propiedad de <strong>[Nombre de tu tienda]</strong> o cuenta con licencia de uso. Está prohibida su reproducción total o parcial sin autorización previa.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">8. Responsabilidad</h2>
          <p className="mb-2 text-gray-800">No nos hacemos responsables por daños derivados del mal uso de los productos o por el incumplimiento por parte del cliente de las instrucciones de cuidado, talla o uso.</p>
          <p className="mb-6 text-gray-800">En ningún caso seremos responsables por pérdidas indirectas, lucro cesante o daños derivados de fallos técnicos del sitio web.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">9. Protección de datos</h2>
          <p className="mb-6 text-gray-800">Respetamos tu privacidad y tratamos tus datos personales conforme a nuestra <a href="/privacy-policy" className="text-blue-600 underline">Política de Privacidad</a>.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">10. Modificaciones</h2>
          <p className="mb-6 text-gray-800">Nos reservamos el derecho a modificar estos Términos y Condiciones en cualquier momento. Los cambios se harán efectivos desde su publicación en esta página.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">11. Ley aplicable y jurisdicción</h2>
          <p className="mb-6 text-gray-800">Estas condiciones se rigen por la legislación española. En caso de conflicto, ambas partes acuerdan someterse a los juzgados y tribunales de [Ciudad, España], salvo disposición legal en contrario.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">12. Contacto</h2>
          <p className="mb-2 text-gray-800">Para cualquier duda o reclamación, puedes escribirnos a:</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li>contacto@[tudominio].com</li>
            <li>[Dirección física, si aplica]</li>
          </ul>
        </section>
      </div>
      <Footer />
    </div>
  );
}
