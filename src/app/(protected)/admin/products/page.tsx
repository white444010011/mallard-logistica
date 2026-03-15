import { db } from '@/db';
import { products } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { ProductsTable } from '@/components/admin/products-table';

export default async function AdminProductsPage() {
  const allProducts = await db.query.products.findMany({
    orderBy: [desc(products.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200">
         <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento de Estoque</h1>
         <p className="text-sm text-gray-500 mt-1">Controle os itens que estarão disponíveis para solicitação (DB).</p>
      </div>

      <ProductsTable initialProducts={allProducts} />
    </div>
  );
}
