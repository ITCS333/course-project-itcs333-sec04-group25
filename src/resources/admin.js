import { v7 as uuidv7 } from "uuid";
const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8000';
// --- Global Data Store ---
let resources = [];
let editingResourceId = null; // Track which resource is being edited

const resourceForm = document.getElementById("resource-form");
const editResourceForm = document.getElementById("edit-resource-form");
const resourcesTableBody = document.getElementById("resources-tbody");

// Add Modal Elements
const modal = document.getElementById('resource-modal');
const modalContent = document.getElementById('modal-content');
const modalOverlay = document.getElementById('modal-overlay');
const showFormBtnDesktop = document.getElementById('show-form-btn-desktop');
const showFormBtnMobile = document.getElementById('show-form-btn-mobile');
const closeModalBtn = document.getElementById('close-modal-btn');
const cancelBtn = document.getElementById('cancel-btn');

// Edit Modal Elements
const editModal = document.getElementById('edit-modal');
const editModalContent = document.getElementById('edit-modal-content');
const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');

// Add Modal Functions
function openModal() {
  modal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  // Trigger animation
  setTimeout(() => {
    modalContent.classList.remove('scale-95', 'opacity-0');
    modalContent.classList.add('scale-100', 'opacity-100');
    modalOverlay.classList.add('opacity-100');
  }, 10);
}

function closeModal() {
  modalContent.classList.remove('scale-100', 'opacity-100');
  modalContent.classList.add('scale-95', 'opacity-0');
  modalOverlay.classList.remove('opacity-100');
  setTimeout(() => {
    modal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
  }, 200);
  resourceForm.reset();
}

// Edit Modal Functions
function openEditModal(resource) {
  editingResourceId = resource.id;
  document.getElementById("edit-resource-title").value = resource.title;
  document.getElementById("edit-resource-description").value = resource.description;
  document.getElementById("edit-resource-link").value = resource.link;

  editModal.classList.remove('hidden');
  modalOverlay.classList.remove('hidden');
  // Trigger animation
  setTimeout(() => {
    editModalContent.classList.remove('scale-95', 'opacity-0');
    editModalContent.classList.add('scale-100', 'opacity-100');
    modalOverlay.classList.add('opacity-100');
  }, 10);
}

function closeEditModal() {
  editModalContent.classList.remove('scale-100', 'opacity-100');
  editModalContent.classList.add('scale-95', 'opacity-0');
  modalOverlay.classList.remove('opacity-100');
  setTimeout(() => {
    editModal.classList.add('hidden');
    modalOverlay.classList.add('hidden');
  }, 200);
  editingResourceId = null;
  editResourceForm.reset();
}

// Event Listeners for Add Modal
showFormBtnDesktop.addEventListener('click', openModal);
showFormBtnMobile.addEventListener('click', openModal);
closeModalBtn.addEventListener('click', closeModal);
cancelBtn.addEventListener('click', closeModal);

// Event Listeners for Edit Modal
closeEditModalBtn.addEventListener('click', closeEditModal);
cancelEditBtn.addEventListener('click', closeEditModal);

// Overlay click handler
modalOverlay.addEventListener('click', () => {
  if (!modal.classList.contains('hidden')) {
    closeModal();
  }
  if (!editModal.classList.contains('hidden')) {
    closeEditModal();
  }
});

// Prevent modal close when clicking inside modal content
modalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

editModalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    if (!modal.classList.contains('hidden')) {
      closeModal();
    }
    if (!editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  }
});


// --- Functions ---

/**
 * TODO: Implement the createResourceRow function.
 * It takes one resource object {id, title, description}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `description`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createResourceRow(resource) {
  if (resource) {
    // Create the table row
    const tr = document.createElement("tr");
    tr.className = "block group bg-card/50 hover:bg-card hover:border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-lg border-border border max-w-full w-full min-w-0";
    tr.dataset.id = resource.id;

    // Create title cell
    const tdTitle = document.createElement("td");
    tdTitle.className = "block max-w-full w-full min-w-0";
    const divTitle1 = document.createElement("div");
    divTitle1.className = "flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 max-w-full w-full min-w-0";
    const divTitle2 = document.createElement("div");
    divTitle2.className = "flex-1 min-w-0 shrink";
    const divTitle3 = document.createElement("div");
    divTitle3.className = "text-base sm:text-lg font-semibold text-foreground mb-1.5 sm:mb-2 group-hover:text-primary transition-colors wrap-break-word";
    divTitle3.textContent = resource.title;
    divTitle2.append(divTitle3);
    divTitle1.append(divTitle2);
    tdTitle.append(divTitle1);

    // Create description cell
    const tdDescription = document.createElement("td");
    tdDescription.className = "block max-w-full w-full min-w-0";
    const divDescription = document.createElement("div");
    divDescription.className = "text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word";
    divDescription.textContent = resource.description;
    tdDescription.append(divDescription);

    // Create action cell
    const tdAction = document.createElement("td");
    tdAction.className = "block max-w-full w-full min-w-0";
    const divAction = document.createElement("div");
    divAction.className = "flex items-center gap-2 sm:gap-2 shrink-0";

    // Create Edit button
    const editButton = document.createElement("button");
    editButton.title = "Edit Resource";
    editButton.className = "edit-btn p-2 sm:p-2.5 bg-info text-info-foreground rounded-lg hover:bg-info/80 hover:scale-110 hover:shadow-md transition-all duration-200";
    editButton.dataset.id = resource.id;
    const editSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    editSvg.setAttribute("class", "h-4 w-4");
    editSvg.setAttribute("viewBox", "0 0 20 20");
    editSvg.setAttribute("fill", "currentColor");
    editSvg.innerHTML = '<path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>';
    editButton.append(editSvg);

    // Create Delete button
    const deleteButton = document.createElement("button");
    deleteButton.title = "Delete Resource";
    deleteButton.className = "delete-btn p-2 sm:p-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 hover:scale-110 hover:shadow-md transition-all duration-200";
    deleteButton.dataset.id = resource.id;
    const deleteSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    deleteSvg.setAttribute("class", "h-4 w-4");
    deleteSvg.setAttribute("viewBox", "0 0 20 20");
    deleteSvg.setAttribute("fill", "currentColor");
    deleteSvg.innerHTML = '<path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>';
    deleteButton.append(deleteSvg);

    // Append buttons to action div
    divAction.append(editButton, deleteButton);
    tdAction.append(divAction);

    // Append all cells to row
    tr.append(tdTitle, tdDescription, tdAction);

    return tr;
  }

}

/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `resourcesTableBody`.
 * 2. Loop through the global `resources` array.
 * 3. For each resource, call `createResourceRow()`, and
 * append the resulting <tr> to `resourcesTableBody`.
 */
function renderTable() {
  resourcesTableBody.innerHTML = "";
  for (const r of resources) {
    if (r) {
      resourcesTableBody.append(createResourceRow(r));
    }
  }
}

/**
 * TODO: Implement the handleAddResource function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, description, and link inputs.
 * 3. Create a new resource object with a unique ID (e.g., `id: \`res_${Date.now()}\``).
 * 4. Add this new resource object to the global `resources` array (in-memory only).
 * 5. Call `renderTable()` to refresh the list.
 * 6. Reset the form.
 */
async function handleAddResource(event) {
  event.preventDefault();
  const title = document.getElementById("resource-title")?.value.trim() || "";
  const description = document.getElementById("resource-description").value.trim() || "";
  const link = document.getElementById("resource-link")?.value.trim() || "";
  if (title && description && link) {
    const result = await APIAddResource(title, description, link);
    if (result.success) {
      const id = Number(result.data?.id);
      resources.push({ id, title, description, link });
      renderTable();
      closeModal();
    } else {
      alert(result.message || "Failed to add resource");
    }

  }
}

async function APIAddResource(title, description, link) {
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php`, {
      method: "POST",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title, description, link })
    }
    );
    const res = await req.json();
    return res; // Return the full response object with success, data, and message
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, message: " error: " + e.message };
  }
}

/**
 * Handle editing an existing resource
 */
async function handleEditResource(event) {
  event.preventDefault();
  const title = document.getElementById("edit-resource-title")?.value.trim() || "";
  const description = document.getElementById("edit-resource-description").value.trim() || "";
  const link = document.getElementById("edit-resource-link")?.value.trim() || "";

  if (title && description && link) {
    const result = await APIEditResource(editingResourceId, title, description, link);
    if (result.success) {
      const index = resources.findIndex(r => r.id === editingResourceId);
      if (index !== -1) {
        resources[index] = {
          ...resources[index],
          title,
          description,
          link
        };
      }
      renderTable();
      closeEditModal();
    } else {
      alert(result.message || "Failed to update resource");
    }
  }
}

async function APIEditResource(id, title, description, link) {
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php`, {
      method: "PUT",
      credentials: "include",
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id, title, description, link })
    });
    const res = await req.json();
    return res; // Return the full response object with success, data, and message
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, message: "Network error: " + e.message };
  }
}

async function APIDeleteResource(id) {
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php?id=${parseInt(id)}`, {
      method: "DELETE",
      credentials: "include"
    });
    const res = await req.json();
    return res; // Return the full response object with success, data, and message
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, message: "Network error: " + e.message };
  }
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `resourcesTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `resources` array by filtering out the resource
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
async function handleTableClick(event) {
  // Find the closest button (handles clicks on SVG or other children)
  const deleteBtn = event.target.closest(".delete-btn"); // Closest traverse up the dom until it finds the delete button. This is because sometimes the clicks happens on the button's svg
  if (deleteBtn) {
    const id = Number(deleteBtn.dataset.id);
    if (confirm("Are you sure you want to delete this resource?")) {
      const result = await APIDeleteResource(id);
      if (result.success) {
        resources = resources.filter(e => e.id !== id);
        renderTable();
      } else {
        alert(result.message || "Failed to delete resource");
      }
    }
    return;
  }

  const editBtn = event.target.closest(".edit-btn");
  if (editBtn) {
    const id = Number(editBtn.dataset.id);
    const resource = resources.find(e => e.id === id);
    if (resource) {
      openEditModal(resource);
    }
  }
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'resources.json'.
 * 2. Parse the JSON response and store the result in the global `resources` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `resourceForm` (calls `handleAddResource`).
 * 5. Add the 'click' event listener to `resourcesTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
  try {
    const res = await fetch(`${API_HOST}/resources/api/index.php`);
    const resBody = await res.json();
    resources = resBody?.data;
    renderTable();
    resourceForm.addEventListener("submit", event => handleAddResource(event));
    editResourceForm.addEventListener("submit", event => handleEditResource(event));
    resourcesTableBody.addEventListener("click", event => handleTableClick(event));
  }
  catch (err) {
    console.error("Error in initializing: ", err)
  }
}

// --- Initial Page Load ---
loadAndInitialize();
// const r = fetch(`${API_HOST}/resources/api/index.php`).then((res) => res.json()).then((realRes) => console.log(realRes))
