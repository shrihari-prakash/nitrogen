import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User } from '@/types/user';
import { ColumnDef } from '@tanstack/react-table';
import { PencilIcon, Verified } from 'lucide-react';
import { Link } from 'wouter';

export const userListColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'ProfilePicture',
    header: '',
    cell: ({ row }) => (
      <Avatar>
        <AvatarImage src={row.original.profilePictureUrl} />
        <AvatarFallback>
          {row.original.firstName
            ? row.original.firstName.charAt(0) + row.original.lastName.charAt(0)
            : row.original.name && row.original.name.charAt(0)}
        </AvatarFallback>
      </Avatar>
    ),
  },
  {
    accessorKey: 'username',
    header: 'Username',
    enableHiding: false,
    cell: ({ row }) => (
      <Link
        href={`/users/${row.original._id}`}
        className='flex items-center justify-start'
      >
        {row.getValue('username') || (
          <i className='opacity-50'>Not available</i>
        )}
        &nbsp;
        {row.original.verified && <Verified className='h-4 w-4' />}
      </Link>
    ),
  },
  {
    accessorKey: 'firstName',
    header: 'First Name',
    cell: ({ row }) => (
      <div className='capitalize'>
        {row.getValue('firstName') ||
          ((row.original.name || '') as string).split(' ')[0]}
      </div>
    ),
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
    cell: ({ row }) => (
      <div className='capitalize'>
        {row.getValue('lastName') ||
          ((row.original.name || '') as string).split(' ')[1]}
      </div>
    ),
  },
  {
    accessorKey: 'email',
    header: 'Email',
    cell: ({ row }) => <div className='lowercase'>{row.getValue('email')}</div>,
  },
  {
    id: 'actions',
    enableHiding: false,
    cell: ({ row }) => {
      return (
        <Link href={`/users/${row.original._id}`}>
          <Button variant='outline'>
            <PencilIcon className='h-4 w-4' />
          </Button>
        </Link>
      );
    },
  },
];
