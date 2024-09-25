import { Component, State } from "./homely.js";
import NewTask from "./NewTask.js";
import TaskComponent from "./TaskComponent.js";

const tasks = new State([]);

export function addTask(task) {
  let idx = tasks.value.findIndex(
    (value) => value.date.getTime() > task.date.getTime()
  );
  if (idx === -1) idx = tasks.value.length + 1;
  tasks.value = [...tasks.value.slice(0, idx), task, ...tasks.value.slice(idx)];
}

export function removeTask(task) {
  tasks.value = tasks.value.filter((value) => value !== task);
}

class App extends Component {
  constructor() {
    super(`
      <h1 style="font-size: 1.5rem;">To-do List</h1>
      {newTask}
      <ul style="list-style: none; padding: 0;">{taskComponents}</ul>
    `);

    this.newTask = new NewTask();
    this.taskComponents = new State([]);

    tasks.addEffect(() => {
      this.taskComponents.value = tasks.value.map(
        (task) => new TaskComponent(task)
      );
    });
  }
}

window.onload = () => {
  new App().appendTo(document.body);
};
