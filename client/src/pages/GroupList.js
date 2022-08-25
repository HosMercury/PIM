import React, { useMemo, useState, useEffect } from 'react';
import Table from '../components/Table';
import { format } from 'date-fns';
import Header from '../components/Header';
import { Loading } from '../components/Loading';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const GroupList = () => {
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);

  console.log(groups);

  const getGroups = async () => {
    const res = await fetch('/api/groups');
    const data = await res.json();
    setGroups(data.groups);
  };

  useEffect(() => {
    document.title = 'NEX Content | Groups';
    getGroups();
  }, []);

  const successToast = () => {
    toast('Group created successfully', {
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
        accessor: 'attributes_count',
        header: 'Attributes'
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

  if (typeof groups !== 'undefined' && groups.length < 1) {
    return <Loading />;
  }

  const postGroup = async (newData) => {
    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        const { group } = await response.json();
        navigate('/groups/' + group.id);
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
      <Header title="Groups" first="Groups" second="" />
      <Table columns={columns} data={groups}>
        <button
          className="bg-nex hover:bg-white hover:opacity-90 hover:text-nex hover:border-nex 
          hover:font-bold border text-white rounded-md sm:px-4 px-2 w-16 sm:w-20 h-10 shadow p-1 mx-4"
          onClick={() => setOpenModal(true)}
        >
          Create
        </button>
        {/* <AttributeModal
          openTheModal={openTheModal}
          closeTheModal={closeTheModal}
          postAttribute={postGroup}
        /> */}
      </Table>
    </Layout>
  );
};

export default GroupList;
