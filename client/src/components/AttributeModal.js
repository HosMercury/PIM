import React, { useState, useEffect } from 'react';
import Modal from 'react-modal';
import AttributeType from './AttributeType';
import { AiOutlineClose } from 'react-icons/ai';
import ModalHeader from './ModalHeader';
import Select from 'react-select';
import { nanoid } from 'nanoid';
import { useNavigate } from 'react-router-dom';

Modal.setAppElement('#root');

const AttributeModal = ({
  openTheModal,
  closeTheModal,
  locals,
  groups,
  successToast,
  errorToast
}) => {
  const alphaDashNumeric = /^[a-zA-Z0-9-_ ]+$/;
  const navigate = useNavigate();

  const [modalIsOpen, setIsOpen] = useState(false);
  const [selectedGroups, setselectedGroups] = useState([]);
  const [selectedType, setSelectedType] = useState('Text');
  const [inputType, setInputType] = useState('text');
  const [typeLabel, setTypeLabel] = useState('Length');
  const [minMaxInputType, setMinMaxInputType] = useState('number');
  const [textArea, setTextArea] = useState(false);
  const [required, setRequired] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');
  const [unit, setUnit] = useState('');
  const [nameErr, setNameErr] = useState(false);
  const [descriptionErr, setDescriptionErr] = useState(false);
  const [defaultValueErr, setDefaultValueErr] = useState(false);
  const [minErr, setMinErr] = useState(false);
  const [maxErr, setMaxErr] = useState(false);
  const [unitErr, setUnitErr] = useState(false);
  const [labelsErr, setLabelsErr] = useState(false);
  const [choiceErr, setChoiceErr] = useState(false);
  const [choice, setChoice] = useState('');
  const [choices, setChoices] = useState([]);
  const [labels, setLabels] = useState([]);

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
      }
    } catch (e) {
      errorToast();
    }
  };

  const handleTypeClick = (type) => {
    setSelectedType(type);
    setInputType('text');
    setMinMaxInputType('text');
    setTypeLabel('Length');
    if (type === 'Number') {
      setInputType('number');
      setTypeLabel('Number');
    } else if (type === 'Date') {
      setInputType('date');
      setMinMaxInputType('date');
      setTypeLabel('Date');
    } else if (type === 'Date Time') {
      setInputType('datetime-local');
      setMinMaxInputType('datetime-local');
      setTypeLabel('Date Time');
    } else if (type === 'Text Area') {
      setTextArea(true);
    } else {
      setTypeLabel('Length');
      setInputType('text');
      setTextArea(false);
    }
    renderInput();
  };

  const addChoice = (e) => {
    setChoiceErr('');
    e.preventDefault();
    if (choice.trim().length > 2) {
      setChoices((prev) => [...prev, { id: nanoid(), choice }]);
      setChoice('');
    } else {
      setChoiceErr('Choice must be at least 2 characters');
    }
  };

  const handleDeleteChoice = (id) => {
    setChoices((prev) => prev.filter((choice) => choice.id !== id));
  };

  const handleChange = (selectedGroups) => {
    setselectedGroups(selectedGroups);
  };

  useEffect(() => {
    setIsOpen(openTheModal);
  }, [openTheModal]);

  // const openModal = () => setIsOpen(true);
  const closeModal = () => {
    setIsOpen(false);
    closeTheModal();
  };

  const renderInput = () => {
    if (textArea) {
      return (
        <textarea
          id="default"
          type={inputType}
          className="modal-input "
          style={{ height: '4rem' }}
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value.trim())}
        ></textarea>
      );
    } else {
      return (
        <input
          id="default"
          type={inputType}
          className="modal-input "
          value={defaultValue}
          onChange={(e) => setDefaultValue(e.target.value.trim())}
        />
      );
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let canSubmit = true;

    setNameErr(false);
    setDescriptionErr(false);
    setDefaultValueErr(false);
    setMinErr(false);
    setMaxErr(false);
    setUnitErr(false);
    setLabelsErr(false);
    setChoiceErr(false);

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

    if (unit !== '' && unit.search(alphaDashNumeric) === -1) {
      setUnitErr(
        'Unit field must contains only letters, numbers, space, dash and underscore'
      );
      canSubmit = false;
    }

    if (unit !== '' && unit.length < 2) {
      setUnitErr('Unit must be at least 2 characters');
      canSubmit = false;
    }
    if (unit !== '' && unit.length > 50) {
      setUnitErr('Unit must not exceed 50 characters');
      canSubmit = false;
    }

    // Default value validation
    if (selectedType === 'Number') {
      if (defaultValue !== '' && defaultValue.length < 1) {
        setDefaultValueErr('Default value field minimum value is 1');
        canSubmit = false;
      }

      if (defaultValue !== '' && defaultValue.length > 10000000000) {
        setDefaultValueErr('Default value field maximum value is 10000000000');
        canSubmit = false;
      }
    } else {
      if (defaultValue !== '' && defaultValue.length < 2) {
        setDefaultValueErr('Default value field minimum length is 2 letters');
        canSubmit = false;
      }
      if (defaultValue !== '' && defaultValue.length > 250) {
        setDefaultValueErr('Default value field maximum length is 250 letters');
        canSubmit = false;
      }
    }

    if (min !== '' && min < 0) {
      setMinErr('Min must be positive');
      canSubmit = false;
    }
    if (max !== '' && max < 0) {
      setMaxErr('Max must be positive');
      canSubmit = false;
    }
    if (max !== '' && max !== '' && min > max) {
      setMaxErr('Max must be greater than min');
      canSubmit = false;
    }

    // Validate Labels
    labels.forEach(({ id, label }) => {
      if (label !== '' && label.length < 2) {
        setLabelsErr('Label must be at least 2 characters');
        canSubmit = false;
      }
    });

    if (!Object.keys(labels).includes('0')) {
      setLabelsErr('English label is required');
      canSubmit = false;
    }

    if (canSubmit) {
      const newData = {
        type: selectedType,
        name,
        description,
        required,
        defaultValue,
        min,
        max,
        unit,
        locals: labels,
        choices: choices.map((c) => c.choice),
        groups: selectedGroups.map((g) => g.value)
      };

      postAttribute(newData);
    } else {
      // console.log('Errs happened');
    }
  };

  const handleLabels = (id, label) => {
    const newLabel = { id, label };
    setLabels((prev) =>
      prev.find((label) => label.id === id)
        ? prev.map((label) => (label.id === id ? newLabel : label))
        : prev.concat(newLabel)
    );
  };

  return (
    <>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Example Modal"
      >
        <div className="border-b  border-nex p-1 flex justify-between ">
          <h2 className="text-nex font-bold text-xl">Create Attribute</h2>
          <button
            onClick={closeModal}
            className=" text-xl font-bold p-2 rounded-full w-8 h-8 m-2 relative -top-5"
          >
            <AiOutlineClose className="h-6 w-6" />
          </button>
        </div>
        <div className="flex justify-between flex-wrap border border-gray-500 my-4 rounded-lg text-center p-1 bg-gray-50">
          {[
            'Text',
            'Number',
            'Email',
            'Text Area',
            'Date',
            'Date Time',
            'Images',
            'Switch',
            'Radio Buttons',
            'Check Boxes',
            'Single Select',
            'Multiple Select'
          ].map((type) => (
            <button
              key={type}
              className={`create-btn ${
                selectedType === type ? ' bg-gray-300' : ''
              }`}
              onClick={() => handleTypeClick(type)}
            >
              <AttributeType type={type} />
            </button>
          ))}
        </div>
        <form onSubmit={(e) => handleSubmit(e)}>
          <div className="border-nex border rounded-lg p-3 flex flex-col sm:flex-row bg-gray-50">
            <div className="w-full md:w-1/2 p-1">
              <ModalHeader header="Properties" />

              <div className="my-2">
                <label htmlFor="name" className="modal-label">
                  Name :
                </label>
                <input
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

              <ModalHeader header="Options" />
              <div className="my-2">
                <label
                  htmlFor="required"
                  className="modal-label relative -top-2 sm:-top-3"
                >
                  Required :
                </label>
                <input
                  id="required"
                  type="checkbox"
                  className="w-8 h-8 "
                  value={required}
                  onChange={() => setRequired(!required)}
                />
              </div>

              {['Text', 'Number', 'Text Area'].includes(selectedType) && (
                <>
                  <div className="my-2">
                    <label
                      htmlFor="default"
                      className={`modal-label ${
                        textArea ? ' relative bottom-10' : ''
                      }`}
                    >
                      Default Value:
                    </label>
                    {renderInput()}
                    {defaultValueErr && (
                      <p className="form-err">{defaultValueErr}</p>
                    )}
                  </div>

                  <div className="my-2 ">
                    <label htmlFor="min" className="modal-label ">
                      Min {typeLabel}:
                    </label>
                    <input
                      id="min"
                      type={minMaxInputType}
                      className="modal-input "
                      value={min}
                      onChange={(e) => setMin(e.target.value.trim())}
                    />
                    {minErr && <p className="form-err">{minErr}</p>}
                  </div>

                  <div className="my-2 ">
                    <label htmlFor="max" className="modal-label ">
                      Max {typeLabel}:
                    </label>
                    <input
                      id="max"
                      type={minMaxInputType}
                      className="modal-input "
                      value={max}
                      onChange={(e) => setMax(e.target.value.trim())}
                    />
                    {maxErr && <p className="form-err">{maxErr}</p>}
                  </div>

                  <div className="my-2 ">
                    <label htmlFor="unit" className="modal-label ">
                      Unit (suffix) :
                    </label>
                    <input
                      id="unit"
                      type="text"
                      className="modal-input "
                      value={unit}
                      onChange={(e) => setUnit(e.target.value.trim())}
                    />
                    {unitErr && <p className="form-err">{unitErr}</p>}
                  </div>
                </>
              )}
            </div>
            <div className="w-full md:w-1/2 p-1 md:border-l ">
              <ModalHeader header="Labels" />
              {locals.map(({ id, abbreviation, name, direction }) => (
                <div className="my-2" key={id}>
                  <label htmlFor={abbreviation} className="modal-label">
                    {name} :
                  </label>
                  <input
                    id={abbreviation}
                    type="text"
                    dir={direction}
                    className="modal-input "
                    value={locals.find((l) => l.id === id).value}
                    onChange={(e) => handleLabels(id, e.target.value.trim())}
                  />
                </div>
              ))}
              {labelsErr && <p className="form-err">{labelsErr}</p>}

              <ModalHeader header="Groups" />
              <Select
                isMulti
                className="my-6 border-nex border rounded w-[80%] mx-auto"
                value={selectedGroups}
                onChange={handleChange}
                options={groups}
              />
              {[
                'Radio Buttons',
                'Check Boxes',
                'Single Select',
                'Multiple Select'
              ].includes(selectedType) && (
                <>
                  <ModalHeader header="Choices" />
                  <div className="my-2 ">
                    <label htmlFor="name" className="modal-label">
                      Add Choice :
                    </label>
                    <input
                      id="name"
                      type="text"
                      className="modal-input"
                      onChange={(e) => setChoice(e.target.value.trim())}
                      value={choice}
                    />
                    <button
                      onClick={addChoice}
                      className="bg-gray-100 p-2 border border-nex rounded-md sm:inline-block mx-auto sm:mx-2 block px-8 sm:px-2"
                    >
                      Add
                    </button>
                    {choiceErr && <p className="form-err">{choiceErr}</p>}

                    <div className="my-2">
                      <div className="p-2 w-full">
                        {choices.map(({ id, choice }) => (
                          <span
                            key={id}
                            className="border border-nex rounded-md bg-gray-50 m-1 p-2 inline-block"
                          >
                            {choice}
                            <button
                              className="inline-block bg-red-500 text-white rounded-full w-6 ml-2"
                              onClick={() => handleDeleteChoice(id)}
                            >
                              x
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="text-center my-4">
            <button className="nex-btn" type="submit">
              Save Attribute
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AttributeModal;
