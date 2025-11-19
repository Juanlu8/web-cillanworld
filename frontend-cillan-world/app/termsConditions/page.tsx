"use client";

import Footer from "@/components/Footer";
import NavBar from "@/components/ui/navbar";
import { useRouter } from "next/navigation";
import NextImage from "next/image";
import Link from "next/link";

export default function TermsConditionsPage() {
    
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
        <section id="terms-conditions" className="max-w-3xl mx-auto bg-white bg-opacity-90 rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold mb-4 text-center">TÃ©rminos y Condiciones de la tienda</h1>
          <p className="text-sm text-gray-500 mb-6 text-center"><strong>Ãšltima actualizaciÃ³n: 07/08/2025</strong></p>

          <p className="mb-6 text-gray-800">Bienvenido a <strong>[Nombre de tu tienda]</strong>. Al acceder y utilizar nuestro sitio web y/o realizar una compra, aceptas estar sujeto a los siguientes TÃ©rminos y Condiciones. Te recomendamos leerlos detenidamente antes de usar nuestros servicios.</p>

          <h2 className="text-xl font-semibold strong mt-8 mb-2">1. InformaciÃ³n general</h2>
          <p className="mb-2 text-gray-800">Este sitio web es operado por <strong>[Nombre legal o comercial]</strong>. En todo el sitio, los tÃ©rminos â€œnosotrosâ€, â€œnuestroâ€ o â€œla tiendaâ€ se refieren a <strong>[Nombre de tu tienda]</strong>.</p>
          <ul className="list-disc list-inside mb-6 text-gray-800">
            <li><strong>Email de contacto:</strong> contacto@[tudominio].com</li>
            <li><strong>DirecciÃ³n fÃ­sica (si aplica):</strong> [Calle, ciudad, paÃ­s]</li>
          </ul>

          <h2 className="text-xl font-semibold mt-8 mb-2">2. Uso del sitio web</h2>
          <p className="mb-2 text-gray-800">Al usar este sitio, declaras que tienes al menos 18 aÃ±os o que tienes autorizaciÃ³n legal para realizar compras online en tu paÃ­s de residencia.</p>
          <p className="mb-6 text-gray-800">No puedes usar nuestros productos con fines ilegales o no autorizados ni violar ninguna ley en tu jurisdicciÃ³n (incluyendo, pero no limitado a, derechos de autor).</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">3. Productos y disponibilidad</h2>
          <p className="mb-2 text-gray-800">Todos los productos mostrados en nuestra tienda estÃ¡n sujetos a disponibilidad. Nos reservamos el derecho de retirar o modificar productos sin previo aviso.</p>
          <p className="mb-6 text-gray-800">Los colores de los productos pueden variar ligeramente segÃºn la configuraciÃ³n de pantalla del usuario.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">4. Precios y pagos</h2>
          <p className="mb-2 text-gray-800">Todos los precios estÃ¡n indicados en euros (â‚¬) e incluyen IVA, salvo que se indique lo contrario.</p>
          <p className="mb-6 text-gray-800">Aceptamos pagos seguros a travÃ©s de Stripe, mediante tarjetas de crÃ©dito y dÃ©bito. El cargo se realizarÃ¡ en el momento de confirmar el pedido.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">5. EnvÃ­os y entregas</h2>
          <p className="mb-2 text-gray-800">Los envÃ­os se realizan a travÃ©s de [nombre de empresa de mensajerÃ­a si aplica]. El tiempo de entrega estimado es de [X a Y dÃ­as hÃ¡biles] desde la confirmaciÃ³n del pedido.</p>
          <p className="mb-6 text-gray-800">Los gastos de envÃ­o se calculan y muestran antes de finalizar la compra.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">6. Cambios y devoluciones</h2>
          <p className="mb-2 text-gray-800">Aceptamos devoluciones dentro de un plazo de 14 dÃ­as naturales desde la recepciÃ³n del pedido, siempre que el producto no haya sido usado y estÃ© en su embalaje original.</p>
          <p className="mb-2 text-gray-800">Para solicitar una devoluciÃ³n, escrÃ­benos a contacto@[tudominio].com indicando el nÃºmero de pedido y motivo.</p>
          <p className="mb-6 text-gray-800">Los gastos de envÃ­o de la devoluciÃ³n corren por cuenta del cliente, salvo que el producto estÃ© defectuoso o haya habido un error por nuestra parte.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">7. Propiedad intelectual</h2>
          <p className="mb-6 text-gray-800">Todo el contenido de este sitio (textos, imÃ¡genes, logotipos, diseÃ±o web, etc.) es propiedad de <strong>[Nombre de tu tienda]</strong> o cuenta con licencia de uso. EstÃ¡ prohibida su reproducciÃ³n total o parcial sin autorizaciÃ³n previa.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">8. Responsabilidad</h2>
          <p className="mb-2 text-gray-800">No nos hacemos responsables por daÃ±os derivados del mal uso de los productos o por el incumplimiento por parte del cliente de las instrucciones de cuidado, talla o uso.</p>
          <p className="mb-6 text-gray-800">En ningÃºn caso seremos responsables por pÃ©rdidas indirectas, lucro cesante o daÃ±os derivados de fallos tÃ©cnicos del sitio web.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">9. ProtecciÃ³n de datos</h2>
          <p className="mb-6 text-gray-800">Respetamos tu privacidad y tratamos tus datos personales conforme a nuestra <Link href="/privacyPolicy" className="text-blue-600 underline">PolÃ­tica de Privacidad</Link>.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">10. Modificaciones</h2>
          <p className="mb-6 text-gray-800">Nos reservamos el derecho a modificar estos TÃ©rminos y Condiciones en cualquier momento. Los cambios se harÃ¡n efectivos desde su publicaciÃ³n en esta pÃ¡gina.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">11. Ley aplicable y jurisdicciÃ³n</h2>
          <p className="mb-6 text-gray-800">Estas condiciones se rigen por la legislaciÃ³n espaÃ±ola. En caso de conflicto, ambas partes acuerdan someterse a los juzgados y tribunales de [Ciudad, EspaÃ±a], salvo disposiciÃ³n legal en contrario.</p>

          <h2 className="text-xl font-semibold mt-8 mb-2">12. Contacto</h2>
          <p className="mb-2 text-gray-800">Para cualquier duda o reclamaciÃ³n, puedes escribirnos a:</p>
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

