import React from 'react';
import {
  useSortBy,
  useTable,
  useGlobalFilter,
  usePagination
} from 'react-table';
import { useNavigate } from 'react-router-dom';

function Table({ columns, data, name, children }) {
  const navigate = useNavigate();

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    pageOptions,
    gotoPage,
    pageCount,
    setPageSize,
    page,
    prepareRow,
    state,
    setGlobalFilter
  } = useTable(
    {
      columns,
      data
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { globalFilter, pageIndex, pageSize } = state;

  return (
    <div className="my-4 mb-8  ">
      <div className="flex justify-between sm:w-full ">
        <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} />
        {children}
      </div>
      <div className="overflow-x-auto w-screen sm:w-full">
        <table
          {...getTableProps()}
          className="border-spacing-0	border border-collapse my-2 text-center table-fixed sm:w-full"
        >
          <thead>
            {headerGroups.map((headerGroup) => (
              <tr
                {...headerGroup.getHeaderGroupProps()}
                className="bg-nex text-white"
              >
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps(column.getSortByToggleProps())}
                    className="py-4 px-6 font-xs sm:font-base min-w-20"
                  >
                    {column.render('header')}
                    <span>
                      {column.isSorted
                        ? column.isSortedDesc
                          ? ' 🔽'
                          : ' 🔼'
                        : ''}
                    </span>
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row) => {
              prepareRow(row);
              return (
                <tr
                  {...row.getRowProps()}
                  className="border-b border-collapse cursor-pointer"
                  onClick={() => navigate(`/${name}/${row.values.id}`)}
                >
                  {row.cells.map((cell) => {
                    return (
                      <td {...cell.getCellProps()} className="p-2">
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className=" text-end text-nex ">
        <span>
          Page{' '}
          <strong>
            {pageIndex + 1}/{pageOptions.length}
          </strong>
        </span>
        <span className="mx-2">
          - Go to page
          <input
            type="number"
            min="1"
            defaultValue={pageIndex + 1}
            onChange={(e) => {
              const pageNumber = e.target.value
                ? parseInt(e.target.value) - 1
                : 0;
              gotoPage(pageNumber);
            }}
            className="sm:mx-2 border rounded-lg px-1 w-12 border-nex h-8"
          />
        </span>
        <select
          value={pageSize}
          onChange={(e) => setPageSize(parseInt(e.target.value))}
          className="table-btn"
        >
          {[10, 25, 50].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              Show {pageSize}
            </option>
          ))}
        </select>
        <button
          onClick={() => gotoPage(0)}
          disabled={!canPreviousPage}
          className="table-btn"
        >
          {'<<'}
        </button>
        <button
          onClick={() => previousPage()}
          disabled={!canPreviousPage}
          className="table-btn"
        >
          {'<'}
        </button>
        <button
          onClick={() => nextPage()}
          disabled={!canNextPage}
          className="table-btn"
        >
          {'>'}
        </button>
        <button
          onClick={() => gotoPage(pageCount - 1)}
          disabled={!canNextPage}
          className="table-btn"
        >
          {'>>'}
        </button>
      </div>
    </div>
  );
}

const GlobalFilter = ({ filter, setFilter }) => {
  return (
    <span className="font-bold text-nex">
      Search :{' '}
      <input
        value={filter || ''}
        onChange={(e) => setFilter(e.target.value)}
        className="border p-1 rounded-lg border-nex w-40 sm:w-80"
      />
    </span>
  );
};

export default Table;
