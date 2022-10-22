import './App.css';
import React, {useState} from "react";
import ToDoItem from "./components/ToDoItem/ToDoItem"

function App() {
  const [ items, setItems ] = useState([]); // to do items list
  const [ text, setText ] = useState(""); // to do item text
  const [ created, setCreated ] = useState(""); // to do item creation date

  // maintain count for how many elements are being edited
  var [ editCount, setEditCount ] = useState(0);
  var addingDisabled = false;

  // prevent adding new todo items while editing existing ones
  //   this prevents buggy item adding behavior
  if(editCount > 0) {
    addingDisabled = true;
  } else {
    addingDisabled = false;
  }

  // update text and creation date when called
  const handleChange = e => {
    setText(e.target.value);
    setCreated(new Date());
  }

  // get all todo items from database
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

  // update state of item list without refreshing
  function getItemList() {
    getItems()
    .then(value => {
      setItems(value);
    });
  }
  if(!items) {
    getItemList();
  }

  // submits the "add todo item" form and sends new todo entry to the database
  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8081/api/add-todo-item/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({"text": text, "created": created})
      });

      const parseRes = await res.json();
      getItemList(); // update state without refreshing
      setText(""); // reset state of text field
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
                // sorts todo items in a descending fashion based on date of creation
                // before mapping them to the frontend component

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
                    id={val.id} // todo item id
                    text={val.text} // todo item text field
                    created={val.created}  // todo item creation date
                    getItemList={getItemList} // todo item component calls this to update the state of the item list
                    setEditCount={setEditCount} // pass this to prevent adding new todo items while editing an entry
                    editCount={editCount} // prop threading is used for parent to keep track of how many items are being edited
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
