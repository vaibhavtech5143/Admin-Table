import { useState, useEffect } from 'react';
import { TablePagination } from '@mui/base/TablePagination';

function Table() {

//pagination wala  part used Material Ui For this 
const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5);

// const handleChangePage = (event, newPage) => {
//   setPage(newPage);
// };

// const handleChangeRowsPerPage = (event) => {
//   setRowsPerPage(parseInt(event.target.value, 10));
//   setPage(0);
// };


  const [data, setData] = useState([]);
  const [sortedData, setSortedData] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filterValue, setFilterValue] = useState('');
  const [filteredData, setFilteredData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch('https://geektrust.s3-ap-southeast-1.amazonaws.com/adminui-problem/members.json');
      const json = await response.json();
      setData(json);
      setSortedData(json); 
      setFilteredData(json); 
    }
    fetchData();
  }, []);

  const sortData = () => {
    const direction = sortDirection === 'asc' ? 'desc' : 'asc';
    const sorted = [...sortedData].sort((a, b) => {
      if (a.role < b.role) {
        return direction === 'asc' ? -1 : 1;
      }
      if (a.role > b.role) {
        return direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
    setSortedData(sorted);
    setSortDirection(direction);
  };

  const handleDelete = (index) => {
    const newData = [...data];
    newData.splice(index, 1);
    setData(newData);
    setSortedData(newData); 
    setFilteredData(newData); 
  };

  const handleUpdate = (index) => {
    console.log('Update row with index:', index);
    setEditingIndex(index);
  };

  const handleSave = () => {
    setEditingIndex(null); //finished editing then reset the val for indx
  };

  const handleInputChange = (e, field, index) => {
    const newData = [...data];
    newData[index][field] = e.target.value;
    setData(newData);
  };

  const filterData = (value) => {
    setFilterValue(value);
    const filtered = data.filter((item) => {
      return (
        item.id.includes(value) ||
        item.name.toLowerCase().includes(value.toLowerCase()) ||
        item.email.toLowerCase().includes(value.toLowerCase()) ||
        item.role.toLowerCase().includes(value.toLowerCase())
      );
    });
    setFilteredData(filtered);
  };
  const handlePaginationChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const displayedData = filterValue ? filteredData : sortedData;
  const startIndex = page * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const paginatedData = displayedData.slice(startIndex, endIndex);


  // deleting multipel datas 
  const toggleSelectRow = (index) => {
    const selectedIndex = selectedRows.indexOf(index);
    let newSelectedRows = [];

    if (selectedIndex === -1) {
      newSelectedRows = newSelectedRows.concat(selectedRows, index);
    } else if (selectedIndex === 0) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(1));
    } else if (selectedIndex === selectedRows.length - 1) {
      newSelectedRows = newSelectedRows.concat(selectedRows.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelectedRows = newSelectedRows.concat(
        selectedRows.slice(0, selectedIndex),
        selectedRows.slice(selectedIndex + 1)
      );
    }

    setSelectedRows(newSelectedRows);
  };


  const handleDeleteSelected = () => {
    const newData = data.filter((item, index) => !selectedRows.includes(index));
    setData(newData);
    setSortedData(newData); 
    setFilteredData(newData); 
    setSelectedRows([]);
  };
  return  (
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      <input
        type="text"
        placeholder="Search For Particular thing..."
        value={filterValue}
        className='search-icon'
        onChange={(e) => filterData(e.target.value)}
        style={{ marginBottom: '15px', padding: '5px' }}
      />
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr style={{ backgroundColor: '#f2f2f2' }}>
          
            <th style={tableHeaderStyle}>id</th>
            <th style={tableHeaderStyle}>name</th>
            <th style={tableHeaderStyle}>email</th>
            <th style={{ ...tableHeaderStyle, cursor: 'pointer' }} onClick={sortData}>
              role {sortDirection !== 'asc' && sortDirection !== 'desc' && <span>&uarr;&darr;</span>}
              {sortDirection === 'asc' && <span>&uarr;</span>}
              {sortDirection === 'desc' && <span>&darr;</span>}
            </th>
            <th style={tableHeaderStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((item, index) => (
            <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
            <td style={{ paddingLeft: '10px' }}>
                <input
                  type="checkbox"
                  checked={selectedRows.includes(index)}
                  onChange={() => toggleSelectRow(index)}
                />
              </td>
              <td style={tableCellStyle}>{editingIndex === index ? <input value={item.id} onChange={(e) => handleInputChange(e, 'id', index)} style={inputStyle} /> : item.id}</td>
              <td style={tableCellStyle}>{editingIndex === index ? <input value={item.name} onChange={(e) => handleInputChange(e, 'name', index)} style={inputStyle} /> : item.name}</td>
              <td style={tableCellStyle}>{editingIndex === index ? <input value={item.email} onChange={(e) => handleInputChange(e, 'email', index)} style={inputStyle} /> : item.email}</td>
              <td style={tableCellStyle}>{editingIndex === index ? <input value={item.role} onChange={(e) => handleInputChange(e, 'role', index)} style={inputStyle} /> : item.role}</td>
              <td style={tableCellStyle}>
                {editingIndex === index ? <button onClick={handleSave} style={buttonStyle}>Save</button> : <button onClick={() => handleUpdate(index)} style={buttonStyle}>Edit</button>}
                <button onClick={() => handleDelete(index)} style={buttonStyle}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
        <tr>
          <td colSpan={5}>
          <button onClick={handleDeleteSelected}>Delete Selected</button>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, { label: 'All', value: -1 }]}
              colSpan={3}
              count={filteredData.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handlePaginationChange}
              onRowsPerPageChange={handleRowsPerPageChange}
            />
          </td>
        </tr>
      </tfoot>
      </table>
    </div>
  );
}

const tableHeaderStyle = {
  padding: '10px',
  textAlign: 'left',
  borderBottom: '1px solid #ddd',
};

const tableCellStyle = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const inputStyle = {
  width: '100%',
  padding: '8px',
  boxSizing: 'border-box',
};

const buttonStyle = {
  padding: '8px 12px',
  marginRight: '5px',
  backgroundColor: '#007bff',
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  cursor: 'pointer',
};

export default Table;


