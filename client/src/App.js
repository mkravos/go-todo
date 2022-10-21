import './App.css';
import React, {useState} from "react";
import ToDoItem from "./components/ToDoItem/ToDoItem"

function App() {
  const [ items, setItems ] = useState();
  const [ text, setText ] = useState("");
  const [ created, setCreated ] = useState("");
  
  var [ editCount, setEditCount ] = useState(0);
  var addingDisabled = false;

  if(editCount > 0) {
    addingDisabled = true;
  } else {
    addingDisabled = false;
  }

  const handleChange = e => {
    setText(e.target.value);
    setCreated(new Date());
  }

  const getItems = async () => {
    try {
      const res = await fetch("http://localhost:8081/api/get-todo-items/", {
        method: "GET"
      });

      const parseRes = await res.json();
      return parseRes;
    } catch (err) {
      console.error(err.message);
    }
  }
  function getItemList() {
    getItems()
    .then(value => {
      setItems(value);
    });
  }
  if(!items) {
    getItemList();
  }

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/api/add-todo-item/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"text": text, "created": created})
      });

      const parseRes = await res.json();
      getItemList();
      setText("");
      return parseRes;
    } catch (err) {
      console.error(err.message);
    }
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="Header-title">
          To Do
        </div>
      </header>
      <div className="App-body">
        <div className="Todo-container">
          <div>
              <form onSubmit={handleSubmit}>
                  <input 
                    className="Add-todo" 
                    placeholder={editCount < 1 ? "Enter a reminder and press return" : "Press return to submit your edits"} 
                    type="text"
                    name="text"
                    value={text}
                    onChange={handleChange}
                    disabled = {addingDisabled}
                    required
                  />
              </form>
          </div>
          {
            items ? 
              items.sort((a, b) => {
                let date1 = undefined;
                let date2 = undefined;
            
                if (a.created) date1 = new Date(a.created);
                if (b.created) date2 = new Date(b.created);
            
                if (date1 === undefined) {
                  return 1;
                } else if (date2 === undefined) {
                  return -1;
                } else if (date1 === date2) {
                  return 0;
                } else {
                  return date1 - date2;
                }
              }).reverse().map((val, key) => {
                return (
                  <ToDoItem 
                    key={key} 
                    id={val.id} 
                    text={val.text} 
                    created={val.created} 
                    getItemList={getItemList} 
                    setEditCount={setEditCount}
                    editCount={editCount}
                  />
                );
              })
            : null
          }
        </div>
      </div>
    </div>
  );
}

export default App;
