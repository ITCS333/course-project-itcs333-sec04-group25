/*
  Requirement: Make the "Manage Weekly Breakdown" page interactive.

  Instructions:
  1. Link this file to `admin.html` using:
     <script src="admin.js" defer></script>
  
  2. In `admin.html`, add an `id="weeks-tbody"` to the <tbody> element
     inside your `weeks-table`.
  
  3. Implement the TODOs below.
*/

import { checkAdmin } from "/src/common/helpers.js";

// --- Global Data Store ---
// This will hold the weekly data loaded from the JSON file.
let weeks = [];
let editingWeekId = null; // Track which week is being edited

// --- Element Selections ---
// TODO: Select the week form ('#week-form').
const WeekForm = document.querySelector('#week-form');

// TODO: Select the weeks table body ('#weeks-tbody').
const WeekTbody = document.querySelector('#weeks-tbody');

// Modal elements
const editModal = document.querySelector('#edit-modal');
const editForm = document.querySelector('#edit-form');
const closeModalBtn = document.querySelector('#close-modal');
const cancelEditBtn = document.querySelector('#cancel-edit');

// --- Functions ---

/**
 * TODO: Implement the createWeekRow function.
 * It takes one week object {id, title, description}.
 * It should return a <tr> element with the following <td>s:
 * 1. A <td> for the `title`.
 * 2. A <td> for the `description`.
 * 3. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and `data-id="${id}"`.
 * - A "Delete" button with class "delete-btn" and `data-id="${id}"`.
 */
function createWeekRow(week) {
  const Week = document.createElement('tr');
  Week.className = 'border-b border-border hover:bg-muted/30 transition-colors';

  const title = document.createElement('td');
  title.className = 'px-6 py-4 text-foreground';
  title.textContent = week.title;

  const description = document.createElement('td');
  description.className = 'px-6 py-4 text-foreground';
  description.textContent = week.description;

  const actionTd = document.createElement("td");
  actionTd.className = 'px-6 py-4 whitespace-nowrap';
  actionTd.innerHTML = `
      <button class="edit-btn px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors mr-2" data-id="${week.id}">Edit</button>
      <button class="delete-btn px-4 py-2 bg-destructive text-white rounded-lg hover:bg-destructive/90 transition-colors" data-id="${week.id}">Delete</button>
  `;

  Week.appendChild(title);
  Week.appendChild(description);
  Week.appendChild(actionTd);

  return Week;
}

/**
 * TODO: Implement the renderTable function.
 * It should:
 * 1. Clear the `weeksTableBody`.
 * 2. Loop through the global `weeks` array.
 * 3. For each week, call `createWeekRow()`, and
 * append the resulting <tr> to `weeksTableBody`.
 */
function renderTable() {
  WeekTbody.innerHTML = '';

  for (let week of weeks) {
    const row = createWeekRow(week);
    WeekTbody.appendChild(row);
  }
}

/**
 * TODO: Implement the handleAddWeek function.
 * This is the event handler for the form's 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the values from the title, start date, and description inputs.
 * 3. Get the value from the 'week-links' textarea. Split this value
 * by newlines (`\n`) to create an array of link strings.
 * 4. Create a new week object with a unique ID (e.g., `id: \`week_${Date.now()}\``).
 * 5. Add this new week object to the global `weeks` array (in-memory only).
 * 6. Call `renderTable()` to refresh the list.
 * 7. Reset the form.
 */
async function handleAddWeek(event) {
  event.preventDefault();

  const title = document.querySelector('#week-title').value;
  const startDate = document.querySelector('#week-start-date').value;
  const description = document.querySelector('#week-description').value;

  if (!title.trim() || !startDate || !description.trim()) {
    alert('Please fill in all required fields with valid content.');
    return;
  }


  const linksValue = document.querySelector('#week-links').value;
  const links = linksValue.split('\n').filter(link => link.trim() !== '');

  try {
    const response = await fetch(`api/index.php?resource=weeks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: "include",
      body: JSON.stringify({
        title: title,
        start_date: startDate,
        description: description,
        links: links
      })
    });
    const result = await response.json();
    if (result.success) {
      await loadAndInitialize(); // reload weeks from API
      WeekForm.reset();
    } else {
      alert('Failed to add week: ' + (result.error || result.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('Error adding week:', error);
    alert('Error adding week. Check the console for details.');
  }
}

/**
 * TODO: Implement the handleTableClick function.
 * This is an event listener on the `weeksTableBody` (for delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it does, get the `data-id` attribute from the button.
 * 3. Update the global `weeks` array by filtering out the week
 * with the matching ID (in-memory only).
 * 4. Call `renderTable()` to refresh the list.
 */
async function handleTableClick(event) {
  if (event.target.classList.contains('delete-btn')) {
    const weekId = event.target.getAttribute('data-id');
    if (confirm('Are you sure you want to delete this week?')) {
      const success = await deleteWeekFromAPI(weekId);
      if (success) {
        await loadAndInitialize(); // reload weeks from API
      } else {
        alert('Failed to delete week.');
      }
    }
  }

  if (event.target.classList.contains('edit-btn')) {
    const weekId = event.target.getAttribute('data-id');
    openEditModal(weekId);
  }
}

async function deleteWeekFromAPI(weekId) {
  const response = await fetch(`api/index.php?resource=weeks&id=${weekId}`, {
    method: 'DELETE',
    credentials: "include"
  });
  const result = await response.json();
  return result.success;
}

/**
 * Open the edit modal and populate it with week data
 */
function openEditModal(weekId) {
  const week = weeks.find(w => w.id == weekId); // Use == for type coercion
  if (week) {
    editingWeekId = weekId;
    document.querySelector('#edit-week-title').value = week.title;
    document.querySelector('#edit-week-start-date').value = week.startDate;
    document.querySelector('#edit-week-description').value = week.description;
    document.querySelector('#edit-week-links').value = week.links.join('\n');
    document.body.style.overflow = 'hidden';
    editModal.classList.remove('hidden');
    editModal.classList.add('flex');
    setTimeout(() => {
      document.querySelector('#modal-content').classList.remove('scale-95', 'opacity-0');
      document.querySelector('#modal-content').classList.add('scale-100', 'opacity-100');
    }, 10);
  }
}

/**
 * Close the edit modal
 */
function closeEditModal() {
  document.querySelector('#modal-content').classList.add('scale-95', 'opacity-0');
  document.querySelector('#modal-content').classList.remove('scale-100', 'opacity-100');

  setTimeout(() => {
    editModal.classList.add('hidden');
    editModal.classList.remove('flex');
    editingWeekId = null;
    editForm.reset();

    document.body.style.overflow = '';
  }, 300);
}

/**
 * Handle edit form submission
 */
async function handleEditSubmit(event) {
  event.preventDefault();

  const weekIndex = weeks.findIndex(w => w.id == editingWeekId);
  if (weekIndex === -1) return;

  const linksValue = document.querySelector('#edit-week-links').value;
  const links = linksValue.split('\n').filter(link => link.trim() !== '');

  // Prepare updated week
  const updatedWeek = {
    ...weeks[weekIndex],
    title: document.querySelector('#edit-week-title').value,
    startDate: document.querySelector('#edit-week-start-date').value,
    description: document.querySelector('#edit-week-description').value,
    links: links
  };

  // --- 1. Immediately update in-memory and DOM ---
  weeks[weekIndex] = updatedWeek;
  renderTable();
  closeEditModal();

  // --- 2. Then send API request in background ---
  try {
    const success = await updateWeekInAPI(updatedWeek);
    if (!success) {
      alert('Failed to save week changes to server.');
      await loadAndInitialize();
    }
  } catch (err) {
    console.error(err);
    alert('Error saving changes.');
    await loadAndInitialize();
  }
}



async function updateWeekInAPI(week) {
  const response = await fetch(`api/index.php?resource=weeks`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: week.id,
      title: week.title,
      start_date: week.startDate,
      description: week.description,
      links: week.links
    }),
    credentials: "include"
  });
  const result = await response.json();
  return result.success;
}

/**
 * TODO: Implement the loadAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'weeks.json'.
 * 2. Parse the JSON response and store the result in the global `weeks` array.
 * 3. Call `renderTable()` to populate the table for the first time.
 * 4. Add the 'submit' event listener to `weekForm` (calls `handleAddWeek`).
 * 5. Add the 'click' event listener to `weeksTableBody` (calls `handleTableClick`).
 */
async function loadAndInitialize() {
  try {
    const response = await fetch(`api/index.php?resource=weeks`, {
      credentials: "include"
    });
    if (!response.ok) throw new Error('Network response was not ok');

    const result = await response.json();

    if (result.success) {
      // Map backend fields to camelCase
      weeks = result.data.map(w => ({
        id: w.id,
        title: w.title,
        startDate: w.start_date, // map to camelCase
        description: w.description,
        links: w.links,
        createdAt: w.created_at
      }));
      renderTable();
    } else {
      console.error('Error loading weeks:', result.error);
      alert('Failed to load weeks: ' + (result.error || 'Unknown error'));
    }
    WeekForm.addEventListener('submit', handleAddWeek);
    WeekTbody.addEventListener('click', handleTableClick);
    editForm.addEventListener('submit', handleEditSubmit);
    closeModalBtn.addEventListener('click', closeEditModal);
    cancelEditBtn.addEventListener('click', closeEditModal);

    editModal.addEventListener('click', (e) => {
      if (e.target === editModal) {
        closeEditModal();
      }
    });

  } catch (error) {
    console.log(error);
    console.error('Error fetching weeks:', error);
    alert('Error loading weeks. Check the console for details.');
  }
}


// --- Initial Page Load ---
// Call the main async function to start the application.
checkAdmin().then(ok => {
  if (ok) loadAndInitialize();
})