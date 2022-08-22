import React from 'react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import { nanoid } from 'nanoid';

const Show = ({ data }) => {
  const renderDate = (key) => {
    if (key === 'created_at' || key === 'updated_at') {
      return format(new Date(data[key]), "dd-MM-yyyy hh:mm aaaaa'm'");
    } else {
      return data[key];
    }
  };

  const renderCollection = (header, data) => {
    return Object.entries(data).map(([k, v]) => {
      if (typeof v === 'string') {
        return (
          <span
            className="font-bold text-nex border rounded bg-gray-100 p-2 m-2 inline-block "
            key={nanoid()}
          >
            {v}
          </span>
        );
      } else {
        if (header === 'locals') {
          return (
            <p className="p-2 m-2 border bg-gray-100 rounded " key={nanoid()}>
              <strong className="mx-2 text-nex">{v.name} </strong>
              {v.local || ''}
            </p>
          );
        } else {
          return (
            <Link to={`/${header}/${v.id}`} key={nanoid()}>
              <span className="p-2 m-2 border bg-gray-100 rounded inline-block">
                {v.name}
              </span>
            </Link>
          );
        }
      }
    });
  };

  return (
    <>
      <table className="w-[100%] px-2  text-center font-bold  border-nex border-t-4 ">
        <tbody>
          {Object.keys(data).map((key) => {
            return (
              typeof data[key] !== 'object' &&
              data[key] !== '' &&
              data[key] !== undefined && (
                <tr key={nanoid()} className="border border-collapse">
                  <td className="p-2 text-nex border">
                    {key.replace('_', ' ').toUpperCase()}
                  </td>
                  <td>{renderDate(key)}</td>
                </tr>
              )
            );
          })}
        </tbody>
      </table>

      {Object.keys(data).map((key) => {
        return (
          typeof data[key] === 'object' &&
          data[key] !== null && (
            <div
              className="my-6 border w-[100%] m-auto text-center px-2 font-bold border-t-4 border-t-nex rounded"
              key={nanoid()}
            >
              <h2 className="text-nex py-2  border  bg-gray-200">
                {key.toUpperCase()}
              </h2>
              {data[key] ? (
                <div className=" flex flex-wrap justify-center">
                  {renderCollection(key, data[key])}
                </div>
              ) : (
                <p className="my-2 text-gray-400">{`No ${key} for this item`}</p>
              )}
            </div>
          )
        );
      })}
    </>
  );
};

export default Show;
