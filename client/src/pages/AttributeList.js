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
        Header: 'ID',
        accessor: 'id'
      },
      {
        Header: 'Name',
        accessor: 'name'
      },
      {
        Header: 'Groups Count',
        accessor: 'groups_count'
      },
      {
        Header: 'Labels Count',
        accessor: 'labels_count'
      },
      {
        Header: 'Creation Date',
        accessor: 'created_at',
        cell: ({ value }) => value.getYear() + '-' + value.getMonth()
      }
    ],
    []
  );

  if (isLoading) return <Loading />;

  if (error) return 'An error has occurred';

  return <MainTable columns={columns} data={data} />;
};

export default AttributeList;
