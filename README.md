[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/p4UBLUhf)
[![Open in Visual Studio Code](https://classroom.github.com/assets/open-in-vscode-2e0aaae1b6195c2367325f4f02e2d04e9abb55f0b24a779b69b11b9e10269abc.svg)](https://classroom.github.com/online_ide?assignment_repo_id=21055891&assignment_repo_type=AssignmentRepo)
# ITCS333 Course Project

## The names and student IDs of all team members.
| No. | Name                     | Student ID  |  Task No. |
|:----|:-------------------------|:------------|:----------|
| 1   | Ali Mohammed Abbas        | 202309001  | 1
| 2   | Taha Fadhel A. Jabbar     | 202308948  | 2
| 3   | Hassan mirza omran        | 202308274  | 3
| 4   | Zuhair Mohammed           | 202308683  | 4
| 5   | Mohammed Ebrahim Habib    | 202309564  | 5

## A link to your live, hosted application on Replit.
Replit Project: https://replit.com/@taljamri/ITCS333-Course-Project?v=1<br>
Live Application: https://cc9d91a7-0a87-4051-b1e7-03ed1b11711d-00-2wjn6ucwnsj0v.sisko.replit.dev/


## Development Environment Setup

### **Prerequisites**

Before you begin, ensure you have **Node.js** installed on your machine:
- 📥 [Download Node.js](https://nodejs.org/en/download) (.msi recommended)

---

### **Setup Steps**

#### **1. Clone & Install Dependencies**

```bash
# Install all required packages
npm i
```

#### **2. Start Vite for Hot-reaload**

**⚠️ IMPORTANT:** Always run this command in a separate terminal before starting development and do not close it:

```bash
npm run dev
```

This watches your files for any change adn reload the website for faster development **Keep this running in your terminal while developing.**

---

## 🎨 Styling Guidelines

### **Using Tailwind CSS**

This project uses [**Tailwind CSS**](https://tailwindcss.com/docs/styling-with-utility-classes) for all styling. **No custom CSS files should be created unless absolutely necessary.**

#### **Pre-defined Color Scheme**

For **consistency across the project**, use these predefined color classes:

| Color Variable | Usage Example | Purpose |
|:---------------|:--------------|:--------|
| `background` | `bg-background` | Page background |
| `foreground` | `text-foreground` | Main text color |
| `primary` | `bg-primary` | Primary buttons/actions (Admin) |
| `primary-foreground` | `text-primary-foreground` | Text on primary backgrounds |
| `secondary` | `bg-secondary` | Secondary buttons (Student) |
| `secondary-foreground` | `text-secondary-foreground` | Text on secondary backgrounds |
| `muted` | `bg-muted` | Subtle backgrounds |
| `muted-foreground` | `text-muted-foreground` | Less emphasized text |
| `border` | `border-border` | All borders |
| `destructive` | `bg-destructive` | Delete/error actions |

**Example:**
```html
<!-- Primary button (Admin action) -->
<button class="bg-primary text-primary-foreground px-4 py-2 rounded-lg">
  Add Student
</button>

<!-- Secondary button (Student action) -->
<button class="bg-secondary text-secondary-foreground px-4 py-2 rounded-lg">
  View Resources
</button>
```

---

### **🌓 Dark Mode Support**

**Light/Dark mode is already configured!** 

- The color scheme automatically adapts based on user preference
- **No additional coding required** for dark mode support

---

### **📝 Custom Styles (If Needed)**

**Prefer Tailwind classes over custom CSS.** If you absolutely need custom styles:

1. ✅ **Add global styles** to: `/src/common/styles.css`
2. ✅ **Create component-specific CSS** only if Tailwind can't achieve the design

---

### **🔗 Linking Stylesheets**

**⚠️ CRITICAL:** All html pages must be linked `/src/common/styles.css`, to be able t ouse TailwindCSS:

```html
<link rel="stylesheet" href="src/common/styles.css">
```
---

## CI/CD
To ensure smooth development across the team, please create a git branch named `Task/<task-number>-<briefDescription>`.
```bash
# Create a branch
git switch -c Task/<task-number>-<briefDescription>

# Add all changed files
git add .

# Add all changed files
git commit -m "<message describing changes>"

# Add all changed files
git push
```

## 📚 Learning Resources

### **Tailwind CSS Examples**

- 📄 See [**`example.html`**](./examples/example.html) for practical Tailwind usage examples
- 📖 [Official Tailwind Documentation](https://tailwindcss.com/docs)
- 🎨 [Tailwind Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)

## 🛠️ Project Structure

```
course-project-itcs333-sec04-group25/
├── index.html                       # Homepage
├── vite.config.js                   # Vite configs (Don't touch)
├── src/
│   ├── admin/                       # Task 1: Admin Portal
│   │   ├── api/
│   │   │   ├── index.php
│   │   │   └── students.json
│   │   ├── manage_users.html
│   │   └── manage_users.js
│
│   ├── resources/                   # Task 2: Course Resources
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── list.html
│   │   ├── list.js
│   │   ├── details.html
│   │   ├── details.js
│   │   └── api/
│   │       ├── comments.json
│   │       ├── index.php
│   │       └── resources.json
│
│   ├── weekly/                      # Task 3: Weekly Breakdown
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── list.html
│   │   ├── list.js
│   │   ├── details.html
│   │   ├── details.js
│   │   └── api/
│   │       ├── comments.json
│   │       ├── index.php
│   │       └── weeks.json
│
│   ├── assignments/                 # Task 4: Assignments
│   │   ├── admin.html
│   │   ├── admin.js
│   │   ├── list.html
│   │   ├── list.js
│   │   ├── details.html
│   │   ├── details.js
│   │   └── api/
│   │       ├── assignments.json
│   │       ├── comments.json
│   │       └── index.php
│
│   ├── discussion/                  # Task 5: Discussion Boards
│   │   ├── baord.html               # kept EXACTLY as your original (typo preserved)
│   │   ├── board.js
│   │   ├── topic.html
│   │   └── topic.js
│
│   ├── auth/                        # Authentication
│   │   ├── login.html
│   │   ├── login.js
│   │   └── students.json
│
│   └── common/                      # Shared Resources
│       ├── DBConfig.php
│       ├── DatabaseHelper.php
│       ├── EnvLoader.php
│       ├── helpers.js
│       ├── middlewares.php
│       └── styles.css               # Global Styles + Tailwind Styles
│
├── assets/
│   ├── README.md
│   └── login.jpg
├── examples/                        # Examples of Tailwind CSS
│   ├── admin-resources-sample.html
│   └── example.html
├── DbSchema.sql                     # Database schema
├── .env
├── .gitignore
├── LICENSE
├── README.md
├── dist/                            # Production build generated using npm run build though Vite
├── node_modules/                    # Installed Packages
├── package.json
└── package-lock.json
```
