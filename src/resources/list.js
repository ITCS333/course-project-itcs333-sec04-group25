/*
  Requirement: Populate the "Course Resources" list page.

  Instructions:
  1. Link this file to `list.html` using:
     <script src="list.js" defer></script>

  2. In `list.html`, add an `id="resource-list-section"` to the
     <section> element that will contain the resource articles.

  3. Implement the TODOs below.
*/

// --- Element Selections ---
// TODO: Select the section for the resource list ('#resource-list-section').
const API_HOST = import.meta.env.VITE_API_URL || 'http://localhost:8000';
let allResources = [];
let shownResources = [];
const resourceListSection = document.getElementById("resource-list-section");
const totalResourcesEl = document.getElementById("total-resources");
const totalDocumentsEl = document.getElementById("total-documents");
const totalLinksEl = document.getElementById("total-links");
const totalVideosEl = document.getElementById("total-videos");
// --- Functions ---

/**
 * TODO: Implement the createResourceArticle function.
 * It takes one resource object {id, title, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * The "View Resource & Discussion" link's `href` MUST be set to `details.html?id=${id}`.
 * (This is how the detail page will know which resource to load).
 */

document.getElementById('search-input').addEventListener("input", e => handleSearch(e));

/**
 * Update statistics cards based on resource types
 */
function updateStatistics(resources) {
  if (!resources || resources.length === 0) {
    totalResourcesEl.textContent = '0';
    totalDocumentsEl.textContent = '0';
    totalLinksEl.textContent = '0';
    totalVideosEl.textContent = '0';
    return;
  }

  const total = resources.length;

  // Count by type (case-insensitive)
  const counts = resources.reduce((acc, resource) => {
    const type = resource.type?.toLowerCase() || 'unknown';

    if (type === 'pdf' || type === 'document' || type === 'doc') {
      acc.documents++;
    } else if (type === 'link' || type === 'url' || type === 'web') {
      acc.links++;
    } else if (type === 'video' || type === 'media') {
      acc.videos++;
    }

    return acc;
  }, { documents: 0, links: 0, videos: 0 });

  // Update the DOM
  totalResourcesEl.textContent = total;
  totalDocumentsEl.textContent = counts.documents;
  totalLinksEl.textContent = counts.links;
  totalVideosEl.textContent = counts.videos;
}

async function handleSearch(e) {
  shownResources = allResources.filter(r => r.title.toLowerCase().includes(e.target.value.toLowerCase()) || r.description.toLowerCase().includes(e.target.value.toLowerCase()) || r.link.toLowerCase().includes(e.target.value.toLowerCase()));
  shownResources.sort((a, b) => a.title[0] - b.title[0])

  try {
    resourceListSection.innerHTML = "";
    for (const resource of shownResources) {
      const article = await createResourceArticle(resource);
      resourceListSection.append(article);
    }
  }
  catch (err) {
    console.error("Error in initializing: ", err);
  }

}


async function countComments(resourceId) {
  try {
    const res = await fetch(`${API_HOST}/resources/api/index.php?resource_id=${resourceId}&action=comments`);
    const comments = await res.json();
    return comments[resourceId]?.length || 0;
  } catch (err) {
    console.error("Error loading comments:", err);
    return 0;
  }
}

async function createResourceArticle(resource) {
  // Article container
  const article = document.createElement("article");
  article.className = "bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col";

  // Preview section
  const previewDiv = document.createElement("div");
  previewDiv.className = "aspect-video bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative";

  const previewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  previewSvg.setAttribute("class", "h-20 w-20 text-muted-foreground/30");
  previewSvg.setAttribute("viewBox", "0 0 20 20");
  previewSvg.setAttribute("fill", "currentColor");
  previewSvg.innerHTML = '<path fill-rule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clip-rule="evenodd" />';

  previewDiv.append(previewSvg);

  // Content section
  const contentDiv = document.createElement("div");
  contentDiv.className = "p-5 flex flex-col flex-1";

  // Header with title and badge
  const headerDiv = document.createElement("div");
  headerDiv.className = "flex items-start justify-between mb-1";

  const title = document.createElement("h2");
  title.className = "text-xl font-bold text-foreground group-hover:text-primary transition-colors flex-1";
  title.textContent = resource.title;

  const badge = document.createElement("span");
  badge.className = "badge badge-secondary";
  badge.textContent = resource.type || "PDF";

  headerDiv.append(title, badge);

  // Description
  const description = document.createElement("p");
  description.className = "text-sm text-muted-foreground mb-4 leading-relaxed";
  description.textContent = resource.description;

  // Meta info (comments count and date)
  const metaDiv = document.createElement("div");
  metaDiv.className = "flex items-center justify-between gap-4 text-xs text-muted-foreground mb-4 mt-auto pb-4 border-b border-border";

  const commentsSpan = document.createElement("span");
  commentsSpan.className = "flex items-center gap-1.5";

  const clockSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  clockSvg.setAttribute("class", "h-4 w-4");
  clockSvg.setAttribute("viewBox", "0 0 20 20");
  clockSvg.setAttribute("fill", "currentColor");
  clockSvg.innerHTML = '<path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />';

  const commentCount = await countComments(Number(resource.id));
  const commentText = document.createTextNode(`${commentCount} comments`);

  commentsSpan.append(clockSvg, commentText);

  const dateSpan = document.createElement("span");
  dateSpan.className = "flex items-center gap-1.5";
  dateSpan.textContent = resource.date || "Recently added";

  metaDiv.append(commentsSpan, dateSpan);

  // Action buttons
  const actionsDiv = document.createElement("div");
  actionsDiv.className = "flex items-center gap-2";

  // View resource link
  const viewLink = document.createElement("a");
  viewLink.href = `/src/resources/details.html?id=${resource.id}`;
  viewLink.className = "bg-secondary text-secondary-foreground hover:bg-secondary/90 flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-colors duration-200";
  viewLink.textContent = "View Resource & comments";

  // Share button
  const shareButton = document.createElement("button");
  shareButton.className = "bg-secondary text-secondary-foreground hover:bg-secondary/90 p-2.5 border border-border rounded-lg transition-colors duration-200";
  shareButton.title = "Share Resource";

  const shareSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  shareSvg.setAttribute("class", "h-4 w-4 text-secondary-foreground");
  shareSvg.setAttribute("viewBox", "0 0 20 20");
  shareSvg.setAttribute("fill", "currentColor");
  shareSvg.innerHTML = '<path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />';

  shareButton.append(shareSvg); shareButton.dataset.dataResourceId = resource.id
  console.log();
  shareButton.addEventListener("click", async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check this out!",
          text: "",
          url: window.location.href.replace("list.html", "details.html") + "?id=" + resource.id,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      alert("Web Share API not supported on this device.");
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
 * TODO: Implement the loadResources function.
 * This function needs to be 'async'.
 * It should:
 * 1. Use `fetch()` to get data from 'resources.json'.
 * 2. Parse the JSON response into an array.
 * 3. Clear any existing content from `listSection`.
 * 4. Loop through the resources array. For each resource:
 * - Call `createResourceArticle()`.
 * - Append the returned <article> element to `listSection`.
 */

async function loadResources() {

  try {
    const res = await fetch(`${API_HOST}/resources/api/index.php`);
    allResources = await res.json();
    shownResources = allResources?.data?.map(resource => resource);
    updateStatistics(shownResources);

    resourceListSection.innerHTML = "";

    for (const resource of shownResources) {
      const article = await createResourceArticle(resource);
      resourceListSection.append(article);
    }
  }
  catch (err) {
    console.error("Error in initializing: ", err);
  }
}



// --- Initial Page Load ---
// Call the function to populate the page.
loadResources();
