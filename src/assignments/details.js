/*
  Requirement: Populate the assignment detail page and discussion forum.

  Instructions:
  1. Link this file to `details.html` using:
     <script src="details.js" defer></script>

  2. In `details.html`, add the following IDs:
     - To the <h1>: `id="assignment-title"`
     - To the "Due" <p>: `id="assignment-due-date"`
     - To the "Description" <p>: `id="assignment-description"`
     - To the "Attached Files" <ul>: `id="assignment-files-list"`
     - To the <div> for comments: `id="comment-list"`
     - To the "Add a Comment" <form>: `id="comment-form"`
     - To the <textarea>: `id="new-comment-text"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// These will hold the data related to *this* assignment.
let currentAssignmentId = null;
let currentComments = [];

// --- Element Selections ---
// TODO: Select all the elements you added IDs for in step 2.
const commentModal = document.getElementById('comment-modal') ;
const commentModalContent =  document.getElementById('comment-modal-content') ;
const commentModalOverlay = document.getElementById('comment-modal-overlay') ;
const showCommentBtnMobile = document.getElementById('show-comment-btn-mobile') ;
const closeCommentModalBtn = document.getElementById('close-comment-modal-btn') ;
const cancelCommentBtn = document.getElementById('cancel-comment-btn') ;
const commentForm = document.getElementById('comment-form') ;
const commentFormMobileWrapper = document.getElementById('comment-form-mobile-wrapper') ;

const assignmentTitle = document.getElementById('assignment-title') ;
const assignmentDueDate = document.getElementById('assignment-due-date') ;
const assignmentDescription = document.getElementById('assignment-description') ;
const assignmentFilesList = document.getElementById('assignment-files-list') ;
const newCommentText = document.getElementById('new-comment-text') ;
const commentList = document.getElementById('comment-list') ;

// --- Functions ---

/**
 * TODO: Implement the getAssignmentIdFromURL function.
 * It should:
 * 1. Get the query string from `window.location.search`.
 * 2. Use the `URLSearchParams` object to get the value of the 'id' parameter.
 * 3. Return the id.
 */
function getAssignmentIdFromURL() {
  // ... your implementation here ...

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams.get('id');
}

/**
 * TODO: Implement the renderAssignmentDetails function.
 * It takes one assignment object.
 * It should:
 * 1. Set the `textContent` of `assignmentTitle` to the assignment's title.
 * 2. Set the `textContent` of `assignmentDueDate` to "Due: " + assignment's dueDate.
 * 3. Set the `textContent` of `assignmentDescription`.
 * 4. Clear `assignmentFilesList` and then create and append
 * `<li><a href="#">...</a></li>` for each file in the assignment's 'files' array.
 */
function renderAssignmentDetails(assignment) {
  if (!assignment) return;
  if (assignmentTitle) assignmentTitle.textContent = assignment.title || '';
  if (assignmentDueDate) assignmentDueDate.textContent = assignment.dueDate ? `Due: ${assignment.dueDate}` : 'No due date';
  if (assignmentDescription) assignmentDescription.textContent = assignment.description || '';

  if (assignmentFilesList) {
    assignmentFilesList.innerHTML = '';
    const files = Array.isArray(assignment.files) ? assignment.files : [];
    files.forEach((f) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.textContent = f;
      a.className = 'text-primary hover:underline';
      li.appendChild(a);
      assignmentFilesList.appendChild(li);
    });
  }
}

/**
 * TODO: Implement the createCommentArticle function.
 * It takes one comment object {author, text}.
 * It should return an <article> element matching the structure in `details.html`.
 */
function createCommentArticle(comment) {
  const article = document.createElement('article');
  article.className = 'bg-card border border-border/50 rounded-xl p-6 hover:border-info/30 hover:shadow-md transition-all duration-200';

  const outer = document.createElement('div');
  outer.className = 'flex items-start gap-4';

  const avatarWrap = document.createElement('div');
  avatarWrap.className = 'mt-1 p-3 bg-info/10 rounded-full';
  avatarWrap.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-info" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`;

  const contentWrap = document.createElement('div');
  contentWrap.className = 'flex-1 min-w-0';

  const p = document.createElement('p');
  p.className = 'ml-0 text-foreground leading-relaxed mb-3';
  p.textContent = comment.text || '';

  const footer = document.createElement('footer');
  footer.className = 'ml-0 flex items-center gap-4 text-sm justify-between';
  const authorSpan = document.createElement('span');
  authorSpan.textContent = comment.author || 'Student';
  authorSpan.className = 'font-semibold text-accent';
  const dateSpan = document.createElement('span');
  dateSpan.textContent = comment.date || 'Just now';
  dateSpan.className = 'text-muted-foreground text-xs';

  footer.append(authorSpan, dateSpan);
  contentWrap.append(p, footer);
  outer.append(avatarWrap, contentWrap);
  article.appendChild(outer);
  return article;
}

/**
 * TODO: Implement the renderComments function.
 * It should:
 * 1. Clear the `commentList`.
 * 2. Loop through the global `currentComments` array.
 * 3. For each comment, call `createCommentArticle()`, and
 * append the resulting <article> to `commentList`.
 */
function renderComments() {
  if (!commentList) return;
  commentList.innerHTML = '';
  currentComments.forEach((c) => {
    commentList.appendChild(createCommentArticle(c));
  });
}

/**
 * TODO: Implement the handleAddComment function.
 * This is the event handler for the `commentForm` 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the text from `newCommentText.value`.
 * 3. If the text is empty, return.
 * 4. Create a new comment object: { author: 'Student', text: commentText }
 * (For this exercise, 'Student' is a fine hardcoded author).
 * 5. Add the new comment to the global `currentComments` array (in-memory only).
 * 6. Call `renderComments()` to refresh the list.
 * 7. Clear the `newCommentText` textarea.
 */
function handleAddComment(event) {
  if (event && event.preventDefault) event.preventDefault();
  if (!newCommentText) return;
  const text = newCommentText.value.trim();
  if (!text) return;
  const comment = { author: 'Student', text };
  currentComments.push(comment);
  renderComments();
  newCommentText.value = '';

  // Close mobile modal if present
  if (window.innerWidth < 768 && typeof closeCommentModal === 'function') {
    try { closeCommentModal(); } catch (e) { /* ignore */ }
  }
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. Get the `currentAssignmentId` by calling `getAssignmentIdFromURL()`.
 * 2. If no ID is found, display an error and stop.
 * 3. `fetch` both 'assignments.json' and 'comments.json' (you can use `Promise.all`).
 * 4. Find the correct assignment from the assignments array using the `currentAssignmentId`.
 * 5. Get the correct comments array from the comments object using the `currentAssignmentId`.
 * Store this in the global `currentComments` variable.
 * 6. If the assignment is found:
 * - Call `renderAssignmentDetails()` with the assignment object.
 * - Call `renderComments()` to show the initial comments.
 * - Add the 'submit' event listener to `commentForm` (calls `handleAddComment`).
 * 7. If the assignment is not found, display an error.
 */
async function initializePage() {
  const id = getAssignmentIdFromURL();
  if (!id) {
    if (assignmentTitle) assignmentTitle.textContent = 'Assignment not found.';
    return;
  }

  try {
    const [rResp, cResp] = await Promise.all([
      fetch('/src/assignments/api/assignments.json'),
      fetch('/src/assignments/api/comments.json')
    ]);
    const assignments = rResp.ok ? await rResp.json() : [];
    const commentsObj = cResp.ok ? await cResp.json() : {};

    const current = assignments.find((a) => a.id === id);
    currentComments = commentsObj[id] || [];

    if (current) {
      renderAssignmentDetails(current);
      renderComments();
      if (commentForm) commentForm.addEventListener('submit', handleAddComment);
    } else {
      if (assignmentTitle) assignmentTitle.textContent = 'Assignment not found.';
    }
  } catch (err) {
    console.error('Error initializing assignment details:', err);
    if (assignmentTitle) assignmentTitle.textContent = 'Error loading assignment.';
  }
}

// --- Initial Page Load ---
initializePage();
