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
import { checkLogin, API_HOST } from "/src/common/helpers.js";
let allResources = [];
let shownResources = [];
const comments = [];
let isSearching = false;
let currentFilter = 'all';
let currentSort = 'newest';
const resourceListSection = document.getElementById("resource-list-section");
const totalResourcesEl = document.getElementById("total-resources");
const totalDocumentsEl = document.getElementById("total-documents");
const totalLinksEl = document.getElementById("total-links");
const totalVideosEl = document.getElementById("total-videos");
const filterSelect = document.getElementById("filter-type");
const sortSelect = document.getElementById("sort-by");
// --- Functions ---

/**
 * TODO: Implement the createResourceArticle function.
 * It takes one resource object {id, title, description}.
 * It should return an <article> element matching the structure in `list.html`.
 * The "View Resource & Discussion" link's `href` MUST be set to `details.html?id=${id}`.
 * (This is how the detail page will know which resource to load).
 */

document.getElementById('search-input').addEventListener("input", e => handleSearch(e));
filterSelect?.addEventListener("change", e => handleFilterChange(e));
sortSelect?.addEventListener("change", e => handleSortChange(e));

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

function getFileExtension(url) {
  try {
    // Remove query params & hashes
    const cleanUrl = url.split(/[?#]/)[0];

    const parts = cleanUrl.split('.');
    if (parts.length <= 1) return ''; // no extension

    return parts.pop().toLowerCase();
  } catch {
    return '';
  }
}

function mapFileType(url) {
  const ext = getFileExtension(url);


  // Documents
  const docExts = ['doc', 'docx', 'txt', 'rtf', 'odt', 'pages', 'pdf'];
  if (docExts.includes(ext)) return 'doc';

  // Media (video & audio)
  const mediaExts = [
    'mp4', 'mov', 'avi', 'mkv', 'webm',
    'mp3', 'wav', 'aac', 'flac'
  ];
  if (mediaExts.includes(ext)) return 'media';

  // Everything else is considered a link
  return 'link';
}


/**
 * Apply current filters and sorting to resources
 */
function applyFiltersAndSort() {
  let filtered = [...allResources];

  // Apply type filter
  if (currentFilter !== 'all') {
    filtered = filtered.filter(r => {
      const type = (r.type || '').toLowerCase();

      if (currentFilter === 'docs') {
        return type === 'pdf' || type === 'doc' || type === 'document';
      } else if (currentFilter === 'links') {
        return type === 'link' || type === 'url' || type === 'web';
      } else if (currentFilter === 'videos') {
        return type === 'video' || type === 'media';
      }
      return true;
    });
  }

  // Apply sorting
  if (currentSort === 'newest') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateB - dateA; // Newest first
    });
  } else if (currentSort === 'oldest') {
    filtered.sort((a, b) => {
      const dateA = new Date(a.created_at || 0);
      const dateB = new Date(b.created_at || 0);
      return dateA - dateB; // Oldest first
    });
  }

  return filtered;
}

/**
 * Handle filter type change
 */
function handleFilterChange(e) {
  currentFilter = e.target.value.toLowerCase();
  renderResources();
}

/**
 * Handle sort order change
 */
function handleSortChange(e) {
  currentSort = e.target.value.toLowerCase();
  renderResources();
}

/**
 * Handle search input
 */
async function handleSearch(e) {
  await renderResources(e.target.value);
}

/**
 * Render resources based on current search, filter, and sort
 */
async function renderResources(searchTerm = '') {
  if (isSearching) return;

  try {
    isSearching = true;

    // Start with filtered and sorted resources
    let filtered = applyFiltersAndSort();

    // Apply search term if provided
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(r => {
        const title = (r.title || '').toLowerCase();
        const description = (r.description || '').toLowerCase();
        return title.includes(search) || description.includes(search);
      });
    }

    shownResources = filtered;
    updateStatistics(shownResources);

    // Clear and render
    resourceListSection.innerHTML = "";

    if (shownResources.length === 0) {
      const emptyMessage = document.createElement("div");
      emptyMessage.className =
        "col-span-full flex flex-col items-center justify-center py-16 text-center text-muted-foreground";

      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("class", "h-16 w-16 mx-auto mb-4 opacity-50");
      svg.setAttribute("viewBox", "0 0 20 20");
      svg.setAttribute("fill", "currentColor");

      const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
      path.setAttribute("fill-rule", "evenodd");
      path.setAttribute("d", "M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z");
      path.setAttribute("clip-rule", "evenodd");

      svg.appendChild(path);

      const heading = document.createElement("p");
      heading.className = "text-lg font-semibold mb-2";
      heading.textContent = "No resources found";

      const subtext = document.createElement("p");
      subtext.className = "text-sm";
      subtext.textContent = "Try adjusting your search or filters";

      emptyMessage.appendChild(svg);
      emptyMessage.appendChild(heading);
      emptyMessage.appendChild(subtext);

      resourceListSection.append(emptyMessage);
    } else {
      for (const resource of shownResources) {
        const article = await createResourceArticle(resource);
        resourceListSection.append(article);
      }
    }
  }
  catch (err) {
    console.error("Error rendering resources: ", err);
  }
  finally {
    isSearching = false;
  }
}


/**
 * Format a date string to relative time (e.g., "3 days ago", "1 week ago")
 */
function formatRelativeTime(dateString) {
  if (!dateString) return "Recently added";

  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffSeconds < 60) {
    return "Just now";
  } else if (diffMinutes < 60) {
    return diffMinutes === 1 ? "1 minute ago" : `${diffMinutes} minutes ago`;
  } else if (diffHours < 24) {
    return diffHours === 1 ? "1 hour ago" : `${diffHours} hours ago`;
  } else if (diffDays < 7) {
    return diffDays === 1 ? "1 day ago" : `${diffDays} days ago`;
  } else if (diffWeeks < 4) {
    return diffWeeks === 1 ? "1 week ago" : `${diffWeeks} weeks ago`;
  } else if (diffMonths < 12) {
    return diffMonths === 1 ? "1 month ago" : `${diffMonths} months ago`;
  } else {
    return diffYears === 1 ? "1 year ago" : `${diffYears} years ago`;
  }
}

async function countComments(resourceId) {
  if (comments[resourceId]) {
    return comments[resourceId]?.length || 0;
  }
  try {
    const req = await fetch(`${API_HOST}/resources/api/index.php?resource_id=${resourceId}&action=comments`, {
      credentials: "include"
    });
    const res = await req.json();
    if (!req.ok || !res.success) { throw res; }
    comments[resourceId] = res.data;
    return comments[resourceId]?.length || 0;
  } catch (err) {
    console.error("Error loading comments:", err);;
    return 0;
  }
}

async function createResourceArticle(resource) {
  // Article container
  const article = document.createElement("article");
  article.className = "bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col";

  // Preview section
  const previewDiv = document.createElement("div");
  const resourceType = (resource.type || '').toLowerCase();

  // Set preview style based on resource type
  if (resourceType === 'link') {
    previewDiv.className = "aspect-video bg-linear-to-br from-info/20 to-info/5 flex items-center justify-center relative";
  } else if (resourceType === 'media') {
    previewDiv.className = "aspect-video bg-linear-to-br from-warning/20 to-warning/5 flex items-center justify-center relative";
  } else {
    // Default for doc/pdf
    previewDiv.className = "aspect-video bg-linear-to-br from-primary/20 to-primary/5 flex items-center justify-center relative";
  }

  // Add duration badge for media
  if (resourceType === 'media') {
    const durationBadge = document.createElement("div");
    durationBadge.className = "absolute top-3 right-3 px-2 py-1 bg-background/90 text-foreground text-xs font-semibold rounded";
    durationBadge.textContent = "";
    previewDiv.appendChild(durationBadge);
  }

  const previewSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  previewSvg.setAttribute("class", "h-20 w-20 text-muted-foreground/30");
  previewSvg.setAttribute("viewBox", "0 0 20 20");
  previewSvg.setAttribute("fill", "currentColor");

  const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

  // Set SVG icon based on resource type
  if (resourceType === 'link') {
    svgPath.setAttribute("fill-rule", "evenodd");
    svgPath.setAttribute("d", "M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z");
    svgPath.setAttribute("clip-rule", "evenodd");
  } else if (resourceType === 'media') {
    svgPath.setAttribute("d", "M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z");
  } else {
    // Default for doc/pdf
    svgPath.setAttribute("fill-rule", "evenodd");
    svgPath.setAttribute("d", "M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z");
    svgPath.setAttribute("clip-rule", "evenodd");
  }

  previewSvg.appendChild(svgPath);
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

  // Set badge style based on resource type
  if (resourceType === 'link') {
    badge.className = "badge badge-info";
    badge.textContent = "Link";
  } else if (resourceType === 'media') {
    badge.className = "badge badge-warning";
    badge.textContent = "Video";
  } else {
    badge.className = "badge badge-secondary";
    badge.textContent = "PDF";
  }

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
  dateSpan.textContent = formatRelativeTime(resource.created_at);

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

  shareButton.append(shareSvg);
  shareButton.dataset.dataResourceId = resource.id;
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
    const req = await fetch(`${API_HOST}/resources/api/index.php`, {
      credentials: "include"
    });
    const res = await req.json();

    if (!req.ok || !res.success) {
      throw res;
    }

    allResources = res?.data;
    for (let i = 0; i < allResources?.length; i++) {
      allResources[i].type = mapFileType(allResources[i].link);
    }

    // Initial render with default filters and sort
    await renderResources();
  }
  catch (err) {
    console.error("Error in initializing: ", err);
    showAlert("Error occurred while loading resources.", "Loading Error");
    if (err.success !== undefined) {
      return err;
    }
    return { success: false, message: err.message };
  }
}

// --- Initial Page Load ---
// Call the function to populate the page.
checkLogin().then(ok => {
  if (ok) loadResources();
})
