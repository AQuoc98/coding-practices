const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const status = document.querySelector('#status');
const storageKey = 'coding-practices-todos';
let tasks = [];

try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) {
    tasks = saved.filter(task => task && typeof task.text === 'string' && typeof task.done === 'boolean');
  }
} catch {
  status.textContent = 'Saved tasks could not be loaded.';
}

function save() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(tasks));
    return true;
  } catch {
    status.textContent = 'Changes could not be saved in this browser.';
    return false;
  }
}

function announce(message) {
  if (save()) status.textContent = message;
}

function render() {
  list.replaceChildren();
  empty.hidden = tasks.length > 0;
  tasks.forEach((task, index) => {
    const item = document.createElement('li');
    item.classList.toggle('done', task.done);
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${index}`;
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => {
      task.done = checkbox.checked;
      item.classList.toggle('done', task.done);
      announce(task.done ? 'Task completed.' : 'Task marked incomplete.');
    });
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    const edit = document.createElement('button');
    edit.type = 'button';
    edit.className = 'secondary';
    edit.textContent = 'Edit';
    edit.setAttribute('aria-label', `Edit ${task.text}`);
    edit.addEventListener('click', () => {
      const field = document.createElement('input');
      field.type = 'text';
      field.maxLength = 200;
      field.value = task.text;
      field.setAttribute('aria-label', 'Edit task');
      const saveButton = document.createElement('button');
      saveButton.type = 'button';
      saveButton.textContent = 'Save';
      const cancel = document.createElement('button');
      cancel.type = 'button';
      cancel.className = 'secondary';
      cancel.textContent = 'Cancel';
      function finish() {
        const value = field.value.trim();
        if (!value) {
          field.setCustomValidity('Enter a task.');
          field.reportValidity();
          return;
        }
        task.text = value;
        announce('Task updated.');
        render();
        list.children[index].querySelector('button').focus();
      }
      field.addEventListener('input', () => field.setCustomValidity(''));
      field.addEventListener('keydown', event => {
        if (event.key === 'Enter') finish();
        if (event.key === 'Escape') { render(); list.children[index].querySelector('button').focus(); }
      });
      saveButton.addEventListener('click', finish);
      cancel.addEventListener('click', () => { render(); list.children[index].querySelector('button').focus(); });
      item.replaceChildren(field, saveButton, cancel);
      field.focus();
      field.select();
    });
    const remove = document.createElement('button');
    remove.type = 'button';
    remove.className = 'secondary';
    remove.textContent = 'Delete';
    remove.setAttribute('aria-label', `Delete ${task.text}`);
    remove.addEventListener('click', () => {
      tasks.splice(index, 1);
      announce('Task deleted.');
      render();
      input.focus();
    });
    item.append(checkbox, label, edit, remove);
    list.append(item);
  });
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.setCustomValidity('Enter a task.');
    input.reportValidity();
    return;
  }
  tasks.push({ text, done: false });
  announce('Task added.');
  input.value = '';
  render();
  input.focus();
});
input.addEventListener('input', () => input.setCustomValidity(''));
render();
