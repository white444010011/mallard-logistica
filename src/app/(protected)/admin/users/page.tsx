import { db } from '@/db';
import { users } from '@/db/schema';
import { desc } from 'drizzle-orm';
import { UsersTable } from '@/components/admin/users-table';

export default async function AdminUsersPage() {
  const allUsers = await db.query.users.findMany({
    orderBy: [desc(users.createdAt)],
  });

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-gray-200 flex justify-between items-end">
         <div>
           <h1 className="text-2xl font-bold tracking-tight text-gray-900">Gerenciamento de Usuários</h1>
           <p className="text-sm text-gray-500 mt-1">Crie e edite acessos ao sistema logística.</p>
         </div>
         {/* The Create User Button will be within the Client Component to trigger a modal */}
      </div>

      <UsersTable initialUsers={allUsers} />
    </div>
  );
}
