import React, { useEffect, useState } from 'react';
import Show from '../components/Show';
import { useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import Header from '../components/Header';
import GroupModal from '../components/GroupModal';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Layout from '../components/Layout';

const GroupShow = () => {
  const navigate = useNavigate();

  const params = useParams();
  const id = params.id;

  const [openTheModal, setOpenModal] = useState(false);
  const closeTheModal = () => setOpenModal(false);

  const [group, setGroup] = useState(null);

  const [title, setTitle] = useState('');

  const getGroup = async () => {
    const res = await fetch('/api/groups/' + id);
    const data = await res.json();
    setGroup(data.group);
  };

  useEffect(() => {
    document.title = `NEX Content | Group #${id}`;
    getGroup();
    setTitle(`Group #${id}`);
  }, [id]);

  const delGroup = async () => {
    if (window.confirm('Are you sure?')) {
      await deleteGroup(group.id);
    }
  };

  const successDeleteToast = () => {
    toast('Group edited successfully', {
      className: 'success-toast'
    });
  };

  const successEditToast = () => {
    toast('Group edited successfully', {
      className: 'success-toast'
    });
  };

  const errorToast = () => {
    toast('Something went wrong', {
      className: 'error-toast'
    });
  };

  const deleteGroup = async (id) => {
    const res = await fetch(`/api/groups/${id}`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      navigate('/groups');
      successDeleteToast();
    }
  };

  if (!group) {
    return <Loading />;
  }

  const postGroup = async (newData) => {
    try {
      const response = await fetch(`/api/groups/${newData.id}`, {
        method: 'PATCH',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newData)
      });

      if (response.status === 201) {
        getGroup();
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
      <Header title={title} first="Groups" second={title} />
      <Show data={group} />
      <div className="m-4 mb-20 mt-4 p-2 flex justify-between">
        <button className="edit-item-btn" onClick={() => setOpenModal(true)}>
          Edit
        </button>
        <button className="delete-item-btn" onClick={delGroup}>
          Delete
        </button>
      </div>
      <GroupModal
        group={group}
        openTheModal={openTheModal}
        closeTheModal={closeTheModal}
        postGroup={postGroup}
      />
    </Layout>
  );
};

export default GroupShow;
