import { v7 as uuidv7 } from "uuid";
import { checkAdmin, API_HOST } from "/src/common/helpers.js";

// --- Global Data Store ---
let resources = [];
let editingResourceId = null;

// DOM Elements
const resourceForm = document.getElementById("resource-form");
const resourcesTableBody = document.getElementById("resources-tbody");

// Initialize when DOM is loaded

function initializeUI() {
  applyInitialStyling();
  createModalsAndOverlay();
  setupEventListeners();
}

function applyInitialStyling() {
  // Apply styles to html and body
  document.documentElement.className = "overflow-x-hidden max-w-full";
  document.body.className = "min-h-screen overflow-x-hidden overscroll-x-none max-w-full relative";

  // Style the header
  const header = document.querySelector('header');
  if (header) {
    header.className = "max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 w-full overflow-x-hidden";

    const headerDiv = document.createElement('div');
    headerDiv.className = "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4";

    const contentDiv = document.createElement('div');
    contentDiv.className = "min-w-0";

    const h1 = header.querySelector('h1');
    if (h1) {
      h1.className = "text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-2 wrap-break-word";

      const subtitle = document.createElement('p');
      subtitle.className = "text-sm sm:text-base lg:text-lg text-muted-foreground wrap-break-word";
      subtitle.textContent = "Create, edit, and manage all course resources in one place";

      contentDiv.appendChild(h1);
      contentDiv.appendChild(subtitle);
    }

    // Create desktop button
    const desktopBtn = document.createElement('button');
    desktopBtn.id = 'show-form-btn-desktop';
    desktopBtn.className = "hidden sm:inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-primary text-primary-foreground rounded-lg sm:rounded-xl font-semibold shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl hover:scale-105 transition-all duration-300";
    desktopBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
      </svg>
      Add New Resource
    `;

    headerDiv.appendChild(contentDiv);
    headerDiv.appendChild(desktopBtn);

    header.innerHTML = '';
    header.appendChild(headerDiv);
  }

  // Create mobile FAB
  const mobileFAB = document.createElement('button');
  mobileFAB.id = 'show-form-btn-mobile';
  mobileFAB.className = "sm:hidden fixed bottom-6 right-4 z-50 w-12 h-12 bg-primary/50 text-primary-foreground rounded-full shadow-2xl hover:shadow-3xl hover:scale-110 transition-all duration-300 flex items-center justify-center";
  mobileFAB.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
    </svg>
  `;
  document.body.appendChild(mobileFAB);

  // Style main element
  const main = document.querySelector('main');
  if (main) {
    main.className = "mb-6 sm:mb-8 lg:mb-10 max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8  w-full overflow-x-hidden";
  }

  // Style form section and hide it initially
  const formSection = resourceForm?.closest('section');
  if (formSection) {
    formSection.className = "hidden fixed inset-0 z-50 overflow-y-auto";
    formSection.id = "resource-modal";

    // Style the h2
    const h2 = formSection.querySelector('h2');
    if (h2) {
      h2.className = "text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2 my-0";
    }
  }

  // Style resources list section
  const resourcesSection = document.querySelector('section:not(#resource-modal)');
  if (resourcesSection) {
    resourcesSection.className = "space-y-4 sm:space-y-6 max-w-full";

    const sectionHeader = document.createElement('div');
    sectionHeader.className = "mb-4 sm:mb-6 lg:mb-8";

    const h2 = resourcesSection.querySelector('h2');
    if (h2) {
      h2.className = "text-2xl sm:text-3xl font-bold text-foreground mb-1 sm:mb-2";

      const subtitle = document.createElement('p');
      subtitle.className = "text-sm sm:text-base text-muted-foreground";
      subtitle.textContent = "Manage and organize all course materials";

      h2.parentNode.insertBefore(sectionHeader, h2);
      sectionHeader.appendChild(h2);
      sectionHeader.appendChild(subtitle);
    }
  }

  // Style table
  const table = document.getElementById('resources-table');
  if (table) {
    table.className = "w-full table-auto border-collapse bg-card shadow-lg rounded-lg overflow-hidden border border-border";

    const thead = table.querySelector('thead');
    if (thead) {
      thead.className = "bg-primary text-primary-foreground";
      const headerRow = thead.querySelector('tr');
      if (headerRow) {
        headerRow.className = "";
        const headers = headerRow.querySelectorAll('th');
        headers.forEach((th, index) => {
          th.className = "px-6 py-4 text-left text-sm font-semibold uppercase tracking-wider";
          if (index === headers.length - 1) {
            th.className += " text-center";
          }
        });
      }
    }

    const tbody = table.querySelector('tbody');
    if (tbody) {
      tbody.className = "divide-y divide-border";
    }
  }
}

function createModalsAndOverlay() {
  // Create overlay
  const overlay = document.createElement('div');
  overlay.id = 'modal-overlay';
  overlay.className = "fixed inset-0 bg-background/80 backdrop-blur-sm z-40 hidden transition-opacity duration-300";
  document.body.appendChild(overlay);

  // Transform the existing form into a modal
  const formSection = document.getElementById('resource-modal');
  if (formSection) {
    const modalWrapper = document.createElement('div');
    modalWrapper.className = "flex min-h-full items-center justify-center p-3 sm:p-4";

    const modalContent = document.createElement('div');
    modalContent.id = 'modal-content';
    modalContent.className = "bg-card rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-primary/20 transform transition-all duration-300 scale-95 opacity-0 mx-4 overflow-hidden";

    const modalHeader = document.createElement('div');
    modalHeader.className = "flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b-2 border-border bg-linear-to-r from-primary/10 via-secondary/5 to-transparent";

    const h2 = formSection.querySelector('h2');
    if (h2) {
      h2.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-primary shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
        </svg>
        <span class="hidden sm:inline wrap-break-words">Add a New Resource</span>
        <span class="sm:hidden wrap-break-words">Add Resource</span>
      `;
      modalHeader.appendChild(h2);
    }

    const closeBtn = document.createElement('button');
    closeBtn.id = 'close-modal-btn';
    closeBtn.className = "text-muted-foreground hover:text-destructive transition-all duration-200 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-destructive/10 hover:rotate-90";
    closeBtn.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
      </svg>
    `;
    modalHeader.appendChild(closeBtn);

    const modalBody = document.createElement('div');
    modalBody.className = "px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8";

    // Style form and its elements
    if (resourceForm) {
      resourceForm.className = "space-y-4 sm:space-y-6";

      const fieldset = resourceForm.querySelector('fieldset');
      if (fieldset) {
        fieldset.className = "space-y-4 sm:space-y-6 border-0 p-0";

        const legend = fieldset.querySelector('legend');
        if (legend) {
          legend.className = "sr-only";
        }

        // Style form controls
        const labels = fieldset.querySelectorAll('label');
        const inputs = fieldset.querySelectorAll('input, textarea');

        labels.forEach((label, index) => {
          const wrapper = document.createElement('div');
          wrapper.className = "space-y-1.5 sm:space-y-2";

          label.className = "block text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide";
          if (label.getAttribute('for') === 'resource-title' || label.getAttribute('for') === 'resource-link') {
            label.innerHTML += ' <span class="text-destructive">*</span>';
          }

          const input = inputs[index];
          if (input) {
            if (input.tagName === 'TEXTAREA') {
              input.className = "w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-input border-0 rounded-lg sm:rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary resize-y min-h-[100px] sm:min-h-[120px] transition-all duration-200 hover:bg-input/80 wrap-break-word";
              input.placeholder = "Provide a brief description of the resource...";
              input.rows = 4;
            } else {
              input.className = "w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-input border-0 rounded-lg sm:rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary transition-all duration-200 hover:bg-input/80 wrap-break-word";
              if (input.id === 'resource-title') {
                input.placeholder = "e.g., Chapter 1 Notes, Tutorial Video";
              } else if (input.id === 'resource-link') {
                input.placeholder = "https://example.com/example.pdf";
              }
            }

            label.parentNode.insertBefore(wrapper, label);
            wrapper.appendChild(label);
            wrapper.appendChild(input);
          }
        });

        // Style submit button
        const submitBtn = fieldset.querySelector('button[type="submit"]');
        if (submitBtn) {
          const buttonWrapper = document.createElement('div');
          buttonWrapper.className = "flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6";

          submitBtn.className = "flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-bold shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-200";

          const cancelBtn = document.createElement('button');
          cancelBtn.type = 'button';
          cancelBtn.id = 'cancel-btn';
          cancelBtn.className = "px-4 sm:px-8 py-2.5 sm:py-3.5 bg-muted hover:text-destructive/90 text-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-muted/70 transition-all duration-200";
          cancelBtn.textContent = "Cancel";

          submitBtn.parentNode.insertBefore(buttonWrapper, submitBtn);
          buttonWrapper.appendChild(submitBtn);
          buttonWrapper.appendChild(cancelBtn);
        }
      }

      modalBody.appendChild(resourceForm);
    }

    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modalWrapper.appendChild(modalContent);

    formSection.innerHTML = '';
    formSection.appendChild(modalWrapper);
  }

  // Create edit modal
  createEditModal();
}

function createEditModal() {
  const editModal = document.createElement('section');
  editModal.className = "hidden fixed inset-0 z-50 overflow-y-auto";
  editModal.id = "edit-modal";

  const modalWrapper = document.createElement('div');
  modalWrapper.className = "flex min-h-full items-center justify-center p-3 sm:p-4";

  const modalContent = document.createElement('div');
  modalContent.id = 'edit-modal-content';
  modalContent.className = "bg-card rounded-2xl sm:rounded-3xl shadow-2xl w-full max-w-2xl border-2 border-info/20 transform transition-all duration-300 scale-95 opacity-0 mx-4 overflow-hidden";

  const modalHeader = document.createElement('div');
  modalHeader.className = "flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b-2 border-border bg-linear-to-r from-info/10 via-secondary/5 to-transparent";

  const h2 = document.createElement('h2');
  h2.className = "text-lg sm:text-xl lg:text-2xl font-bold text-foreground flex items-center gap-2 my-0";
  h2.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-info shrink-0" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
    <span class="hidden sm:inline wrap-break-words">Edit Resource</span>
    <span class="sm:hidden wrap-break-words">Edit Resource</span>
  `;
  modalHeader.appendChild(h2);

  const closeBtn = document.createElement('button');
  closeBtn.id = 'close-edit-modal-btn';
  closeBtn.className = "text-muted-foreground hover:text-destructive transition-all duration-200 p-1.5 sm:p-2 rounded-lg sm:rounded-xl hover:bg-destructive/10 hover:rotate-90";
  closeBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 sm:h-6 sm:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
      <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  `;
  modalHeader.appendChild(closeBtn);

  const modalBody = document.createElement('div');
  modalBody.className = "px-4 sm:px-6 lg:px-8 py-5 sm:py-6 lg:py-8";

  // Create edit form
  const editForm = document.createElement('form');
  editForm.id = 'edit-resource-form';
  editForm.action = '#';
  editForm.className = "space-y-4 sm:space-y-6";

  editForm.innerHTML = `
    <fieldset class="space-y-4 sm:space-y-6 border-0 p-0">
      <legend class="sr-only">Resource Details</legend>
      
      <div class="space-y-1.5 sm:space-y-2">
        <label for="edit-resource-title" class="block text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          Resource Title <span class="text-destructive">*</span>
        </label>
        <input id="edit-resource-title" type="text" name="edit-resource-title" placeholder="e.g., Chapter 1 Notes, Tutorial Video" required class="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-input border-0 rounded-lg sm:rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-info transition-all duration-200 hover:bg-input/80 wrap-break-word">
      </div>
      
      <div class="space-y-1.5 sm:space-y-2">
        <label for="edit-resource-description" class="block text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">Description</label>
        <textarea name="edit-resource-description" id="edit-resource-description" placeholder="Provide a brief description of the resource..." rows="4" class="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-input border-0 rounded-lg sm:rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-info resize-y min-h-[100px] sm:min-h-[120px] transition-all duration-200 hover:bg-input/80 wrap-break-word"></textarea>
      </div>
      
      <div class="space-y-1.5 sm:space-y-2">
        <label for="edit-resource-link" class="block text-xs sm:text-sm font-bold text-foreground uppercase tracking-wide">
          Resource Link <span class="text-destructive">*</span>
        </label>
        <input name="edit-resource-link" id="edit-resource-link" type="url" placeholder="https://example.com/example.pdf" required class="w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-input border-0 rounded-lg sm:rounded-xl text-sm sm:text-base text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-info transition-all duration-200 hover:bg-input/80 wrap-break-word">
      </div>
      
      <div class="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
        <button type="submit" id="update-resource" class="flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 bg-info hover:bg-info/90 text-info-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-bold shadow-lg sm:shadow-xl hover:shadow-xl sm:hover:shadow-2xl transition-all duration-200">
          Update Resource
        </button>
        <button type="button" id="cancel-edit-btn" class="px-4 sm:px-8 py-2.5 sm:py-3.5 bg-muted hover:text-destructive/90 text-foreground rounded-lg sm:rounded-xl text-sm sm:text-base font-bold hover:bg-muted/70 transition-all duration-200">
          Cancel
        </button>
      </div>
    </fieldset>
  `;

  modalBody.appendChild(editForm);
  modalContent.appendChild(modalHeader);
  modalContent.appendChild(modalBody);
  modalWrapper.appendChild(modalContent);
  editModal.appendChild(modalWrapper);

  document.body.appendChild(editModal);
}

function setupEventListeners() {
  // Get DOM elements after they're created
  const modal = document.getElementById('resource-modal');
  const modalContent = document.getElementById('modal-content');
  const modalOverlay = document.getElementById('modal-overlay');
  const showFormBtnDesktop = document.getElementById('show-form-btn-desktop');
  const showFormBtnMobile = document.getElementById('show-form-btn-mobile');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const cancelBtn = document.getElementById('cancel-btn');

  const editModal = document.getElementById('edit-modal');
  const editModalContent = document.getElementById('edit-modal-content');
  const closeEditModalBtn = document.getElementById('close-edit-modal-btn');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const editResourceForm = document.getElementById('edit-resource-form');

  // Modal functions
  function openModal() {
    modal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
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

  function openEditModal(resource) {
    editingResourceId = resource.id;
    document.getElementById("edit-resource-title").value = resource.title;
    document.getElementById("edit-resource-description").value = resource.description;
    document.getElementById("edit-resource-link").value = resource.link;

    editModal.classList.remove('hidden');
    modalOverlay.classList.remove('hidden');
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

  // Event listeners
  showFormBtnDesktop?.addEventListener('click', openModal);
  showFormBtnMobile?.addEventListener('click', openModal);
  closeModalBtn?.addEventListener('click', closeModal);
  cancelBtn?.addEventListener('click', closeModal);

  closeEditModalBtn?.addEventListener('click', closeEditModal);
  cancelEditBtn?.addEventListener('click', closeEditModal);

  modalOverlay?.addEventListener('click', () => {
    if (!modal.classList.contains('hidden')) {
      closeModal();
    }
    if (!editModal.classList.contains('hidden')) {
      closeEditModal();
    }
  });

  modalContent?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

  editModalContent?.addEventListener('click', (e) => {
    e.stopPropagation();
  });

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

  // Store functions globally for use in other functions
  window.openEditModal = openEditModal;
}

// --- Functions ---

function createResourceRow(resource) {
  if (!resource) return null;

  const tr = document.createElement("tr");
  tr.className = "hover:bg-muted/50 transition-colors duration-150";
  tr.dataset.id = resource.id;

  // Title cell
  const titleCell = document.createElement("td");
  titleCell.className = "px-6 py-4 whitespace-nowrap text-foreground font-medium";
  titleCell.textContent = resource.title;

  // Description cell
  const descCell = document.createElement("td");
  descCell.className = "px-6 py-4 text-sm text-muted-foreground";
  descCell.textContent = resource.description;

  // Actions cell
  const actionsCell = document.createElement("td");
  actionsCell.className = "px-6 py-4 whitespace-nowrap";
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "flex items-center justify-start gap-2 w-full";

  // Edit button
  const editBtn = document.createElement("button");
  editBtn.title = "Edit Resource";
  editBtn.className = "edit-btn p-2 bg-info text-info-foreground rounded hover:bg-info/80 transition-colors duration-150 shadow-sm hover:shadow-md";
  editBtn.dataset.id = resource.id;
  editBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
    </svg>
  `;

  // Delete button  
  const deleteBtn = document.createElement("button");
  deleteBtn.title = "Delete Resource";
  deleteBtn.className = "delete-btn p-2 bg-destructive text-destructive-foreground rounded hover:bg-destructive/80 transition-colors duration-150 shadow-sm hover:shadow-md";
  deleteBtn.dataset.id = resource.id;
  deleteBtn.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
    </svg>
  `;

  actionsDiv.appendChild(editBtn);
  actionsDiv.appendChild(deleteBtn);
  actionsCell.appendChild(actionsDiv);

  tr.appendChild(titleCell);
  tr.appendChild(descCell);
  tr.appendChild(actionsCell);

  return tr;
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
  if (!resourcesTableBody) return;

  // Clear existing rows except sample rows in static HTML
  const dynamicRows = resourcesTableBody.querySelectorAll('tr[data-id]');
  dynamicRows.forEach(row => row.remove());

  // Clear all rows if we have actual data
  if (resources && resources.length > 0) {
    resourcesTableBody.innerHTML = "";
  }

  // Add resource rows
  resources.forEach(resource => {
    const row = createResourceRow(resource);
    if (row) {
      resourcesTableBody.appendChild(row);
    }
  });
}

async function handleAddResource(event) {
  event.preventDefault();
  const title = document.getElementById("resource-title")?.value.trim() || "";
  const description = document.getElementById("resource-description")?.value.trim() || "";
  const link = document.getElementById("resource-link")?.value.trim() || "";

  if (title && description && link) {
    const result = await APIAddResource(title, description, link);
    if (result.success) {
      const id = Number(result.data?.id);
      resources.push({ id, title, description, link });
      renderTable();
      // Close modal using the global function
      const modal = document.getElementById('resource-modal');
      const modalContent = document.getElementById('modal-content');
      const modalOverlay = document.getElementById('modal-overlay');

      modalContent.classList.remove('scale-100', 'opacity-100');
      modalContent.classList.add('scale-95', 'opacity-0');
      modalOverlay.classList.remove('opacity-100');
      setTimeout(() => {
        modal.classList.add('hidden');
        modalOverlay.classList.add('hidden');
      }, 200);
      resourceForm.reset();
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
    });

    const res = await req.json();

    if (!req.ok || !res.success) {
      throw res;
    }

    return res;
  } catch (e) {
    console.error("API Error:", e);
    if (e.success !== undefined) {
      return e;
    }
    return { success: false, message: e.message };
  }
}

async function handleEditResource(event) {
  event.preventDefault();
  const title = document.getElementById("edit-resource-title")?.value.trim() || "";
  const description = document.getElementById("edit-resource-description")?.value.trim() || "";
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

      // Close edit modal
      const editModal = document.getElementById('edit-modal');
      const editModalContent = document.getElementById('edit-modal-content');
      const modalOverlay = document.getElementById('modal-overlay');
      const editResourceForm = document.getElementById('edit-resource-form');

      editModalContent.classList.remove('scale-100', 'opacity-100');
      editModalContent.classList.add('scale-95', 'opacity-0');
      modalOverlay.classList.remove('opacity-100');
      setTimeout(() => {
        editModal.classList.add('hidden');
        modalOverlay.classList.add('hidden');
      }, 200);
      editingResourceId = null;
      editResourceForm.reset();
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

    if (!req.ok || !res.success) {
      throw res;
    }

    return res;
  } catch (e) {
    console.error("API Error:", e);
    if (e.success !== undefined) {
      return e;
    }
    return { success: false, message: e.message };
  }
}

async function APIDeleteResource(id) {
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php?id=${parseInt(id)}`, {
      method: "DELETE",
      credentials: "include"
    });

    const res = await req.json();

    if (!req.ok || !res.success) {
      throw res;
    }

    return res;
  } catch (e) {
    console.error("API Error:", e);
    if (e.success !== undefined) {
      return e;
    }
    return { success: false, message: e.message };
  }
}

async function handleTableClick(event) {
  const deleteBtn = event.target.closest(".delete-btn");
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
    if (resource && window.openEditModal) {
      window.openEditModal(resource);
    }
  }
}

async function loadAndInitialize() {
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php`, { credentials: 'include' });
    const res = await req.json();
    if (!req?.ok || !res?.success) {
      throw res;
    }
    resources = res?.data || [];
    renderTable();

    // Set up event listeners after DOM is ready
    if (resourceForm) {
      resourceForm.addEventListener("submit", handleAddResource);
    }

    const editResourceForm = document.getElementById('edit-resource-form');
    if (editResourceForm) {
      editResourceForm.addEventListener("submit", handleEditResource);
    }

    if (resourcesTableBody) {
      resourcesTableBody.addEventListener("click", handleTableClick);
    }
  } catch (err) {
    console.error("Error in initializing: ", err?.message);
  }
}

// --- Initial Page Load ---
checkAdmin().then(ok => {
  initializeUI();
  loadAndInitialize();
}
);

