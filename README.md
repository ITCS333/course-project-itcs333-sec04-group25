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
`To be filled`


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

#### **2. Start the Tailwind CSS Compiler**

**⚠️ IMPORTANT:** Always run this command in a separate terminal before starting development and do not close it:

```bash
npm run css
```

This watches your HTML files and compiles Tailwind CSS automatically. **Keep this running in your terminal while developing.**

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

1. ✅ **Add global styles** to: `src/common/styles.css`
2. ✅ **Create component-specific CSS** only if Tailwind can't achieve the design
3. ❌ **Do NOT edit** `src/common/output.css` directly

---

### **🔗 Linking Stylesheets**

**⚠️ CRITICAL:** Link to the **compiled output file**, not the source file:

```html
<!-- ✅ CORRECT -->
<link rel="stylesheet" href="../common/output.css">

<!-- ❌ WRONG - Do NOT use this -->
<link rel="stylesheet" href="../common/styles.css">
```

**Why?** `output.css` contains the compiled Tailwind CSS. `styles.css` is just the source file.

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
├── src/
│   ├── admin/                       # Task 1: Admin Portal
│   │   └── manage_users.html
│   ├── resources/                   # Task 2: Course Resources
│   │   ├── admin.html
│   │   ├── list.html
│   │   └── details.html
│   ├── weekly/                      # Task 3: Weekly Breakdown
│   │   ├── admin.html
│   │   ├── list.html
│   │   └── details.html
│   ├── assignments/                 # Task 4: Assignments
│   │   ├── admin.html
│   │   ├── list.html
│   │   └── details.html
│   ├── discussion/                  # Task 5: Discussion Boards
│   │   ├── board.html
│   │   └── topic.html   
│   ├── auth/                        # Authentication
│   │   └── login.html
│   └── common/                      # Shared Resources
│       ├── styles.css               # Source styles (edit this if needed)
│       └── output.css               # Compiled styles (don't edit)
├── assets/                          # Images, fonts, etc.
├── examples/
|   ├── admin-resources-sample.html  # Example of tailwind classes
|   ├── example.html                 # Example of tailwind classes
├── package.json                     # Node dependencies
```
