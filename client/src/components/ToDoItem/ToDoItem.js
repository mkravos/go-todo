import "./ToDoItem.css";
import React, {useState} from "react";

export default function ToDoItem({id, text, created, getItemList, editCount, setEditCount}) {
    // flag for switching between text field and plain text when editing an item
    const [ editingText, setEditingText ] = useState(false);

    // used to control the "edit" button's text value
    const [ editBtnText, setEditBtnText ] = useState("Edit");

    // used to control the todo text input field's value when editing a todo item
    const [ newText, setNewText ] = useState(""); 

    // used to enable and disable item deletion when editing an item
    const [ deletingDisabled, setDeletingDisabled ] = useState(false); 

    // generates a date from the "created" string parameter
    var date = new Date(created);

    // handles deletion of a todo item and updates the todo list state
    const handleDelete = async e => {
        e.preventDefault();
        try {
          const res = await fetch("http://localhost:8081/api/delete-todo-item/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id})
          });
    
          const parseRes = await res.json();
          getItemList(); // update the todo list state
          return parseRes;
        } catch (err) {
          console.error(err.message);
        }
    }

    // handles switching between input field and plain text div when edit is selected or deselected
    // also handles edit count for edit tracking in the parent
    const handleEdit = async e => {
        e.preventDefault();
        if(!editingText) {
            setEditingText(true); // set text editing to true
            setDeletingDisabled(true);
            setEditCount(editCount += 1); // increment the edit counter
            setEditBtnText("Cancel"); // change edit button text to "Cancel"
            setNewText(text); // set the input field to the existing todo item's value
        }
        else {
            setEditingText(false); // set text editing to false
            setDeletingDisabled(false);
            setEditCount(editCount -= 1); // decrement the edit counter
            setEditBtnText("Edit"); // reset edit button text
        }
    }

    // handles the submission of the edit todo item form
    const handleEditSubmit = async e => {
        e.preventDefault();
        setEditingText(false);
        try {
            const res = await fetch("http://localhost:8081/api/edit-todo-item/", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({"id": id, "text": newText})
            });
      
            const parseRes = await res.json();
            getItemList(); // update the todo list state
            setEditBtnText("Edit"); // reset edit button text
            setDeletingDisabled(false); // reset delete button
            return parseRes;
          } catch (err) {
            console.error(err.message);
          }
    }

    return (
        <div className="Todo-item">
            <div className="Todo-content">
                {
                    // if text editing is on, show an input field. otherwise, show plain text div.
                    editingText ? 
                        <form onSubmit={handleEditSubmit}>
                            <input className="Todo-inline-edit" type="text" value={newText} onChange={e => setNewText(e.target.value)} autoFocus required/>
                        </form>
                    : 
                        <div className="Todo-text" onClick={handleEdit}>{text}</div>
                }
                <div className="Todo-datetime">Created {date.toLocaleString()}</div>
            </div>
            <div className="Todo-controls">
                <button className="Edit-item-btn" onClick={handleEdit}>{editBtnText}</button>
                <button className="Delete-item-btn" onClick={handleDelete} disabled={deletingDisabled}>Delete</button>
            </div>
        </div>
    );
}