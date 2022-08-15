import React, { useEffect, useState } from 'react';
import Show from '../components/Show';
import { useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import Header from '../components/Header';
import { useNavigate } from 'react-router-dom';
import AttributeModal from '../components/AttributeModal';

const AttributeShow = () => {
  const params = useParams();
  const id = params.id;
  const navigate = useNavigate();

  const [openTheModal, setOpenModal] = useState(false);
  const closeTheModal = () => setOpenModal(false);

  const [attribute, setAttribute] = useState(null);
  const [groups, setGroups] = useState(null);
  const [locals, setLocals] = useState(null);

  const [title, setTitle] = useState('');

  const getAttribute = async () => {
    const res = await fetch('/api/attributes/' + id);
    const data = await res.json();
    setAttribute(data.attribute);
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
    document.title = `NEX Content | Attribute #${id}`;
    getAttribute();
    getGroups();
    getLocals();
    setTitle(`Attribute #${id}`);
  }, [id]);

  const deleteAttribute = async (id) => {
    const res = await fetch(`/api/attributes/${id}`, {
      method: 'DELETE'
    });
    if (res.status === 204) {
      navigate('/attributes');
    }
  };

  const delAttr = async () => {
    if (window.confirm('Are you sure?')) {
      await deleteAttribute(attribute.id);
    }
  };

  if (!attribute) {
    return <Loading />;
  }

  return (
    <>
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
        locals={locals}
        groups={groups}
        openTheModal={openTheModal}
        closeTheModal={closeTheModal}
      />
    </>
  );
};

export default AttributeShow;
