import { Application } from '@/types/application';
import { ColumnDef } from '@tanstack/react-table';
import { Verified } from 'lucide-react';
import { ApplicationListActions } from './application-list-actions';

export const applicationListColumns: ColumnDef<Application>[] = [
  {
    accessorKey: 'id',
    header: 'ID',
    enableHiding: false,
    cell: ({ row }) => (
      <div className='flex items-center flex-nowrap whitespace-nowrap'>
        {row.getValue('id')}
        {row.original.role === 'internal_client' && (
          <Verified className='h-4 w-4 ml-2' />
        )}
      </div>
    ),
  },
  {
    accessorKey: 'displayName',
    header: 'Display Name',
    cell: ({ row }) => (
      <div className='capitalize'>{row.getValue('displayName')} </div>
    ),
  },
  {
    accessorKey: 'role',
    header: 'Role',
    cell: ({ row }) => (
      <div className='capitalize whitespace-nowrap'>
        {(row.getValue('role') as string).split('_').join(' ')}
      </div>
    ),
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ApplicationListActions,
  },
];
