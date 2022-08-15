import React, { useMemo, useState, useEffect } from 'react';
import Table from '../components/Table';
import { format } from 'date-fns';
import AttributeModal from '../components/AttributeModal';
import Header from '../components/Header';
import { toast } from 'react-toastify';
import { Loading } from '../components/Loading';
import 'react-toastify/dist/ReactToastify.css';

const AttributeList = () => {
  const [attributes, setAttributes] = useState([]);
  const [groups, setGroups] = useState([]);
  const [locals, setLocals] = useState([]);

  const getAttributes = async () => {
    const res = await fetch('/api/attributes');
    const data = await res.json();
    setAttributes(data.attributes);
  };

  const getGroups = async () => {
    const res = await fetch('/api/groups');
    const data = await res.json();
    setGroups(data.groups);
  };

  const getLocals = async () => {
    const res = await fetch('/api/locals');
    const data = await res.json();
    setLocals(data.locals);
  };

  useEffect(() => {
    document.title = 'NEX Content | Attributes';
    getAttributes();
    getGroups();
    getLocals();
  }, []);

  const successToast = () => {
    toast('Done successfully', {
      className: 'success-toast'
    });
  };

  const errorToast = () => {
    toast('Something went wrong', {
      className: 'error-toast'
    });
  };

  const [openTheModal, setOpenModal] = useState(false);
  const closeTheModal = () => setOpenModal(false);

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

  if (attributes.length < 1) {
    return <Loading />;
  }

  return (
    <>
      <Header title="Attributes" first="Attributes" second="" />
      <Table columns={columns} data={attributes}>
        <button
          className="bg-nex hover:bg-white hover:opacity-90 hover:text-nex hover:border-nex 
          hover:font-bold border text-white rounded-md sm:px-4 px-2 w-16 sm:w-20 h-10 shadow p-1 mx-4"
          onClick={() => setOpenModal(true)}
        >
          Create
        </button>
        <AttributeModal
          attributes={attributes}
          groups={groups}
          locals={locals}
          openTheModal={openTheModal}
          closeTheModal={closeTheModal}
          successToast={successToast}
          errorToast={errorToast}
        />
      </Table>
    </>
  );
};

export default AttributeList;
