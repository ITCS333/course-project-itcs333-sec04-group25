/*
  Requirement: Populate the resource detail page and discussion forum.

  Instructions:
  1. Link this file to `details.html` using:
     <script src="details.js" defer></script>

  2. In `details.html`, add the following IDs:
     - To the <h1>: `id="resource-title"`
     - To the description <p>: `id="resource-description"`
     - To the "Access Resource Material" <a> tag: `id="resource-link"`
     - To the <div> for comments: `id="comment-list"`
     - To the "Leave a Comment" <form>: `id="comment-form"`
     - To the <textarea>: `id="new-comment"`

  3. Implement the TODOs below.
*/

// --- Global Data Store ---
// These will hold the data related to *this* resource.
import { checkLogin } from "/src/common/helpers.js";
let currentResourceId = null;
let currentComments = [];

// Comment Modal functionality for mobile
const commentModal = document.getElementById('comment-modal');
const commentModalContent = document.getElementById('comment-modal-content');
const commentModalOverlay = document.getElementById('comment-modal-overlay');
const showCommentBtnMobile = document.getElementById('show-comment-btn-mobile');
const closeCommentModalBtn = document.getElementById('close-comment-modal-btn');
const cancelCommentBtn = document.getElementById('cancel-comment-btn');
const commentForm = document.getElementById('comment-form');
const commentFormMobileWrapper = document.getElementById('comment-form-mobile-wrapper');
const commentsCount = document.getElementById('comments-count');
const postData = document.getElementById('post-date');
// Move form to mobile modal on mobile, keep on desktop otherwise
function handleFormPlacement() {
  if (window.innerWidth < 768) { // md breakpoint
    // Move form to mobile wrapper
    if (commentFormMobileWrapper && commentForm && commentForm.parentElement !== commentFormMobileWrapper) {
      commentFormMobileWrapper.appendChild(commentForm);
      commentForm.classList.remove('hidden');
    }
  } else {
    // Move form back to its original desktop position
    if (commentForm && commentForm.parentElement !== document.getElementById('discussion-forum')) {
      document.getElementById('discussion-forum').appendChild(commentForm);
      commentForm.classList.remove('hidden');
    }
  }
}

// Initialize form placement
handleFormPlacement();
// Re-position on resize
window.addEventListener('resize', handleFormPlacement);

function openCommentModal() {
  handleFormPlacement(); // Ensure form is in correct position
  commentModal.classList.remove('hidden');
  commentModalOverlay.classList.remove('hidden');
  // Trigger animation
  setTimeout(() => {
    commentModalContent.classList.remove('translate-y-full', 'opacity-0');
    commentModalContent.classList.add('translate-y-0', 'opacity-100');
    commentModalOverlay.classList.add('opacity-100');
  }, 10);
}

function closeCommentModal() {
  commentModalContent.classList.remove('translate-y-0', 'opacity-100');
  commentModalContent.classList.add('translate-y-full', 'opacity-0');
  commentModalOverlay.classList.remove('opacity-100');
  setTimeout(() => {
    commentModal.classList.add('hidden');
    commentModalOverlay.classList.add('hidden');
  }, 300);
}

showCommentBtnMobile.addEventListener('click', openCommentModal);
closeCommentModalBtn.addEventListener('click', closeCommentModal);
cancelCommentBtn.addEventListener('click', closeCommentModal);
commentModalOverlay.addEventListener('click', closeCommentModal);

// Prevent modal close when clicking inside modal content
commentModalContent.addEventListener('click', (e) => {
  e.stopPropagation();
});

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !commentModal.classList.contains('hidden')) {
    closeCommentModal();
  }
});

// Handle form submission (single form for both mobile and desktop)
commentForm?.addEventListener('submit', (e) => {
  e.preventDefault();
  // Add your form submission logic here

  // Close modal if on mobile
  if (window.innerWidth < 768) {
    closeCommentModal();
  }
});


// --- Element Selections ---
// TODO: Select all the elements you added IDs for in step 2.
const resourceTitle = document.getElementById("resource-title");
const resourceDescription = document.getElementById("resource-description");
const resourceLink = document.getElementById("resource-link");
const newComment = document.getElementById("new-comment");
const commentList = document.getElementById("comment-list");
const discussionForm = document.getElementById("discussion-forum")
const resourceStats = document.getElementById('resource-stats');
// --- Functions ---

/**
 * TODO: Implement the getResourceIdFromURL function.
 * It should:
 * 1. Get the query string from `window.location.search`.
 * 2. Use the `URLSearchParams` object to get the value of the 'id' parameter.
 * 3. Return the id.
 */
function getResourceIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('id');
}

/**
 * TODO: Implement the renderResourceDetails function.
 * It takes one resource object.
 * It should:
 * 1. Set the `textContent` of `resourceTitle` to the resource's title.
 * 2. Set the `textContent` of `resourceDescription` to the resource's description.
 * 3. Set the `href` attribute of `resourceLink` to the resource's link.
 */
function renderResourceDetails(resource) {
  resourceTitle.textContent = resource.title;
  resourceDescription.textContent = resource.description;
  resourceLink.setAttribute("href", resource.link);
}

/**
 * TODO: Implement the createCommentArticle function.
 * It takes one comment object {author, text}.
 * It should return an <article> element matching the structure in `details.html`.
 * (e.g., an <article> containing a <p> and a <footer>).
 */
function createCommentArticle(comment) {
  const article = document.createElement("article"); article.className = "bg-card border border-border/50 rounded-xl p-6 hover:border-info/30 hover:shadow-md transition-all duration-200";
  const articleDiv1 = document.createElement("div"); articleDiv1.className = "flex items-start gap-4";
  const articleDiv2 = document.createElement("div"); articleDiv2.className = "mt-1 p-3 bg-info/10 rounded-full";
  articleDiv2.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-info" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" /></svg>`
  const articleDiv3 = document.createElement("div"); articleDiv3.className = "flex-1 min-w-0";
  const p = document.createElement("p"); p.className = "ml-0 text-foreground leading-relaxed mb-3";
  p.textContent = comment.text;
  const footer = document.createElement("footer"); footer.className = "ml-0 flex items-center gap-4 text-sm justify-between";
  const authorSpan = document.createElement("span"); authorSpan.textContent = comment.author; authorSpan.classList = "font-semibold text-accent"
  const dateSpan = document.createElement("span"); dateSpan.textContent = comment.date || " "; dateSpan.classList = "text-muted-foreground text-xs"
  footer.append(authorSpan, dateSpan);
  articleDiv3.append(p, footer);
  articleDiv1.append(articleDiv2, articleDiv3);
  article.append(articleDiv1);
  return article;
  // <div class="flex items-start gap-4">
  //   <div class="mt-1 p-3 bg-info/10 rounded-full">
  //     <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-info" viewBox="0 0 20 20"
  //       fill="currentColor">
  //       <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
  //         clip-rule="evenodd" />
  //     </svg>
  //   </div>
  //   <div class="flex-1 min-w-0">
  //     <p class="ml-0  text-foreground leading-relaxed mb-3">
  //       This was very helpful, thanks! The examples really clarified the concepts for me.
  //       Looking forward to more resources like this.
  //     </p>
  //     <footer class="ml-0  flex items-center gap-4 text-sm justify-between">
  //       <span class="font-semibold text-accent">Jane Doe</span>
  //       <span class="text-muted-foreground text-xs">2 days ago</span>
  //     </footer>
  //   </div>
  // </div>
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
  commentList.innerHTML = '';
  currentComments.forEach(comment => {
    commentList.append(createCommentArticle(comment));
  })
}

/**
 * TODO: Implement the handleAddComment function.
 * This is the event handler for the `commentForm` 'submit' event.
 * It should:
 * 1. Prevent the form's default submission.
 * 2. Get the text from `newComment.value`.
 * 3. If the text is empty, return.
 * 4. Create a new comment object: { author: 'Student', text: commentText }
 * (For this exercise, 'Student' is a fine hardcoded author).
 * 5. Add the new comment to the global `currentComments` array (in-memory only).
 * 6. Call `renderComments()` to refresh the list.
 * 7. Clear the `newComment` textarea.
 */
async function handleAddComment(event) {
  event.preventDefault();
  const commentText = newComment.value.trim();
  if (commentText) {
    const comment = { author: localStorage.getItem("user_name") || 'Student', text: commentText }
    const result = await APIAddComment(comment.author, comment.text);;
    if (result.success) {
      currentComments.push(comment);
      renderComments();
      newComment.value = "";
    } else {
      alert("Error: " + (result?.message || ""));
    }
  }
}

async function APIAddComment(author, text) {
  try {
    const req = await fetch(`api/index.php?action=comment`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ resource_id: currentResourceId, author, text })
    });
    const res = await req.json();
    return res; // Return the full response object
  } catch (e) {
    console.error("API Error:", e);
    return { success: false, message: " error: " + e.message };
  }
}

/**
 * TODO: Implement an `initializePage` function.
 * This function needs to be 'async'.
 * It should:
 * 1. Get the `currentResourceId` by calling `getResourceIdFromURL()`.
 * 2. If no ID is found, set `resourceTitle.textContent = "Resource not found."` and stop.
 * 3. `fetch` both 'resources.json' and 'resource-comments.json' (you can use `Promise.all`).
 * 4. Parse both JSON responses.
 * 5. Find the correct resource from the resources array using the `currentResourceId`.
 * 6. Get the correct comments array from the comments object using the `currentResourceId`.
 * Store this in the global `currentComments` variable. (If no comments exist, use an empty array).
 * 7. If the resource is found:
 * - Call `renderResourceDetails()` with the resource object.
 * - Call `renderComments()` to show the initial comments.
 * - Add the 'submit' event listener to `commentForm` (calls `handleAddComment`).
 * 8. If the resource is not found, display an error in `resourceTitle`.
 */
const availability = document.getElementById("availability");
const resourceInfoContainer = document.getElementById("resource-info-container");
const shareResourceBtn = document.getElementById("share-resource-btn");

// Share button functionality
if (shareResourceBtn) {
  shareResourceBtn.addEventListener("click", async () => {
    const shareUrl = window.location.href;
    const resourceTitleText = resourceTitle?.textContent || "Resource";

    if (navigator.share) {
      try {
        await navigator.share({
          title: resourceTitleText,
          text: `Check out this resource: ${resourceTitleText}`,
          url: shareUrl,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      } catch (err) {
        alert("Unable to share. URL: " + shareUrl);
      }
    }
  });
}

async function initializePage() {
  currentResourceId = Number(getResourceIdFromURL());

  if (!currentResourceId) { resourceTitle.textContent = "Resource not found."; return; }
  const [r, c] = await Promise.all([ 
    fetch(`api/index.php?id=${currentResourceId}`, { credentials: "include" }),
    fetch(`api/index.php?resource_id=${currentResourceId}&action=comments`, { credentials: "include" })
  ])
  const currentResource = (await r.json()).data;
  currentComments = (await c.json()).data || [];
  if (currentResource) {
    renderResourceDetails(currentResource);
    renderComments();
    commentForm.addEventListener("submit", e => handleAddComment(e)); // OR u could do commentForm.addEventListener("submit", handleAddComment)
    commentsCount.textContent = currentComments.length + " Comments";
    postData.textContent = currentResource.created_at.toLocaleString("en-US", {
      year: "numeric",
      month: "short",   // Jan, Feb, Mar...
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });;
  } else {
    resourceTitle.textContent = "Error! No Resource is found";
    discussionForm.innerHTML = '';
    resourceStats.innerHTML = '';
    availability.innerHTML = 'Not Available'; availability.classList.replace("border-success/20", "border-destructive/20"); availability.classList.replace("bg-success/10", "bg-destructive/10"); availability.classList.replace("text-success", "text-destructive")
    resourceInfoContainer.innerHTML = '';
  }
}

// --- Initial Page Load ---
checkLogin().then(ok => {
  if (ok) initializePage();
})
