import "./ToDoItem.css";
import React, {useState} from "react";

export default function ToDoItem({id, text, created, getItemList, setAddingDisabled}) {
    const [ editingText, setEditingText ] = useState(false);
    const [ editBtnText, setEditBtnText ] = useState("Edit");
    const [ newText, setNewText ] = useState("");

    var date = new Date(created);

    const handleDelete = async e => {
        e.preventDefault();
        try {
          const res = await fetch("http://localhost:8081/api/delete-todo-item/", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({"id": id})
          });
    
          const parseRes = await res.json();
          getItemList();
          return parseRes;
        } catch (err) {
          console.error(err.message);
        }
    }

    const handleEdit = async e => {
        e.preventDefault();
        if(!editingText) {
            setEditingText(true);
            setAddingDisabled(true);
            setEditBtnText("Cancel");
            setNewText(text);
        }
        else {
            setEditingText(false);
            setAddingDisabled(false);
            setEditBtnText("Edit");
        }
    }

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
            getItemList();
            setEditBtnText("Edit");
            setAddingDisabled(false);
            return parseRes;
          } catch (err) {
            console.error(err.message);
          }
    }

    return (
        <div className="Todo-item">
            <div className="Todo-content">
                {
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
                <button className="Delete-item-btn" onClick={handleDelete}>Delete</button>
            </div>
        </div>
    );
}