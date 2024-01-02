
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function Table() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [registerUser, setRegisterUser] = useState('');
  const [registerpassword, setRegisterPassword] = useState('');
  const [token, setToken] = useState('');
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New state for loading indicator
  const [newEntry, setNewEntry] = useState(null);




  const handleStatusChange = (e, index) => {
    const newData = [...data];
    newData[index].status = e.target.value;
    setData(newData);
  };

  const handleUpdate = (index) => {
    setEditingIndex(index);
    const newData = [...data];
    newData[index].previousStatus = newData[index].status;
    setData(newData);
  };



  const handleInputChange = (e, field, index) => {
    const newData = [...data];
    newData[index][field] = e.target.value;
    setData(newData);
  };



  const handleAddEntry = () => {
    const newEntryData = {
      title: '', // Set default title or empty string
      description: '', // Set default description or empty string
      role: '', // Set default role or empty string
      status: 'assigned', // Set default status or any desired value
    };

    setNewEntry(newEntryData);
  };
  const handleSave = async (index) => {
    const editedItem = data[index];

    try {
      const response = await axios.put(
        `http://localhost:4300/tasks/${editedItem.id}`,
        editedItem, // Send the entire editedItem object
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        }
      );
      if (response.status === 200) {
        setEditingIndex(null);
        // Handle success
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
  };
 


  const handleDelete = async (index) => {
    const itemToDelete = data[index];
  
    try {
      const response = await axios.delete(
        `http://localhost:4300/tasks/${itemToDelete.id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            authorization: token,
          },
        }
      );
  
      if (response.status === 200) {
        const updatedData = [...data];
        updatedData.splice(index, 1); // Remove the deleted item from the array
        setData(updatedData); // Update the state to reflect the deletion
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
  };




 


  const handleLogin = async () => {
    try {
      const response = await axios.post('http://localhost:4300/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const { token } = response.data;
        localStorage.setItem('authorization', token);
        setToken(token);
        setIsLoggedIn(true);
      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      console.error(error);
    }
  };


  const handleRegister = async () => {
    try {
      const response = await axios.post('http://localhost:4300/register', {
        username,
        password,
      });
  
      if (response.status === 201) {
        // Handle successful registration
        console.log('Registration successful!');
        // You might choose to automatically log in the user after registration
        handleLogin();
      } else {
        throw new Error('Registration failed');
      }
    } catch (error) {
      console.error(error);
      // Handle error during registration
    }
  };



  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('authorization');
    setToken('');
    setData([]);
  };

  
  useEffect(() => {
    const storedToken = localStorage.getItem('authorization');
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const tableContainerRef = useRef(null);


    const fetchData = async () => {
      if (!token) return;
  
      try {
        setIsLoading(true);
        const response =  await axios.get('http://localhost:4300/tasks', {
          headers: {
            authorization: token,
          },
        });
  
        if (response.status === 200) {
          const json = response.data;
          setData(json);
        
        } else {
          throw new Error('Failed to fetch tasks');
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };
  


  const handleAddNewEntry = async () => {
    try {
      const response = await axios.post('http://localhost:4300/tasks', newEntry, {
        headers: {
          'Content-Type': 'application/json',
          authorization: token,
        },
      });
  
      if (response.status === 201) {
        const newEntryData = {
          title: '',
          description: '',
          role: '',
          status: 'assigned',
        };
  
        setData([...data, newEntryData]); // Update the data with the new entry
        setNewEntry(null); // Reset the new entry state after adding it
        fetchData(); // Fetch updated data and refresh the table
      } else {
        // Handle error
      }
    } catch (error) {
      // Handle error
    }
  };
  

  useEffect(()=>{
  fetchData();
  },[token])
  useEffect(() => {
    if (tableContainerRef.current) {
      tableContainerRef.current.scrollTop = tableContainerRef.current.scrollHeight;
    }
  }, [data]);

  return (
    <>

    
    <div style={{ fontFamily: 'Arial, sans-serif' }}>
      {!isLoggedIn ? (
        <div>
        <h2>Login Section</h2>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={handleLogin}>Login</button>
          <h1>Before Login Register YourSelf</h1>
          <hr />
    <h2>Register</h2>
    <input
      type="text"
      placeholder="Username"
      value={registerUser}
      onChange={(e) => setRegisterUser(e.target.value)}
    />
    <input
      type="password"
      placeholder="Password"
      value={registerpassword}
      onChange={(e) => setRegisterPassword(e.target.value)}
    />
    <button onClick={handleRegister}>Register</button>
  </div>
      ) : (
        <>
        <div style={{ fontFamily: 'Arial, sans-serif', height: '500px', overflowY: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', width: '100%' }}>

            <thead>

              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={tableHeaderStyle}>id</th>
                <th style={tableHeaderStyle}>title</th>
                <th style={tableHeaderStyle}>description</th>

                <th style={tableHeaderStyle}>status</th>
                <th style={tableHeaderStyle}>Edit</th>
              </tr>
            </thead>
            <tbody>
              
              {data.map((item, index) => (
                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tableCellStyle}>
                    {editingIndex === index ? (
                      <input
                        value={item.id}
                        onChange={(e) => handleInputChange(e, 'id', index)}
                        style={inputStyle}
                      />
                    ) : (
                      item.id
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingIndex === index ? (
                      <input
                        value={item.title}
                        onChange={(e) => handleInputChange(e, 'title', index)}
                        style={inputStyle}
                      />
                    ) : (
                      item.title
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingIndex === index ? (
                      <input
                        value={item.description}
                        onChange={(e) => handleInputChange(e, 'description', index)}
                        style={inputStyle}
                      />
                    ) : (
                      item.description
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingIndex === index ? (
                      <select
                        value={item.status}
                        onChange={(e) => handleStatusChange(e, index)}
                        style={inputStyle}
                      >
                        <option value="assigned">Assigned</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                      </select>
                    ) : (
                      <td
                        value={item.status}
                        onChange={(e) => handleStatusChange(e, index)}
                        style={inputStyle}
                      >
                        {item.status}
                      </td>
                    )}
                  </td>
                  <td style={tableCellStyle}>
                    {editingIndex === index ? (
                      <button onClick={() => handleSave(index)} style={buttonStyle}>
                        Save
                      </button>
                    ) : (
                      <button onClick={() => handleUpdate(index)} style={buttonStyle}>
                        Edit
                      </button>
                    )}
                  <button onClick={() => handleDelete(index)}>delete</button>

                  </td>
                </tr>
              ))}
              {newEntry && (
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  {/* Input fields for the new entry */}
                  <td style={tableCellStyle}>
                    <input
                      disabled
                    />
                  </td>
                  <td style={tableCellStyle}>
                    <input
                      value={newEntry.title}
                      onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                      style={inputStyle}
                    />
                  </td>
                  <td style={tableCellStyle}>
                    <input
                      value={newEntry.description}
                      onChange={(e) => setNewEntry({ ...newEntry, description: e.target.value })}
                      style={inputStyle}
                    />
                  </td>
                  <select
                    value={newEntry.status}
                    onChange={(e) => setNewEntry({ ...newEntry, status: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="assigned">Assigned</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="missed">Missed</option>
                  </select>
                  <td style={tableCellStyle}>
                    <button onClick={handleAddNewEntry} style={buttonStyle}>
                      Save New Entry
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
            </tfoot>
          </table>


        </div>
        <button style={buttonStyle} onClick={handleAddEntry}>Add New Entry</button>

<button onClick={handleLogout}>Logout</button>
</>
        
      )}
    
{isLoading && <div>Loading...</div>}

    </div>
    
    
    </>


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