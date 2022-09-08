import React, { useMemo, useState, useEffect } from 'react';
import Table from '../components/Table';
import { format } from 'date-fns';
import Header from '../components/Header';
import { Loading } from '../components/Loading';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';
import TemplateModal from '../components/TemplateModal';

const TemplateList = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState([]);

  // console.log(templates);

  const getTemplates = async () => {
    const res = await fetch('/api/templates');
    const data = await res.json();
    setTemplates(data.templates);
  };

  useEffect(() => {
    document.title = 'NEX Content | Templates';
    getTemplates();
  }, []);

  const successToast = () => {
    toast('Template created successfully', {
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
        accessor: 'groups_count',
        header: 'Groups'
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

  if (typeof templates !== 'undefined' && templates.length < 1) {
    return <Loading />;
  }

  const postTemplate = async (newData) => {
    try {
      const response = await fetch('/api/templates', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        const { template } = await response.json();
        navigate('/templates/' + template.id);
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
      <Header title="templates" first="templates" second="" />
      <Table columns={columns} data={templates} name="templates">
        <button className="list-create-btn" onClick={() => setOpenModal(true)}>
          Create
        </button>
        <TemplateModal
          openTheModal={openTheModal}
          closeTheModal={closeTheModal}
          postTemplate={postTemplate}
        />
      </Table>
    </Layout>
  );
};

export default TemplateList;
