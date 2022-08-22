import React, { useEffect, useState } from 'react';
import Show from '../components/Show';
import { useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import Header from '../components/Header';
import AttributeModal from '../components/AttributeModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const AttributeShow = () => {
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const [openTheModal, setOpenModal] = useState(false);
  const closeTheModal = () => setOpenModal(false);

  const [attribute, setAttribute] = useState(null);

  const [title, setTitle] = useState('');

  const getAttribute = async () => {
    const res = await fetch('/api/attributes/' + id);
    const data = await res.json();
    setAttribute(data.attribute);
  };

  useEffect(() => {
    document.title = `NEX Content | Attribute #${id}`;
    getAttribute();
    setTitle(`Attribute #${id}`);
  }, []);

  const delAttr = async () => {
    if (window.confirm('Are you sure?')) {
      await deleteAttribute(attribute.id);
    }
  };

  const successDeleteToast = () => {
    toast('Attribute edited successfully', {
      className: 'success-toast'
    });
  };

  const successEditToast = () => {
    toast('Attribute edited successfully', {
      className: 'success-toast'
    });
  };

  const errorToast = () => {
    toast('Something went wrong', {
      className: 'error-toast'
    });
  };

  const deleteAttribute = async (id) => {
    const res = await fetch(`/api/attributes/${id}`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      navigate('/attributes');
      successDeleteToast();
    }
  };

  if (!attribute) {
    return <Loading />;
  }

  const postAttribute = async (newData) => {
    try {
      const response = await fetch(`/api/attributes/${newData.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        getAttribute();
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
      <Header title={title} first="Attributes" second={title} />
      <Show data={attribute} />
      <div className="m-4 mb-20 mt-4 p-2 flex justify-between">
        <button className="edit-item-btn" onClick={() => setOpenModal(true)}>
          Edit
        </button>
        <button className="delete-item-btn" onClick={delAttr}>
          Delete
        </button>
      </div>
      <AttributeModal
        attribute={attribute}
        openTheModal={openTheModal}
        closeTheModal={closeTheModal}
        postAttribute={postAttribute}
      />
    </Layout>
  );
};

export default AttributeShow;
