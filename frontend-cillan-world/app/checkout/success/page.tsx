import { redirect } from "next/navigation";

type CheckoutSuccessPageProps = {
  searchParams?: Promise<{ orderId?: string | string[] }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const resolvedParams = (await searchParams) || {};
  const rawOrderId = resolvedParams.orderId;
  const orderId = Array.isArray(rawOrderId) ? rawOrderId[0] : rawOrderId;
  const params = new URLSearchParams();
  if (orderId) {
    params.set("orderId", orderId);
  }
  params.set("source", "checkout");
  const target = `/success?${params.toString()}`;

  redirect(target);
}
