/*
  Requirement: Make the "Manage Assignments" page interactive.

  Notes:
  - This file is loaded as a module from `admin.html` with `type="module" defer`.
  - Do NOT import external Node packages in this browser module (removed `uuid` import).
  - Keep the TODO comments in place per project guidelines.
*/

import { checkAdmin, API_HOST } from "/src/common/helpers.js";

// --- Global Data Store ---
let assignments = [];
let editingAssignmentId = null; // track editing

// --- Element references (initialized later) ---
let assignmentForm = null;
let assignmentsTableBody = null;
let showFormBtnDesktop = null;
let showFormBtnMobile = null;
let cancelBtn = null;
let editAssignmentForm = null;
let editModal = null;
let editModalContent = null;
let closeEditModalBtn = null;
let cancelEditBtn = null;

// --- Functions ---

  /**
   * TODO: Implement the createAssignmentRow function.
   * It takes one assignment object {id, title, dueDate, description, files}.
   * It should return a <tr> element with the following <td>s:
   * 1. A <td> for the `title`.
   * 2. A <td> for the `dueDate` (or due label).
   * 3. A <td> for a short description.
   * 4. A <td> containing two buttons:
   * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
   * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
   */
function createAssignmentRow(assignment) {
    if (!assignment) return null;

    const tr = document.createElement('tr');
    tr.className = 'block group bg-card/50 hover:bg-card hover:border-primary/20 rounded-lg sm:rounded-xl p-4 sm:p-5 lg:p-6 transition-all duration-200 hover:shadow-lg border-border border max-w-full w-full min-w-0';
    tr.dataset.id = assignment.id;

    // Title cell
    const tdTitle = document.createElement('td');
    tdTitle.className = 'block max-w-full w-full min-w-0';
    const titleWrap = document.createElement('div');
    titleWrap.className = 'flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4 max-w-full w-full min-w-0';
    const titleCol = document.createElement('div');
    titleCol.className = 'flex-1 min-w-0 shrink';
    const titleEl = document.createElement('h3');
    titleEl.className = 'text-lg sm:text-xl font-semibold text-foreground mb-1 sm:mb-2 wrap-break-word';
    titleEl.textContent = assignment.title || '';
    titleCol.appendChild(titleEl);
    titleWrap.appendChild(titleCol);
    tdTitle.appendChild(titleWrap);

    // Due date cell
    const tdDue = document.createElement('td');
    tdDue.className = 'block max-w-full w-full min-w-0';
    const dueEl = document.createElement('div');
    dueEl.className = 'text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word';
    dueEl.textContent = assignment.dueDate ? `Due: ${assignment.dueDate}` : 'No due date';
    tdDue.appendChild(dueEl);

    // Description cell
    const tdDesc = document.createElement('td');
    tdDesc.className = 'block max-w-full w-full min-w-0';
    const descEl = document.createElement('div');
    descEl.className = 'text-xs sm:text-sm text-muted-foreground leading-relaxed wrap-break-word';
    descEl.textContent = assignment.description || '';
    tdDesc.appendChild(descEl);

    // Actions cell
    const tdActions = document.createElement('td');
    tdActions.className = 'block max-w-full w-full min-w-0';
    const actionsWrap = document.createElement('div');
    actionsWrap.className = 'flex items-center gap-2 sm:gap-2 shrink-0';

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.type = 'button';
    editBtn.title = 'Edit Assignment';
    editBtn.className = 'edit-btn p-2 sm:p-2.5 bg-info text-info-foreground rounded-lg hover:bg-info/80 hover:scale-110 hover:shadow-md transition-all duration-200';
    editBtn.dataset.id = assignment.id;
    editBtn.innerHTML = `
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
      </svg>`;

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.type = 'button';
    deleteBtn.title = 'Delete Assignment';
    deleteBtn.className = 'delete-btn p-2 sm:p-2.5 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 hover:scale-110 hover:shadow-md transition-all duration-200';
    deleteBtn.dataset.id = assignment.id;
    deleteBtn.innerHTML = `
      <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
      </svg>`;

    actionsWrap.appendChild(editBtn);
    actionsWrap.appendChild(deleteBtn);
    // Attach direct click handlers as a reliable fallback to event delegation.
    // These stop propagation so the delegation handler won't double-process clicks.
    editBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      // open the dedicated edit modal
      const asg = assignments.find(a => a.id === assignment.id);
      if (asg) openEditModal(asg);
    });
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      assignments = assignments.filter((a) => a.id !== assignment.id);
      renderTable();
    });
    tdActions.appendChild(actionsWrap);

    // Append to row
    tr.appendChild(tdTitle);
    tr.appendChild(tdDue);
    tr.appendChild(tdDesc);
    tr.appendChild(tdActions);

    return tr;
}

  /**
   * TODO: Implement the renderTable function.
   * It should:
   * 1. Clear the `assignmentsTableBody`.
   * 2. Loop through the global `assignments` array.
   * 3. For each assignment, call `createAssignmentRow()`, and
   * append the resulting <tr> to `assignmentsTableBody`.
   */
function renderTable() {
  if (!assignmentsTableBody) return;
  assignmentsTableBody.innerHTML = '';
  for (const a of assignments) {
    if (a) assignmentsTableBody.appendChild(createAssignmentRow(a));
  }
}

  /**
   * TODO: Implement the handleAddAssignment function.
   * This is the event handler for the form's 'submit' event.
   * It should:
   * 1. Prevent the form's default submission.
   * 2. Get the values from the title, description, due date, and files inputs.
   * 3. Create a new assignment object with a unique ID (e.g., `id: `asg_${Date.now()}``).
   * 4. Add this new assignment object to the global `assignments` array (in-memory only).
   * 5. Call `renderTable()` to refresh the list.
   * 6. Reset the form.
   */
function handleAddAssignment(event) {
  event.preventDefault();
  if (!assignmentForm) return;

  const title = document.getElementById('assignment-title')?.value.trim() || '';
  const description = document.getElementById('assignment-description')?.value.trim() || '';
  const dueDate = document.getElementById('assignment-due-date')?.value || '';
  const files = document.getElementById('assignment-files')?.value.trim() || '';

  if (!title) return;

  if (editingAssignmentId) {
    // update
    const idx = assignments.findIndex((x) => x.id === editingAssignmentId);
    if (idx !== -1) {
      assignments[idx] = {
        ...assignments[idx],
        title,
        description,
        dueDate,
        files,
      };
    }
    editingAssignmentId = null;
    const addBtn = document.getElementById('add-assignment');
    if (addBtn) addBtn.textContent = 'Add Assignment';
  } else {
    const id = `asg_${Date.now()}`;
    assignments.push({ id, title, description, dueDate, files });
  }

  renderTable();
  assignmentForm.reset();

  // close modal via cancel button to keep modal logic in HTML
  if (cancelBtn) cancelBtn.click();
}

  /**
   * TODO: Implement the handleTableClick function.
   * This is an event listener on the `assignmentsTableBody` (for delegation).
   * It should:
   * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
   * 2. If it does, get the `data-id` attribute from the button.
   * 3. Update the global `assignments` array by filtering out the assignment
   * with the matching ID (in-memory only).
   * 4. Call `renderTable()` to refresh the list.
   */
function handleTableClick(event) {
  if (!event) return;

  const deleteBtn = event.target.closest('.delete-btn');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    assignments = assignments.filter((a) => a.id !== id);
    renderTable();
    return;
  }

  const editBtn = event.target.closest('.edit-btn');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    startEdit(id);
    return;
  }
}

  // helper to populate form and open modal for editing
  function startEdit(id) {
    // Backwards-compatible bridge: open dedicated edit modal when called
    const asg = assignments.find((a) => a.id === id);
    if (!asg) return;
    openEditModal(asg);
  }

  // Open the edit modal and populate fields
  function openEditModal(asg) {
    if (!asg) return;
    editingAssignmentId = asg.id;
    editAssignmentForm = editAssignmentForm || document.getElementById('edit-assignment-form');
    editModal = editModal || document.getElementById('edit-modal');
    editModalContent = editModalContent || document.getElementById('edit-modal-content');
    closeEditModalBtn = closeEditModalBtn || document.getElementById('close-edit-modal-btn');
    cancelEditBtn = cancelEditBtn || document.getElementById('cancel-edit-btn');

    if (!editAssignmentForm || !editModal || !editModalContent) return;

    document.getElementById('edit-assignment-title').value = asg.title || '';
    document.getElementById('edit-assignment-description').value = asg.description || '';
    document.getElementById('edit-assignment-due-date').value = asg.dueDate || '';
    // file input cannot be set programmatically for security; leave blank

    // Show modal
    editModal.classList.remove('hidden');
    const modalOverlayEl = document.getElementById('modal-overlay');
    if (modalOverlayEl) modalOverlayEl.classList.remove('hidden');
    // prevent background scroll
    document.documentElement.classList.add('overflow-hidden');
    document.body.classList.add('overflow-hidden');
    setTimeout(() => {
      editModalContent.classList.remove('scale-95', 'opacity-0');
      editModalContent.classList.add('scale-100', 'opacity-100');
      if (modalOverlayEl) modalOverlayEl.classList.add('opacity-100');
    }, 10);

    // ensure edit form listener exists
    if (editAssignmentForm && !editAssignmentForm._bound) {
      editAssignmentForm.addEventListener('submit', handleEditAssignment);
      editAssignmentForm._bound = true;
    }

    // attach close handlers if present
    if (closeEditModalBtn && !closeEditModalBtn._bound) {
      closeEditModalBtn.addEventListener('click', closeEditModal);
      closeEditModalBtn._bound = true;
    }
    if (cancelEditBtn && !cancelEditBtn._bound) {
      cancelEditBtn.addEventListener('click', closeEditModal);
      cancelEditBtn._bound = true;
    }
  }

  function closeEditModal() {
    editModal = editModal || document.getElementById('edit-modal');
    editModalContent = editModalContent || document.getElementById('edit-modal-content');
    const modalOverlayEl = document.getElementById('modal-overlay');
    if (!editModal || !editModalContent) return;
    editModalContent.classList.remove('scale-100', 'opacity-100');
    editModalContent.classList.add('scale-95', 'opacity-0');
    if (modalOverlayEl) modalOverlayEl.classList.remove('opacity-100');
    // Re-enable scroll
    document.documentElement.classList.remove('overflow-hidden');
    document.body.classList.remove('overflow-hidden');
    setTimeout(() => {
      editModal.classList.add('hidden');
      if (modalOverlayEl) modalOverlayEl.classList.add('hidden');
    }, 250);
    editingAssignmentId = null;
  }

  // Save changes from the edit modal
  function handleEditAssignment(e) {
    e.preventDefault();
    if (!editingAssignmentId) return;
    const title = document.getElementById('edit-assignment-title')?.value.trim() || '';
    const description = document.getElementById('edit-assignment-description')?.value.trim() || '';
    const dueDate = document.getElementById('edit-assignment-due-date')?.value || '';

    const idx = assignments.findIndex(a => a.id === editingAssignmentId);
    if (idx !== -1) {
      assignments[idx] = { ...assignments[idx], title, description, dueDate };
    }
    renderTable();
    closeEditModal();
  }

  /**
   * TODO: Implement the loadAndInitialize function.
   * This function needs to be 'async'.
   * It should:
   * 1. Use `fetch()` to get data from 'assignments.json'.
   * 2. Parse the JSON response and store the result in the global `assignments` array.
   * 3. Call `renderTable()` to populate the table for the first time.
   * 4. Add the 'submit' event listener to `assignmentForm` (calls `handleAddAssignment`).
   * 5. Add the 'click' event listener to `assignmentsTableBody` (calls `handleTableClick`).
   */
async function loadAndInitialize() {
  try {
    const resp = await fetch('/src/assignments/api/assignments.json');
    if (resp && resp.ok) {
      assignments = await resp.json();
    } else {
      assignments = [];
    }
  } catch (err) {
    // graceful fallback if fetch fails
    console.error('Error loading assignments:', err);
    assignments = [];
  }
  // initialize DOM references here to ensure elements exist
  assignmentForm = document.getElementById('assignment-form');
  assignmentsTableBody = document.getElementById('assignments-tbody');
  showFormBtnDesktop = document.getElementById('show-form-btn-desktop');
  showFormBtnMobile = document.getElementById('show-form-btn-mobile');
  cancelBtn = document.getElementById('cancel-btn');

  renderTable();

  if (assignmentForm) assignmentForm.addEventListener('submit', handleAddAssignment);

  if (assignmentsTableBody) {
    assignmentsTableBody.addEventListener('click', handleTableClick);
    console.debug('assignmentsTableBody click listener attached');
  } else {
    console.warn('assignmentsTableBody not found; edit/delete delegation will not work');
  }

  // If modal openers exist in the page, ensure clicking them will open the modal (they are handled by inline script in HTML,
  // but keep these references available for `startEdit` which triggers `opener.click()` to open modal)
}

// --- Initial Page Load ---
checkAdmin().then(ok => {
  if (ok) loadAndInitialize();
});