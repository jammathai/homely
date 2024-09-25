import { Component } from "./homely.js";
import { removeTask } from "./main.js";

export default class TaskComponent extends Component {
  constructor(task) {
    super(`
      <li data-name="li">
        <input type="checkbox" data-name="checkbox">
        <span style="font-weight: bold;">${task.name}</span>
        due ${task.date.toLocaleString()}
        <button data-name="remove">Remove</button>
      </li>
    `);

    if (task.done) {
      this.checkbox.setAttribute("checked", "");
      this.li.style.textDecoration = "line-through";
    }

    this.checkbox.onclick = () => {
      task.done = !task.done;
      this.li.style.textDecoration = task.done ? "line-through" : "none";
    };

    this.remove.onclick = () => {
      removeTask(task);
    };
  }
}
