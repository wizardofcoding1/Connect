<div align="center">

  <img src="public/connect.png" alt="Connect Logo" width="120" height="120" />

  # ⚡ CONNECT

  **Your Centralized All-in-One Cloud Workspace for Notes, Canvas Whiteboards, Folders, Link Vaults & Assets**

  [![Live Demo](https://img.shields.io/badge/🚀_Live_Demo-crosser.vercel.app-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://crosser.vercel.app)
  [![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](LICENSE)

  [🌐 Live Demo](https://crosser.vercel.app) • [Features](#-key-features) • [Screenshots](#-application-preview--screenshots) • [Developer & Socials](#-developer--social-links) • [Environment Setup](#-environment-variables--security) • [Getting Started](#-getting-started)

</div>

---

## 📖 Overview

**Connect** is a modern, high-performance web application designed to streamline personal productivity and asset management. Powered by **React 19**, **Vite**, and **Supabase**, Connect integrates a real-time Notepad, an interactive Whiteboard Canvas, a Folder Management System, a curated Link Vault, and Cloud Storage into a seamless, elegant interface with dark mode and glassmorphism styling.

> 🌐 **Live Web Application**: [https://crosser.vercel.app](https://crosser.vercel.app)

---

## 📸 Application Preview & Screenshots

<div align="center">

  ### Birth Of Connect 
  <img width="1160" height="872" alt="Screenshot 2026-07-23 015207" src="https://github.com/user-attachments/assets/d5f12571-0573-4bf1-9eaa-ab72e1441f30" />

  <br/><br/>

--------------------------------------------------------

  ### 🏠 Main Workspace & Top-Stacked Folders
  <img width="1877" height="902" alt="Screenshot 2026-07-23 014827" src="https://github.com/user-attachments/assets/5dc915a0-163f-4bbd-befc-05497afd7ce2" />

<br/> <br/>

----------------------------------------------------------

  ### 🏠 Folders
  <img width="1865" height="866" alt="Screenshot 2026-07-23 015127" src="https://github.com/user-attachments/assets/aa1c06d4-cf16-4f7f-85f9-da5cbd4b73a5" />

  <br/><br/>

  -------------------------------------------------------------------------------

  ### 📝 Real-Time Notepad & Mobile Text Color Palette
  <img width="1877" height="869" alt="Screenshot 2026-07-23 014909" src="https://github.com/user-attachments/assets/b6c80daf-2601-43ce-a970-656352245e27" />

-----------------------------------------------------

  <br/><br/>

  ### 🔗 Curated Link Vault
   <img width="1870" height="876" alt="Screenshot 2026-07-23 015019" src="https://github.com/user-attachments/assets/d120a57a-1f47-4801-a4b0-5363c413d0ce" />


</div>

---

## ✨ Key Features

### 📁 1. Organized Top-Stacked Folder System & Sub-Folders
- **Folders Section (`📁 FOLDERS (N)`)**: Folders and sub-folders render in a dedicated top-stacked section above documents in a responsive 1 to 4 column sub-grid.
- **Folder Selection Checkbox (`☑`)**: Full support for batch selection (`Select All` / `Select`) on folder cards with glowing amber highlight ring (`ring-2 ring-amber-500/50`).
- **Custom Folder Empty State**: Custom folder empty view displaying `"[Folder Name]" is Empty` with glowing amber folder icon.
- **Zero-Conflict Destination Storage**: Files inside folders belong strictly to their parent folder (`folder_id`). Identical file names (e.g. `a.jpeg` at Root vs `a.jpeg` inside a Folder) exist independently without any conflict.
- **Breadcrumb Navigation**: Navigate seamlessly with breadcrumbs (`Documents / Folder Name`) and a 1-click `← Back to All Documents` control.

### 📌 2. Destination-Scoped Pinning
- **Top Priority Grid Sorting**: Pinned items (`is_pinned === true`) automatically float to the top of the grid with a glowing `📌 Pinned` badge.
- **Scoped Pin Limits**: Max **5 pinned items** at Root level, max **3 pinned items** inside any folder.
- **Local Storage Fallback Cache**: Pin states save instantly with local storage fallback (`connect_pinned_${user.id}`) to guarantee zero rollback errors.

### 🎯 3. Dynamic Filter Pills & Instant Search
- **Dynamic File Filters**: Toolbar filter pills (`All`, `Folders`, `PDFs`, `Images`, `Docs`) adapt dynamically based strictly on the file types present in your workspace view.
- **Instant Search with Clear Control**: Search input features an inline `✕` clear button and automatically resets when navigating folder levels.

### 📝 4. Dynamic Notepad
- **Real-Time Workspace**: Create, format, edit, and organize notes effortlessly.
- **Mobile-Responsive Text Color Palette**: Color swatches with fixed-size glowing ring borders (`ring-2 ring-sky-400`), visible on all screens (mobile, tablet, desktop).
- **Local Cache & Auto-Save**: Lightning-fast offline loading backed by debounced 1-second auto-saving and status indicators (`● Synced`).

### 🔗 5. Curated Link Vault
- **Bookmark Management**: Store, tag, and categorize URLs with custom titles and 1-click copy feedback.
- **Edit Saved Links**: Update a link's title and URL in place via a dedicated edit modal, with duplicate-title/URL protection.
- **Night & Light Mode Polish**: High-contrast Sky Blue (`text-sky-400`) in Night Mode and Blue (`text-blue-600`) in Light Mode.

### 🚀 6. Upload Progress Console
- **Slide Out Right Exit**: Auto-dismissing progress console with smooth 500ms `Slide Out Right` animation upon 100% completion.
- **Cancel Controls**: Batch cancellation and line-by-line file upload controls.

### 🌐 7. Developer Footer & Animated Tooltips
- **Direct Icon Redirect Buttons**: Quick-access social buttons with smooth animated hover tooltips (`Personal Portfolio`, `GitHub`, `LinkedIn`, `Instagram`, `Email Me`).
- **Developer Quote**: *"Great ideas connect when passion meets precision code."* — **Kartik Varma**

---

## 🌐 Developer & Social Links

Connect is designed and engineered by **Kartik Varma**. Feel free to connect or collaborate:

| Platform | Link / Username | Direct Link |
| :--- | :--- | :--- |
| **🚀 Live App** | `crosser.vercel.app` | [Open Connect Web App](https://crosser.vercel.app) |
| **🌐 Portfolio** | `kartikvarma.vercel.app` | [Visit Portfolio](https://kartikvarma.vercel.app) |
| **🐙 GitHub** | `varmakartik` | [View GitHub](https://github.com/varmakartik) |
| **💼 LinkedIn** | `kartivarma200430` | [Connect on LinkedIn](https://linkedin.com/in/kartivarma200430) |
| **📸 Instagram** | `@ig_crosser` | [Follow on Instagram](https://instagram.com/ig_crosser) |
| **✉️ Email** | `kartikvarma.dev@gmail.com` | [Send Email](mailto:kartikvarma.dev@gmail.com) |

---

## 🔒 Environment Variables & Security

> [!IMPORTANT]
> **Supabase credentials are managed via environment configuration files (`.env` and `.env.production`).**

### Environment Variable Files

| Variable Name | Description | Example / Required |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Your Supabase Project API URL | `https://<your-project-id>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase Public Anon Key | `sb_publishable_...` |

---

## 🗄️ Supabase Database & Storage Setup

### 1. Database Table (`items`)

Create or update the `items` table in Supabase Database:

```sql
create table public.items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  folder_id uuid references public.items(id) on delete cascade,
  title text not null,
  content text,
  url text,
  type text default 'note', -- 'note', 'folder', 'doc', 'pdf', 'image', 'link'
  is_pinned boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.items enable row level security;

-- Index for folder performance
create index if not exists idx_items_folder_id on public.items(folder_id);

-- Policies for User Ownership
create policy "Users can view their own items" on public.items 
  for select using (auth.uid() = user_id);

create policy "Users can insert their own items" on public.items 
  for insert with check (auth.uid() = user_id);

create policy "Users can update their own items" on public.items 
  for update using (auth.uid() = user_id);

create policy "Users can delete their own items" on public.items 
  for delete using (auth.uid() = user_id);
```

### 2. Storage Bucket (`documents`)

1. Navigate to **Supabase Dashboard** > **Storage**.
2. Create a new bucket named **`documents`** with Public access.

---

## 🚀 Getting Started

```bash
# 1. Clone repository
git clone https://github.com/varmakartik/Connect.git
cd Connect

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Build for production
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

<div align="center">
  Crafted with ❤️ by <b>Kartik Varma</b>
</div>
