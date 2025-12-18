'use client';

import OrderDetailView from '@/features/orders/components/OrderDetailView';

interface PageProps {
  params: { orderId: string };
}

export default function OrderDetailPage({ params }: PageProps) {
  const { orderId } = params;
  return <OrderDetailView orderId={orderId} />;
}