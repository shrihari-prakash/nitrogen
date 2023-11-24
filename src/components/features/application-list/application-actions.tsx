import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import ScopeSelector from '@/components/ui/scope-selector';
import usePermissions from '@/hooks/use-permissions';
import axiosInstance from '@/service/axios';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { BiTrash } from 'react-icons/bi';
import { toast } from 'react-toastify';

export const ApplicationActions = ({
  row,
  cell,
}: {
  row: any;
  cell: any;
  table: any;
}) => {
  const [value, setValue] = useState('');

  const context = cell.getContext();

  const isPermissionAllowed = usePermissions();

  const meta = context.table.options.meta as any;

  const onApplicationDelete = async () => {
    const promise = axiosInstance.delete('/client/admin-api/delete', {
      data: {
        target: row.original._id,
      },
    });
    toast.promise(promise, {
      pending: 'Deleting...',
      success: 'Delete successfull',
      error: 'Delete failed!',
    });
    await promise;
    meta.onApplicationDelete(row.original._id);
  };

  const onValueChange = (e: any) => {
    setValue(e.target.value);
  };

  return (
    <div className='flex items-center justify-center'>
      {isPermissionAllowed('admin:profile:access:write') && (
        <ScopeSelector
          user={row.original}
          setUser={() => null}
          scopes={meta.scopes || []}
          type='client'
        />
      )}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          {isPermissionAllowed('admin:system:client:delete') && (
            <Button className='ml-2' variant='outline'>
              <BiTrash className='h-4 w-4' />
            </Button>
          )}
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {row.original.displayName}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deleting clients might have unintended consequences in the system.
              This action cannot be undone. Are you sure you want to delete?
              <div className='input-group mt-4'>
                Type <strong>{row.original.id}</strong> in the box below to
                enable the delete button.
                <Input
                  className='mt-4'
                  value={value}
                  onChange={onValueChange}
                />
              </div>
              {row.original.role === 'internal_client' &&
                value === row.original.id && (
                  <Alert className='mt-2' variant='destructive'>
                    <AlertCircle className='h-4 w-4' />
                    <AlertDescription>
                      <strong>
                        You are deleting an internal client. This might break
                        your system completely. Delete at your own risk.
                      </strong>
                    </AlertDescription>
                  </Alert>
                )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={onApplicationDelete}
              disabled={value !== row.original.id}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};