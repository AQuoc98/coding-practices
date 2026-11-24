const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const filter = document.querySelector('#todo-filter');
const status = document.querySelector('#status');
let tasks = [];

function announce(message) {
  status.textContent = message;
}

function render() {
  list.replaceChildren();
  const query = filter.value.trim().toLocaleLowerCase();
  const visibleTasks = tasks.filter(task => task.text.toLocaleLowerCase().includes(query));
  empty.hidden = visibleTasks.length > 0;
  empty.textContent = tasks.length === 0 ? 'No tasks yet. Add one above.' : 'No matching tasks.';
  visibleTasks.forEach((task, index) => {
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'task-text';
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
        const visibleIndex = tasks.filter(entry => entry.text.toLocaleLowerCase().includes(filter.value.trim().toLocaleLowerCase())).indexOf(task);
        (list.children[visibleIndex]?.querySelector('button') || filter).focus();
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
      tasks.splice(tasks.indexOf(task), 1);
      announce('Task deleted.');
      render();
      input.focus();
    });
    item.append(label, edit, remove);
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
  tasks.push({ text });
  announce('Task added.');
  input.value = '';
  render();
  input.focus();
});
filter.addEventListener('input', () => {
  render();
  announce(`${list.children.length} matching tasks.`);
});
input.addEventListener('input', () => input.setCustomValidity(''));
render();
