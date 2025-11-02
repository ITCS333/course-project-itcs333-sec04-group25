/*
  Requirement: Add interactivity and data management to the Admin Portal.

  Instructions:
  1. Link this file to your HTML using a <script> tag with the 'defer' attribute.
     Example: <script src="manage_users.js" defer></script>
  2. Implement the JavaScript functionality as described in the TODO comments.
  3. All data management will be done by manipulating the 'students' array
     and re-rendering the table.
*/

// --- Global Data Store ---
// This array will be populated with data fetched from 'students.json'.
let students = [];

// --- Element Selections ---
// We can safely select elements here because 'defer' guarantees
// the HTML document is parsed before this script runs.

// TODO: Select the student table body (tbody).
const studentTableBody = document.querySelector("#student-table tbody");

// TODO: Select the "Add Student" form.
// (You'll need to add id="add-student-form" to this form in your HTML).
const addStudentForm = document.getElementById("add-student-form");

// TODO: Select the "Change Password" form.
// (You'll need to add id="password-form" to this form in your HTML).
const changePasswordForm = document.getElementById("password-form");

// TODO: Select the search input field.
// (You'll need to add id="search-input" to this input in your HTML).
const searchInput = document.getElementById("search-input");

// TODO: Select all table header (th) elements in thead.
const tableHeaders = document.querySelectorAll("#student-table thead th");

// customized Confirm, alert, and prompt

//confirm
function showConfirm(message) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in";
    modal.innerHTML = `
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-warning/30 animate-in">
        <div class="flex items-center gap-3 mb-4">
          <svg class="w-8 h-8 text-warning" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <h3 class="text-xl font-bold text-foreground">Confirm Action</h3>
        </div>
        <p class="text-muted-foreground mb-8 text-base leading-relaxed">${message}</p>
        <div class="flex gap-3 justify-end">
          <button class="cancel-btn btn btn-outline shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">Cancel</button>
          <button class="confirm-btn btn btn-destructive shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector(".cancel-btn").onclick = () => {
      document.body.removeChild(modal);
      resolve(false);
    };
    modal.querySelector(".confirm-btn").onclick = () => {
      document.body.removeChild(modal);
      resolve(true);
    };
    modal.onclick = (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
        resolve(false);
      }
    };
  });
}

//prompt
function showPrompt(message, defaultValue = "") {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in";
    modal.innerHTML = `
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-primary/30 animate-in">
        <div class="flex items-center gap-3 mb-6">
          <svg class="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <h3 class="text-xl font-bold text-foreground">Enter Value</h3>
        </div>
        <label class="label mb-3 text-sm font-semibold">${message}</label>
        <input type="text" class="input mb-8 shadow-sm hover:shadow-md focus:shadow-lg transition-all" value="${defaultValue}" id="prompt-input">
        <div class="flex gap-3 justify-end">
          <button class="cancel-btn btn btn-outline shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">Cancel</button>
          <button class="ok-btn btn btn-primary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const input = modal.querySelector("#prompt-input");
    input.focus();
    input.select();

    const handleOk = () => {
      const value = input.value.trim();
      document.body.removeChild(modal);
      resolve(value || null);
    };

    modal.querySelector(".cancel-btn").onclick = () => {
      document.body.removeChild(modal);
      resolve(null);
    };
    modal.querySelector(".ok-btn").onclick = handleOk;
    input.onkeydown = (e) => {
      if (e.key === "Enter") handleOk();
      if (e.key === "Escape") {
        document.body.removeChild(modal);
        resolve(null);
      }
    };
  });
}

//alert
function showAlert(message, type = "info") {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in";
    const alertClass =
      type === "success"
        ? "alert-success"
        : type === "error"
        ? "alert-error"
        : "alert-info";
    const iconSvg =
      type === "success"
        ? `<svg class="w-8 h-8 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        : type === "error"
        ? `<svg class="w-8 h-8 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`
        : `<svg class="w-8 h-8 text-info" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>`;
    modal.innerHTML = `
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-${
        type === "success" ? "success" : type === "error" ? "error" : "info"
      }/30 animate-in">
        <div class="flex items-start gap-4 mb-6">
          ${iconSvg}
          <div class="alert ${alertClass} flex-1">${message}</div>
        </div>
        <div class="flex justify-end">
          <button class="ok-btn btn btn-primary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">OK</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    const closeModal = () => {
      document.body.removeChild(modal);
      resolve();
    };

    modal.querySelector(".ok-btn").onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };
  });
}

// Edit Student Form Modal
function showEditStudentForm(student) {
  return new Promise((resolve) => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 bg-black/60 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in";
    modal.innerHTML = `
      <div class="bg-card rounded-2xl shadow-2xl max-w-md w-full p-8 border-2 border-secondary/30 animate-in">
        <div class="flex items-center gap-3 mb-8">
          <svg class="w-8 h-8 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <h3 class="text-2xl font-bold text-foreground">Edit Student</h3>
        </div>
        <form id="edit-student-form" class="space-y-6">
          <div class="space-y-2">
            <label for="edit-name" class="label text-sm font-semibold">Full Name</label>
            <input type="text" id="edit-name" class="input shadow-sm hover:shadow-md focus:shadow-lg transition-all" value="${student.name}" required>
          </div>
          <div class="space-y-2">
            <label for="edit-id" class="label text-sm font-semibold">Student ID</label>
            <input type="text" id="edit-id" class="input shadow-sm hover:shadow-md focus:shadow-lg transition-all" value="${student.id}" required>
          </div>
          <div class="space-y-2">
            <label for="edit-email" class="label text-sm font-semibold">Email Address</label>
            <input type="email" id="edit-email" class="input shadow-sm hover:shadow-md focus:shadow-lg transition-all" value="${student.email}" required>
          </div>
          <div class="flex gap-3 justify-end pt-4">
            <button type="button" class="cancel-btn btn btn-outline shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">Cancel</button>
            <button type="submit" class="btn btn-primary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105">
              <svg class="w-5 h-5 inline-block mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
              </svg>
              Save Changes
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    const form = modal.querySelector("#edit-student-form");
    const nameInput = modal.querySelector("#edit-name");
    const idInput = modal.querySelector("#edit-id");
    const emailInput = modal.querySelector("#edit-email");

    nameInput.focus();
    nameInput.select();

    const handleSubmit = (e) => {
      e.preventDefault();
      const name = nameInput.value.trim();
      const id = idInput.value.trim();
      const email = emailInput.value.trim();

      if (name && id && email) {
        document.body.removeChild(modal);
        resolve({ name, id, email });
      }
    };

    const handleCancel = () => {
      document.body.removeChild(modal);
      resolve(null);
    };

    form.addEventListener("submit", handleSubmit);
    modal.querySelector(".cancel-btn").addEventListener("click", handleCancel);
    modal.onclick = (e) => {
      if (e.target === modal) handleCancel();
    };
  });
}

// --- Functions ---

/**
 * TODO: Implement the createStudentRow function.
 * This function should take a student object {name, id, email} and return a <tr> element.
 * The <tr> should contain:
 * 1. A <td> for the student's name.
 * 2. A <td> for the student's ID.
 * 3. A <td> for the student's email.
 * 4. A <td> containing two buttons:
 * - An "Edit" button with class "edit-btn" and a data-id attribute set to the student's ID.
 * - A "Delete" button with class "delete-btn" and a data-id attribute set to the student's ID.
 */
function createStudentRow(student) {
  const tr = document.createElement("tr");
  tr.classList.add(
    "hover:bg-gradient-to-r",
    "hover:from-muted/30",
    "hover:to-transparent",
    "transition-all",
    "duration-200"
  );

  // Create table cells with proper styling
  const studentName = document.createElement("td");
  studentName.className = "p-5 font-bold text-foreground";
  studentName.textContent = student.name;

  const studentID = document.createElement("td");
  studentID.className =
    "p-5 text-muted-foreground font-mono text-sm font-semibold";
  studentID.textContent = student.id;

  const studentEmail = document.createElement("td");
  studentEmail.className = "p-5 text-muted-foreground text-sm";
  studentEmail.textContent = student.email;

  const actionTd = document.createElement("td");
  actionTd.className = "p-5";
  actionTd.innerHTML = `
    <div class="flex items-center justify-center gap-3">
      <button class="edit-btn btn btn-sm btn-secondary shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group" data-id="${student.id}">
        <svg class="w-4 h-4 inline-block mr-1 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
        Edit
      </button>
      <button class="delete-btn btn btn-sm btn-destructive shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 active:scale-95 group" data-id="${student.id}">
        <svg class="w-4 h-4 inline-block mr-1 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
        Delete
      </button>
    </div>`;

  tr.appendChild(studentName);
  tr.appendChild(studentID);
  tr.appendChild(studentEmail);
  tr.appendChild(actionTd);
  return tr;
}

/**
 * TODO: Implement the renderTable function.
 * This function takes an array of student objects.
 * It should:
 * 1. Clear the current content of the `studentTableBody`.
 * 2. Loop through the provided array of students.
 * 3. For each student, call `createStudentRow` and append the returned <tr> to `studentTableBody`.
 */
function renderTable(studentArray) {
  studentTableBody.innerHTML = "";
  studentArray.forEach((student) => {
    const tr = createStudentRow(student);
    studentTableBody.appendChild(tr);
  });
}

/**
 * TODO: Implement the handleChangePassword function.
 * This function will be called when the "Update Password" button is clicked.
 * It should:
 * 1. Prevent the form's default submission behavior.
 * 2. Get the values from "current-password", "new-password", and "confirm-password" inputs.
 * 3. Perform validation:
 * - If "new-password" and "confirm-password" do not match, show an alert: "Passwords do not match."
 * - If "new-password" is less than 8 characters, show an alert: "Password must be at least 8 characters."
 * 4. If validation passes, show an alert: "Password updated successfully!"
 * 5. Clear all three password input fields.
 */
async function handleChangePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById("current-password").value;
  const newPassword = document.getElementById("new-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (newPassword !== confirmPassword) {
    await showAlert("Passwords do not match.", "error");
    return;
  }

  if (newPassword.length < 8) {
    await showAlert("Password must be at least 8 characters.", "error");
    return;
  }

  await showAlert("Password updated successfully!", "success");
  document.getElementById("current-password").value = "";
  document.getElementById("new-password").value = "";
  document.getElementById("confirm-password").value = "";
}

/**
 * TODO: Implement the handleAddStudent function.
 * This function will be called when the "Add Student" button is clicked.
 * It should:
 * 1. Prevent the form's default submission behavior.
 * 2. Get the values from "student-name", "student-id", and "student-email".
 * 3. Perform validation:
 * - If any of the three fields are empty, show an alert: "Please fill out all required fields."
 * - (Optional) Check if a student with the same ID already exists in the 'students' array.
 * 4. If validation passes:
 * - Create a new student object: { name, id, email }.
 * - Add the new student object to the global 'students' array.
 * - Call `renderTable(students)` to update the view.
 * 5. Clear the "student-name", "student-id", "student-email", and "default-password" input fields.
 */
async function handleAddStudent(event) {
  event.preventDefault();
  const name = document.getElementById("student-name").value.trim();
  const id = document.getElementById("student-id").value.trim();
  const email = document.getElementById("student-email").value.trim();
  const defaultPassword = document
    .getElementById("default-password")
    .value.trim();
  if (!id || !name || !email) {
    await showAlert("Please fill out all required fields.", "error");
    return;
  }
  if (students.some((student) => student.id === id)) {
    await showAlert("Student with the same ID already exists.", "error");
    return;
  } else if (students.some((student) => student.email === email)) {
    await showAlert("Student with the same email already exists.", "error");
    return;
  }
  const newStudent = { name, id, email, password: defaultPassword };
  students.push(newStudent);
  renderTable(students);
  document.getElementById("student-name").value = "";
  document.getElementById("student-id").value = "";
  document.getElementById("student-email").value = "";
  document.getElementById("default-password").value = "";

  const details = document.getElementById("add-student-details");
  if (details) details.removeAttribute("open");

  await showAlert("Student added successfully!", "success");
}

/**
 * TODO: Implement the handleTableClick function.
 * This function will be an event listener on the `studentTableBody` (event delegation).
 * It should:
 * 1. Check if the clicked element (`event.target`) has the class "delete-btn".
 * 2. If it is a "delete-btn":
 * - Get the `data-id` attribute from the button.
 * - Update the global 'students' array by filtering out the student with the matching ID.
 * - Call `renderTable(students)` to update the view.
 * 3. (Optional) Check for "edit-btn" and implement edit logic.
 */
async function handleTableClick(event) {
  if (event.target.classList.contains("delete-btn")) {
    const confirmed = await showConfirm(
      "Are you sure you want to delete this student?"
    );
    if (!confirmed) return;

    const studentId = event.target.getAttribute("data-id");
    students = students.filter((student) => student.id !== studentId);
    renderTable(students);
    await showAlert("Student deleted successfully!", "success");
  }

  if (event.target.classList.contains("edit-btn")) {
    const studentId = event.target.getAttribute("data-id");
    const student = students.find((s) => s.id === studentId);

    const updatedData = await showEditStudentForm(student);
    if (!updatedData) return;

    if (
      updatedData.id !== student.id &&
      students.some((s) => s.id === updatedData.id)
    ) {
      await showAlert("A student with this ID already exists.", "error");
      return;
    }

    student.name = updatedData.name;
    student.id = updatedData.id;
    student.email = updatedData.email;
    renderTable(students);
    await showAlert("Student updated successfully!", "success");
  }
}

/**
 * TODO: Implement the handleSearch function.
 * This function will be called on the "input" event of the `searchInput`.
 * It should:
 * 1. Get the search term from `searchInput.value` and convert it to lowercase.
 * 2. If the search term is empty, call `renderTable(students)` to show all students.
 * 3. If the search term is not empty:
 * - Filter the global 'students' array to find students whose name (lowercase)
 * includes the search term.
 * - Call `renderTable` with the *filtered array*.
 */
function handleSearch(event) {
  const searchTerm = event.target.value.toLowerCase();
  if (!searchTerm) {
    renderTable(students);
    return;
  }
  const filteredStudents = students.filter((student) => {
    return student.name.toLowerCase().includes(searchTerm);
  });
  renderTable(filteredStudents);
}

/**
 * TODO: Implement the handleSort function.
 * This function will be called when any `th` in the `thead` is clicked.
 * It should:
 * 1. Identify which column was clicked (e.g., `event.currentTarget.cellIndex`).
 * 2. Determine the property to sort by ('name', 'id', 'email') based on the index.
 * 3. Determine the sort direction. Use a data-attribute (e.g., `data-sort-dir="asc"`) on the `th`
 * to track the current direction. Toggle between "asc" and "desc".
 * 4. Sort the global 'students' array *in place* using `array.sort()`.
 * - For 'name' and 'email', use `localeCompare` for string comparison.
 * - For 'id', compare the values as numbers.
 * 5. Respect the sort direction (ascending or descending).
 * 6. After sorting, call `renderTable(students)` to update the view.
 */
function handleSort(event) {
  const th = event.currentTarget;
  const columnIndex = th.cellIndex;
  let sortProperty;
  if (columnIndex === 0) sortProperty = "name";
  else if (columnIndex === 1) sortProperty = "id";
  else if (columnIndex === 2) sortProperty = "email";
  else return;
  let sortDir = th.getAttribute("data-sort-dir") || "asc";
  sortDir = sortDir === "asc" ? "desc" : "asc";
  th.setAttribute("data-sort-dir", sortDir);
  students.sort((a, b) => {
    let comparison = 0;
    if (sortProperty === "id") {
      comparison = Number(a.id) - Number(b.id);
    } else {
      comparison = a[sortProperty].localeCompare(b[sortProperty]);
    }
    return sortDir === "asc" ? comparison : -comparison;
  });
  renderTable(students);
}

/**
 * TODO: Implement the loadStudentsAndInitialize function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use the `fetch()` API to get data from 'students.json'.
 * 2. Check if the response is 'ok'. If not, log an error.
 * 3. Parse the JSON response (e.g., `await response.json()`).
 * 4. Assign the resulting array to the global 'students' variable.
 * 5. Call `renderTable(students)` to populate the table for the first time.
 * 6. After data is loaded, set up all the event listeners:
 * - "submit" on `changePasswordForm` -> `handleChangePassword`
 * - "submit" on `addStudentForm` -> `handleAddStudent`
 * - "click" on `studentTableBody` -> `handleTableClick`
 * - "input" on `searchInput` -> `handleSearch`
 * - "click" on each header in `tableHeaders` -> `handleSort`
 */
async function loadStudentsAndInitialize() {
  try {
    const response = await fetch("api/students.json");
    if (!response.ok) throw new Error("Network response was not ok");
    students = await response.json();
    renderTable(students);
  } catch (error) {
    console.error("Error loading students:", error);
  }

  // Set up event listeners
  changePasswordForm.addEventListener("submit", handleChangePassword);
  addStudentForm.addEventListener("submit", handleAddStudent);
  studentTableBody.addEventListener("click", handleTableClick);
  searchInput.addEventListener("input", handleSearch);
  tableHeaders.forEach((th) => th.addEventListener("click", handleSort));
}

// --- Initial Page Load ---
// Call the main async function to start the application.
loadStudentsAndInitialize();
