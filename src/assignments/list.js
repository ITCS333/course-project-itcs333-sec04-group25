/*
  Requirement: Populate the "Course Assignments" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="assignment-list-section"` to the
     <section> element that will contain the assignment articles.

  3. Implement the TODOs below.
*/

// --- Element Selections ---
// TODO: Select the section for the assignment list ('#assignment-list-section').
const assignmentListSection = document.getElementById('assignment-list-section');
const totalAssignmentsEl = document.getElementById('total-assignments');
const totalDueSoonEl = document.getElementById('total-due-soon');
const totalCompletedEl = document.getElementById('total-completed');

// --- Functions ---

/**
 * TODO: Implement the createAssignmentArticle function.
 * It takes one assignment object {id, title, dueDate, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * The "View Details" link's `href` MUST be set to `details.html?id=${id}`.
 * This is how the detail page will know which assignment to load.
 */
function createAssignmentArticle(assignment) {
  const article = document.createElement('article');
  article.className = 'bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col';

  // Preview area (date badge)
  const previewDiv = document.createElement('div');
  previewDiv.className = 'aspect-video bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative';
  const dateBadge = document.createElement('div');
  dateBadge.className = 'absolute top-3 right-3 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-semibold';
  dateBadge.textContent = assignment.dueDate ? `Due: ${assignment.dueDate}` : 'No due date';
  previewDiv.appendChild(dateBadge);

  // Icon
  const iconSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  iconSvg.setAttribute('class', 'h-20 w-20 text-muted-foreground/30');
  iconSvg.setAttribute('viewBox', '0 0 20 20');
  iconSvg.setAttribute('fill', 'currentColor');
  iconSvg.innerHTML = '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />';
  previewDiv.appendChild(iconSvg);

  // Content section
  const contentDiv = document.createElement('div');
  contentDiv.className = 'p-5 flex flex-col flex-1';

  // Header with title and badge
  const headerDiv = document.createElement('div');
  headerDiv.className = 'flex items-start justify-between mb-1';

  const title = document.createElement('h2');
  title.className = 'text-xl font-bold text-foreground group-hover:text-primary transition-colors flex-1';
  title.textContent = assignment.title;

  const badge = document.createElement('span');
  badge.className = 'badge badge-secondary';
  badge.textContent = 'Assignment';

  headerDiv.append(title, badge);

  // Description
  const description = document.createElement('p');
  description.className = 'text-sm text-muted-foreground mb-4 leading-relaxed';
  description.textContent = assignment.description || '';

  // Meta info (comments count and date)
  const metaDiv = document.createElement('div');
  metaDiv.className = 'flex items-center justify-between gap-4 text-xs text-muted-foreground mb-4 mt-auto pb-4 border-b border-border';

  const commentsSpan = document.createElement('span');
  commentsSpan.className = 'flex items-center gap-1.5';
  const clockSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  clockSvg.setAttribute('class', 'h-4 w-4');
  clockSvg.setAttribute('viewBox', '0 0 20 20');
  clockSvg.setAttribute('fill', 'currentColor');
  clockSvg.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />';

  // comments count placeholder (no comments API for assignments by default)
  const commentText = document.createTextNode('0 comments');
  commentsSpan.append(clockSvg, commentText);

  const dateSpan = document.createElement('span');
  dateSpan.className = 'flex items-center gap-1.5';
  dateSpan.textContent = assignment.dueDate || 'No date';

  metaDiv.append(commentsSpan, dateSpan);

  // Action buttons
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'flex items-center gap-2';

  // View details link
  const viewLink = document.createElement('a');
  viewLink.href = `/src/assignments/details.html?id=${assignment.id}`;
  viewLink.className = 'bg-secondary text-secondary-foreground hover:bg-secondary/90 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200';
  viewLink.textContent = 'View Details';

  // Share button
  const shareButton = document.createElement('button');
  shareButton.className = 'bg-secondary text-secondary-foreground hover:bg-secondary/90 p-2.5 border border-border rounded-lg transition-colors duration-200';
  shareButton.title = 'Share Assignment';
  const shareSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  shareSvg.setAttribute('class', 'h-4 w-4 text-secondary-foreground');
  shareSvg.setAttribute('viewBox', '0 0 20 20');
  shareSvg.setAttribute('fill', 'currentColor');
  shareSvg.innerHTML = '<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />';
  shareButton.append(shareSvg);
  shareButton.addEventListener('click', () => {
    const url = window.location.href.replace('list.html', 'details.html') + '?id=' + assignment.id;
    if (navigator.share) {
      navigator.share({ title: assignment.title, text: '', url }).catch(() => {});
    } else {
      navigator.clipboard?.writeText(url).then(() => alert('Link copied to clipboard!')).catch(() => alert(url));
    }
  });

  actionsDiv.append(viewLink, shareButton);

  // Assemble content
  contentDiv.append(headerDiv, description, metaDiv, actionsDiv);

  // Assemble article
  article.append(previewDiv, contentDiv);

  return article;
}


/**
 * TODO: Implement the loadAssignments function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'assignments.json'.
 * 2. Parse the JSON response into an array.
 * 3. Clear any existing content from `listSection`.
 * 4. Loop through the assignments array. For each assignment:
 * - Call `createAssignmentArticle()`.
 * - Append the returned <article> element to `listSection`.
 */
async function loadAssignments() {
  try {
    const res = await fetch('/src/assignments/api/assignments.json');
    const assignments = res.ok ? await res.json() : [];

    if (assignmentListSection) assignmentListSection.innerHTML = '';

    // Update simple stats if elements exist
    if (totalAssignmentsEl) totalAssignmentsEl.textContent = String(assignments.length);

    for (const assignment of assignments) {
      const article = createAssignmentArticle(assignment);
      if (assignmentListSection) assignmentListSection.append(article);
    }
  } catch (err) {
    console.error('Error loading assignments:', err);
  }
}


// --- Initial Page Load ---
// Call the function to populate the page.
loadAssignments();
