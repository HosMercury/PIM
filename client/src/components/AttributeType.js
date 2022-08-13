import React, { useState } from 'react';
import { IoMdSwitch } from 'react-icons/io';
import { TiSortNumerically } from 'react-icons/ti';
import { MdAlternateEmail } from 'react-icons/md';
import { BiTimeFive } from 'react-icons/bi';
import { IoImagesOutline } from 'react-icons/io5';
import {
  BsMenuButtonWideFill,
  BsFillMenuAppFill,
  BsUiChecks,
  BsUiRadios,
  BsCalendar2Date,
  BsTextareaResize,
  BsInputCursorText
} from 'react-icons/bs';

const map = {
  Text: BsInputCursorText,
  Number: TiSortNumerically,
  Email: MdAlternateEmail,
  'Text Area': BsTextareaResize,
  Date: BsCalendar2Date,
  'Date Time': BiTimeFive,
  Images: IoImagesOutline,
  Switch: IoMdSwitch,
  'Radio Buttons': BsUiRadios,
  'Check Boxes': BsUiChecks,
  'Single Select': BsFillMenuAppFill,
  'Multiple Select': BsMenuButtonWideFill
};

const AttributeType = ({ type, selectedType }) => {
  const Component = map[type];

  return (
    <>
      {Component ? <Component className="type-icon" /> : `Error`}
      <p className="font-bold mt-1 text-center w-full">{type}</p>
    </>
  );
};

export default AttributeType;
