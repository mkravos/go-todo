import './App.css';
import ToDoItem from "./components/ToDoItem/ToDoItem"

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="Header-title">
          To Do
        </div>
      </header>
      <body className="App-body">
        <div className="Todo-container">
          <div>
              <form>
                  <input className="Add-todo" placeholder="Enter a reminder and press return" type="text"></input>
              </form>
          </div>
          <ToDoItem/>
        </div>
      </body>
    </div>
  );
}

export default App;
