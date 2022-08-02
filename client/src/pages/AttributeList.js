import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '../components/Loading';
import MainTable from '../components/MainTable';

const AttributeList = () => {
  const fetchAttributes = async () => {
    const response = await fetch('/api/attributes');
    const data = await response.json();
    return data;
  };

  const { isLoading, error, data } = useQuery(['attributes'], fetchAttributes);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'id',
        header: 'ID'
      },
      {
        accessorKey: 'name',
        header: 'Name'
      },
      {
        accessorKey: 'created_at',
        header: 'Created_at'
      }
    ],
    []
  );

  if (isLoading) return <Loading />;

  if (error) return 'An error has occurred';

  return <MainTable columns={columns} data={data} />;
};

export default AttributeList;
