import React, { useMemo, useState, useEffect } from 'react';
import Table from '../components/Table';
import { format } from 'date-fns';
import AttributeModal from '../components/AttributeModal';
import Header from '../components/Header';
import { Loading } from '../components/Loading';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const AttributeList = () => {
  const navigate = useNavigate();

  const [attributes, setAttributes] = useState([]);

  const getAttributes = async () => {
    const res = await fetch('/api/attributes');
    const data = await res.json();
    setAttributes(data.attributes);
  };

  useEffect(() => {
    document.title = 'NEX Content | Attributes';
    getAttributes();
  }, []);

  const successToast = () => {
    toast('Attribute created successfully', {
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
        accessor: 'locals_count',
        header: 'Locals'
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

  if (typeof attributes !== 'undefined' && attributes.length < 1) {
    return <Loading />;
  }

  const postAttribute = async (newData) => {
    try {
      const response = await fetch('/api/attributes', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        const { attribute } = await response.json();
        navigate('/attributes/' + attribute.id);
        successToast();
      } else {
        errorToast();
        return response.json();
      }
    } catch (e) {
      errorToast();
    }
  };

  return (
    <Layout>
      <Header title="Attributes" first="Attributes" second="" />
      <Table columns={columns} data={attributes} name="attributes">
        <button className="list-create-btn" onClick={() => setOpenModal(true)}>
          Create
        </button>
        <AttributeModal
          openTheModal={openTheModal}
          closeTheModal={closeTheModal}
          postAttribute={postAttribute}
        />
      </Table>
    </Layout>
  );
};

export default AttributeList;
