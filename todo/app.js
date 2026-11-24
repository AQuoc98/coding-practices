const form = document.querySelector('#todo-form');
const input = document.querySelector('#todo-input');
const labelInput = document.querySelector('#label-input');
const list = document.querySelector('#todo-list');
const empty = document.querySelector('#empty');
const filter = document.querySelector('#todo-filter');
const status = document.querySelector('#status');
let tasks = [];
const editing = new Map();

function announce(message) {
  status.textContent = message;
}

function render() {
  list.replaceChildren();
  const query = filter.value.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(query, 'iu');
  const visibleTasks = tasks.filter(task => matcher.test(task.text));
  empty.hidden = visibleTasks.length > 0;
  empty.textContent = tasks.length === 0 ? 'No tasks yet. Add one above.' : 'No matching tasks.';
  visibleTasks.forEach(task => {
    if (editing.has(task)) {
      list.append(editing.get(task));
      return;
    }
    const item = document.createElement('li');
    const label = document.createElement('span');
    label.className = 'task-text';
    label.textContent = task.text;
    const badge = document.createElement('span');
    badge.className = 'task-label';
    badge.textContent = task.label || '';
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
      const labelField = document.createElement('input');
      labelField.maxLength = 40;
      labelField.value = task.label || '';
      labelField.setAttribute('aria-label', 'Edit label');
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
        task.label = labelField.value.trim();
        editing.delete(task);
        announce('Task updated.');
        const visibleIndex = render().indexOf(task);
        (list.children[visibleIndex]?.querySelector('button') || filter).focus();
      }
      field.addEventListener('input', () => field.setCustomValidity(''));
      [field, labelField].forEach(editField => editField.addEventListener('keydown', event => {
        if (event.key === 'Enter') {
          event.preventDefault();
          finish();
        }
        if (event.key === 'Escape') cancelEdit();
      }));
      function cancelEdit() {
        editing.delete(task);
        const visibleIndex = render().indexOf(task);
        (list.children[visibleIndex]?.querySelector('button') || filter).focus();
      }
      saveButton.addEventListener('click', finish);
      cancel.addEventListener('click', cancelEdit);
      item.replaceChildren(field, labelField, saveButton, cancel);
      editing.set(task, item);
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
    item.append(label, badge, edit, remove);
    list.append(item);
  });
  return visibleTasks;
}

form.addEventListener('submit', event => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) {
    input.setCustomValidity('Enter a task.');
    input.reportValidity();
    return;
  }
  tasks.push({ text, label: labelInput.value.trim() });
  labelInput.value = '';
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
