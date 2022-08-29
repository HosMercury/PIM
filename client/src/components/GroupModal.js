import React, { useState, useEffect } from 'react';
import { AiOutlineClose } from 'react-icons/ai';
import Modal from 'react-modal';
import ModalHeader from './ModalHeader';
import Select from 'react-select';

const GroupModal = ({ openTheModal, closeTheModal, group, postGroup }) => {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const [modalIsOpen, setIsOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [descriptionErr, setDescriptionErr] = useState(false);

  const [attributes, setAttributes] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [selectedTemplats, setSelectedTemplates] = useState([]);

  const handleAttributesChange = (selectedAttributes) => {
    setSelectedAttributes(selectedAttributes);
  };

  const handleTemplatesChange = (selectedTemplates) => {
    setSelectedTemplates(selectedTemplates);
  };

  console.log(selectedAttributes);
  const getAttributes = async () => {
    const res = await fetch('/api/attributes');
    const data = await res.json();
    const newAttributes = data.attributes.map((g) => {
      const newA = {};
      newA.value = g.id;
      newA.label = g.name;
      return newA;
    });
    setAttributes(newAttributes);
  };

  const getTemplates = async () => {
    const res = await fetch('/api/templates');
    const data = await res.json();
    const newTemplates = data.groups.map((g) => {
      const newT = {};
      newT.value = g.id;
      newT.label = g.name;
      return newT;
    });
    setTemplates(newTemplates);
  };

  useEffect(() => {
    setIsOpen(openTheModal);
    getAttributes();
    getTemplates();

    // if (group) {
    //   if (group.attributes && group.attributes.length > 0) {
    //     const newSelected = group.attributes.map((g) => {
    //       const newA = {};
    //       newA.value = g.id;
    //       newA.label = g.name;
    //       return newA;
    //     });
    //     setSelectedAttributes(newSelected);
    //   }
    // }
  }, [openTheModal]);

  const closeModal = () => {
    setIsOpen(false);
    closeTheModal();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let canSubmit = true;

    setNameErr(false);
    setDescriptionErr(false);

    if (name.search(alphaDashNumeric) === -1) {
      setNameErr(
        'Name field must contains only letters, numbers, space, dash and underscore'
      );
      canSubmit = false;
    }
    if (name.length < 2) {
      setNameErr('Name must be at least 2 characters');
      canSubmit = false;
    }

    if (name.length > 250) {
      setNameErr('Name must not exceed 250 characters');
      canSubmit = false;
    }

    if (description !== '' && description.length < 2) {
      setDescriptionErr('Description must be at least 2 characters');
      canSubmit = false;
    }

    if (description !== '' && description.length > 250) {
      setNameErr('Description must not exceed 250 characters');
      canSubmit = false;
    }

    if (canSubmit) {
      let newData = { name, description };
    }
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Group Modal"
      >
        <div className="border-nex p-1 flex justify-between ">
          <h2 className="text-nex font-bold text-xl">Create Group</h2>
          <button
            onClick={closeModal}
            className=" text-xl font-bold p-2 rounded-full w-8 h-8 m-2 relative -top-5"
          >
            <AiOutlineClose className="h-6 w-6" />
          </button>
        </div>
        <form onSubmit={(e) => handleSubmit(e)} className="my-4">
          <div className="border-nex border rounded-lg p-3 flex flex-col sm:flex-row bg-gray-50">
            <div className="w-full  p-1">
              <ModalHeader header="Properties" />

              <div className="my-2">
                <label htmlFor="name" className="modal-label">
                  Name :
                </label>
                <input
                  required
                  id="name"
                  type="text"
                  className="modal-input "
                  value={name}
                  onChange={(e) => setName(e.target.value.trim())}
                />
                {nameErr && <p className="form-err">{nameErr}</p>}
              </div>

              <div className="my-2">
                <label htmlFor="description" className="modal-label">
                  Description :
                </label>
                <input
                  id="description"
                  type="text"
                  className="modal-input "
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
                {descriptionErr && <p className="form-err">{descriptionErr}</p>}
              </div>
            </div>
          </div>
          <div className="my-4 border-nex border rounded-lg p-3  bg-gray-50">
            <ModalHeader header="Groups" />
            <Select
              isMulti
              className="my-6 border-nex border rounded w-[80%] mx-auto"
              value={selectedAttributes}
              onChange={handleAttributesChange}
              options={attributes}
            />
          </div>
          <div className="my-4 border-nex border rounded-lg p-3  bg-gray-50">
            <ModalHeader header="Templates" />
            <Select
              isMulti
              className="my-6 border-nex border rounded w-[80%] mx-auto"
              value={selectedTemplats}
              onChange={handleTemplatesChange}
              options={templates}
            />
          </div>
          <div className="text-center my-4">
            <button className="nex-btn" type="submit">
              Save Group
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default GroupModal;
