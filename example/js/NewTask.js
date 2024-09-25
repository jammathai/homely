import { Component } from "./homely.js";
import Task from "./Task.js";

import { addTask } from "./main.js";

export default class NewTask extends Component {
  constructor() {
    super(`
      <fieldset style="
        display: inline-block;
        border: 1px solid #d0d0d0;
        border-radius: 4px;
      ">
        <legend style="font-weight: bold;">New Task</legend>
        <label>Name: <input data-name="name"></label>
        <label>Due date: <input data-name="date" type="datetime-local"></label>
        <button data-name="add">Add task</button>
      </fieldset>
    `);

    this.add.onclick = () => {
      addTask(new Task(this.name.value, new Date(this.date.value)));
    };
  }
}
