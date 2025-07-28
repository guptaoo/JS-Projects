// Select DOM elements
const todoInput = document.getElementById("todoInput");
const todoDueDate = document.getElementById("todoDueDate"); // NEW: Select the date input
const addTodoBtn = document.getElementById("addTodoBtn");
const todoList = document.getElementById("todoList");

// Key for local storage
const LOCAL_STORAGE_KEY = "myTodos";

// Array to store todo objects
// Each todo object: { id: number, text: string, completed: boolean, dueDate: string }
let todos = [];

// --- Utility Functions for Local Storage ---

/**
 * Saves the current 'todos' array to Local Storage.
 */
function saveTodos() {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos));
}

/**
 * Loads todos from Local Storage into the 'todos' array.
 * Handles potential parsing errors.
 */
function loadTodos() {
  const storedTodos = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedTodos) {
    try {
      // Attempt to parse the stored string into a JavaScript array
      todos = JSON.parse(storedTodos);
      // Ensure old todos without dueDate get one (e.g., empty string)
      // This prevents errors if you add this feature to an existing app
      todos = todos.map((todo) => ({
        ...todo,
        dueDate: todo.dueDate || "", // Default to empty string if missing
      }));
    } catch (e) {
      // If parsing fails (e.g., malformed JSON), log error and initialize with empty array
      console.error("Error parsing todos from local storage:", e);
      todos = [];
    }
  }
}

// --- Main Rendering Function ---

/**
 * Clears the current UI list and re-renders all todos from the 'todos' array.
 * Also calls saveTodos() to persist changes.
 */
function renderTodos() {
  todoList.innerHTML = ""; // Clear existing list items to prevent duplicates
  todos.forEach((todo) => {
    const listItem = document.createElement("li");
    listItem.className = "todo-item";

    // Add 'completed' class for styling if the todo is completed
    if (todo.completed) {
      listItem.classList.add("completed");
    }

    // Store the todo's ID directly on the list item for easy retrieval
    listItem.dataset.id = todo.id;

    // Format date for display
    // Using 'en-IN' locale for India-specific date formatting
    const displayDate = todo.dueDate
      ? new Date(todo.dueDate).toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "No Date";

    // Construct the inner HTML for each todo item, including checkbox, text span, date span, and delete button
    listItem.innerHTML = `
            <input type="checkbox" class="todo-checkbox" ${
              todo.completed ? "checked" : ""
            }>
            <div class="todo-info">
                <span class="todo-text">${todo.text}</span>
                <span class="todo-date">${displayDate}</span>
            </div>
            <button class="delete-btn">Delete</button>
        `;

    // Append the newly created list item to the main todo list
    todoList.appendChild(listItem);
  });

  // After rendering (which means after any change to the todos array), save to local storage
  saveTodos();
}

// --- CRUD Operations ---

/**
 * Adds a new todo item based on the input field's value.
 */
function addTodo() {
  const todoText = todoInput.value.trim(); // Get input value and remove leading/trailing whitespace
  const dueDate = todoDueDate.value; // Get due date value

  // Validate if the input is not empty
  if (todoText === "") {
    alert("Please enter a todo item!");
    return; // Stop execution if input is empty
  }

  // Create a new todo object with a unique ID (timestamp), text, default completed status, and due date
  const newTodo = {
    id: Date.now(), // Use timestamp as a simple unique ID
    text: todoText,
    completed: false,
    dueDate: dueDate, // Add dueDate to the todo object
  };

  todos.push(newTodo); // Add the new todo object to our array
  renderTodos(); // Re-render the UI to display the new todo (and save)
  todoInput.value = ""; // Clear the text input field after adding
  todoDueDate.value = ""; // Clear the date input field after adding
}

/**
 * Toggles the 'completed' status of a specific todo item by its ID.
 * @param {number} id - The unique ID of the todo item to toggle.
 */
function toggleComplete(id) {
  // Use map to create a new array with the updated todo item
  todos = todos.map((todo) => {
    if (todo.id === id) {
      // If it's the matching todo, return a new object with 'completed' status flipped
      return { ...todo, completed: !todo.completed };
    }
    return todo; // Otherwise, return the todo as is
  });
  renderTodos(); // Re-render the UI (and save) to reflect the completion status change
}

/**
 * Updates the text of a specific todo item by its ID.
 * @param {number} id - The unique ID of the todo item to update.
 * @param {string} newText - The new text for the todo item.
 */
function updateTodoText(id, newText) {
  todos = todos.map((todo) => {
    if (todo.id === id) {
      return { ...todo, text: newText };
    }
    return todo;
  });
  renderTodos(); // Re-render the UI (and save) with the updated text
}

/**
 * Deletes a specific todo item by its ID.
 * @param {number} id - The unique ID of the todo item to delete.
 */
function deleteTodo(id) {
  // Use filter to create a new array excluding the todo item to be deleted
  todos = todos.filter((todo) => todo.id !== id);
  renderTodos(); // Re-render the UI (and save) to remove the deleted todo
}

// --- Event Listeners ---

// Event Listener for the "Add" button click
addTodoBtn.addEventListener("click", addTodo);

// Event Listener for the Enter key press in the text input field
todoInput.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});

// Event Listener for the Enter key press in the date input field
todoDueDate.addEventListener("keypress", (event) => {
  if (event.key === "Enter") {
    addTodo();
  }
});

// Main Event Listener for clicks on the todo list using event delegation
// This handles clicks on checkboxes, todo text (for editing), and delete buttons
todoList.addEventListener("click", (event) => {
  const clickedElement = event.target;
  // Find the closest parent <li> element to the clicked element
  const listItem = clickedElement.closest(".todo-item");

  // If no parent <li> is found, it means the click wasn't on a todo item, so do nothing.
  if (!listItem) {
    return;
  }

  // Get the todo ID from the dataset of the found <li> element
  const todoId = parseInt(listItem.dataset.id);

  // --- Logic for Delete Button ---
  // Check for delete button first, as it's a distinct action
  if (clickedElement.classList.contains("delete-btn")) {
    deleteTodo(todoId);
  }
  // --- Logic for Checkbox (Mark Complete/Incomplete) ---
  else if (clickedElement.classList.contains("todo-checkbox")) {
    toggleComplete(todoId);
  }
  // --- Logic for In-Place Editing of Todo Text ---
  else if (clickedElement.classList.contains("todo-text")) {
    // Prevent editing if the task is completed (optional, but good UX)
    if (listItem.classList.contains("completed")) {
      return;
    }

    const currentText = clickedElement.textContent;
    // Create a new input element
    const editInput = document.createElement("input");
    editInput.type = "text";
    editInput.value = currentText;
    editInput.className = "edit-todo-input"; // Add a class for styling

    // Get the parent `todo-info` div to replace the span correctly
    const todoInfoDiv = clickedElement.closest(".todo-info");
    if (todoInfoDiv) {
      // Replace the original <span> element with the new <input> element
      todoInfoDiv.replaceChild(editInput, clickedElement);
    }

    editInput.focus(); // Immediately focus the input for editing

    // Function to save the edited text
    const saveEdit = () => {
      const newText = editInput.value.trim();
      if (newText === "") {
        alert("Task cannot be empty! Reverting to original.");
        updateTodoText(todoId, currentText); // Revert if new text is empty
      } else {
        updateTodoText(todoId, newText); // Update with the new text
      }
      // renderTodos is called by updateTodoText, which will re-create the span element,
      // effectively replacing the input field.
    };

    // Save when the input loses focus (user clicks away)
    editInput.addEventListener("blur", saveEdit);

    // Save when the Enter key is pressed in the input field
    editInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        editInput.blur(); // Trigger the blur event to save changes
      }
    });
  }
});

// --- Initial App Setup ---

// 1. Load any existing todos from local storage when the script first runs
loadTodos();
// 2. Render these loaded todos to the UI
renderTodos();
