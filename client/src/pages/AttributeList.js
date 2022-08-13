import React, { useMemo, useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Loading } from '../components/Loading';
import Table from '../components/Table';
import { format } from 'date-fns';
import AttributeModal from '../components/AttributeModal';

const AttributeList = () => {
  useEffect(() => {
    document.title = 'NEX Content | Attributes';
  });

  const [openTheModal, setOpenModal] = useState(false);

  const closeTheModal = () => setOpenModal(false);

  const fetchAttributes = async () => {
    const response = await fetch('/api/attributes');
    return await response.json();
  };

  const { isLoading, error, data } = useQuery(['attributes'], fetchAttributes);

  const columns = useMemo(
    () => [
      {
        accessor: 'id',
        header: 'ID',
        Cell: ({ value }) => <span className="font-bold">{value}</span>
      },
      {
        accessor: 'name',
        header: 'Name'
      },
      {
        accessor: 'type',
        header: 'Type'
      },
      {
        accessor: 'groups_count',
        header: 'Groups'
      },
      {
        accessor: 'labels_count',
        header: 'Labels'
      },
      {
        accessor: 'choices',
        header: 'Choices'
      },
      {
        accessor: 'created_at',
        header: 'Created At',
        Cell: ({ value }) => (
          <span className=" px-2 ">
            {format(new Date(value), "dd-MM-yyyy hh:mm aaaaa'm'")}
          </span>
        )
      }
    ],
    []
  );

  if (isLoading) return <Loading />;

  if (error) return 'An error has occurred';

  return (
    <>
      <Table columns={columns} data={data.data.attributes}>
        <button
          className="bg-nex hover:bg-white hover:opacity-90 hover:text-nex hover:border-nex 
      hover:font-bold border text-white rounded-md sm:px-4 px-2 w-16 sm:w-20 h-10 shadow p-1 mx-4"
          onClick={() => setOpenModal(true)}
        >
          Create
        </button>
        <AttributeModal
          groups={data.data.groups}
          locals={data.data.locals}
          openTheModal={openTheModal}
          closeTheModal={closeTheModal}
        />
      </Table>
    </>
  );
};

export default AttributeList;
