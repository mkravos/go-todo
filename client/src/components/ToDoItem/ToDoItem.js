import "./ToDoItem.css";
import React, {useState} from 'react';

export default function ToDoItem({id, text, created}) {
    return (
        <div className="Todo-item">
            <div className="Todo-content">
                <div className="Todo-text">Text</div>
                <div className="Todo-datetime">Created 10/21/2022 at 11:28</div>
            </div>
            <div className="Todo-controls">
                <button className="Edit-item-btn">Edit</button>
                <button className="Delete-item-btn">Delete</button>
            </div>
        </div>
    );
}