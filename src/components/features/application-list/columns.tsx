import { Application } from '@/types/application';
import { ColumnDef } from '@tanstack/react-table';
import { Verified } from 'lucide-react';
import { ApplicationActions } from './application-actions';

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableHiding: false,
    cell: ({ row }) => row.getValue('id'),
  },
  {
    accessorKey: 'displayName',
    header: 'Display Name',
    cell: ({ row }) => (
      <div className='capitalize flex items-center'>
        {row.getValue('displayName')}{' '}
        {row.original.role === 'internal_client' && (
          <Verified className='h-4 w-4 ml-2' />
        )}
      </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div className='capitalize'>
        {(row.getValue('role') as string).split('_').join(' ')}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ApplicationActions,
  },
];
