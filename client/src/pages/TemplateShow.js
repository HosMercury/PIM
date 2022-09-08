import React, { useEffect, useState } from 'react';
import Show from '../components/Show';
import { useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import Header from '../components/Header';
import TemplateModal from '../components/TemplateModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const TemplateShow = () => {
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const [openTheModal, setOpenModal] = useState(false);
  const closeTheModal = () => setOpenModal(false);

  const [template, setTemplate] = useState(null);

  const [title, setTitle] = useState('');

  const getTemplate = async () => {
    const res = await fetch('/api/templates/' + id);
    const data = await res.json();
    setTemplate(data.template);
  };

  useEffect(() => {
    document.title = `NEX Content | Template #${id}`;
    getTemplate();
    setTitle(`Template #${id}`);
  }, [id]);

  const delTemplate = async () => {
    if (window.confirm('Are you sure?')) {
      await deleteTemplate(getTemplate.id);
    }
  };

  const successDeleteToast = () => {
    toast('Template edited successfully', {
      className: 'success-toast'
    });
  };

  const successEditToast = () => {
    toast('Template edited successfully', {
      className: 'success-toast'
    });
  };

  const errorToast = () => {
    toast('Something went wrong', {
      className: 'error-toast'
    });
  };

  const deleteTemplate = async (id) => {
    const res = await fetch(`/api/templates/${id}`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      navigate('/templates');
      successDeleteToast();
    } else {
      errorToast();
    }
  };

  if (!template) {
    return <Loading />;
  }

  const postTemplate = async (newData) => {
    try {
      const response = await fetch(`/api/templates/${id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        getTemplate();
        closeTheModal();
        successEditToast();
      } else {
        errorToast();
      }
    } catch (e) {
      errorToast();
    }
  };

  return (
    <Layout>
      <Header title={title} first="Templates" second={title} />
      <Show data={template} />
      <div className="m-4 mb-20 mt-4 p-2 flex justify-between">
        <button className="edit-item-btn" onClick={() => setOpenModal(true)}>
          Edit
        </button>
        <button className="delete-item-btn" onClick={delTemplate}>
          Delete
        </button>
      </div>
      <TemplateModal
        template={template}
        openTheModal={openTheModal}
        closeTheModal={closeTheModal}
        postTemplate={postTemplate}
      />
    </Layout>
  );
};

export default TemplateShow;
