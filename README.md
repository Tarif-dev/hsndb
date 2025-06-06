<div align="center">
  <img src="public/favicon.ico" alt="HSNDB Logo" width="64" height="64" />
  
  # HSNDB - Human S-Nitrosylation Database
  
  *The most comprehensive database of human S-nitrosylated proteins for researchers studying nitric oxide signaling*
  
  [![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
</div>

---

## 🧬 About HSNDB

**HSNDB (Human S-Nitrosylation Database)** is a cutting-edge web application designed for researchers studying **S-nitrosylation** - a crucial post-translational modification where nitric oxide (NO) forms covalent bonds with cysteine residues in proteins. This database provides comprehensive information about human S-nitrosylated proteins and their role in health and disease.

### 🔬 What is S-nitrosylation?

S-nitrosylation is a reversible post-translational modification that serves as a critical regulatory mechanism in cellular signaling. In humans, dysregulated S-nitrosylation is implicated in:

- 🫀 **Cardiovascular diseases**
- 🧠 **Neurodegenerative disorders**
- 🎯 **Cancer**
- ⚡ **Metabolic diseases**

---

## ✨ Key Features

| Feature                           | Description                                                                    |
| --------------------------------- | ------------------------------------------------------------------------------ |
| 🔍 **Advanced Search**            | Intelligent auto-complete, multi-parameter filtering, and visual query builder |
| 📊 **Interactive Visualizations** | 3D protein structures, network analysis, and dynamic charts                    |
| 📁 **Flexible Data Export**       | Multiple formats including CSV, JSON, FASTA, and XML                           |
| 👥 **Collaborative Research**     | Share datasets and collaborate with research teams                             |
| ⚡ **High Performance**           | Optimized for large-scale protein data analysis                                |
| 🛡️ **Secure & Reliable**          | Enterprise-grade security with regular backups                                 |

---

## 🚀 Tech Stack

### Frontend

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching

### Backend & Database

- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time subscriptions** - Live data updates

### Development Tools

- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Bun** - Fast package manager

---

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **Bun** (recommended) or **npm**
- **Git**

### Quick Start

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd Nitro
   ```

2. **Install dependencies**

   ```bash
   # Using Bun (recommended)
   bun install

   # Or using npm
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

4. **Start the development server**

   ```bash
   # Using Bun
   bun run dev

   # Or using npm
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:8080
   ```

---

## 📜 Available Scripts

| Command             | Description                           |
| ------------------- | ------------------------------------- |
| `bun run dev`       | Start development server on port 8080 |
| `bun run build`     | Build for production                  |
| `bun run build:dev` | Build in development mode             |
| `bun run preview`   | Preview production build              |
| `bun run lint`      | Run ESLint for code quality           |

---

## 🏗️ Project Structure

```
📁 Nitro/
├── 📁 public/                 # Static assets
│   ├── favicon.ico           # App favicon
│   ├── placeholder.svg       # Placeholder images
│   └── robots.txt           # SEO robots file
├── 📁 src/
│   ├── 📁 components/        # React components
│   │   ├── 📁 ui/           # Shadcn/ui components
│   │   ├── BrowseInterface.tsx
│   │   ├── CentralSearch.tsx
│   │   ├── FeaturesSection.tsx
│   │   ├── HeroSection.tsx
│   │   └── Navigation.tsx
│   ├── 📁 hooks/            # Custom React hooks
│   ├── 📁 integrations/     # External service integrations
│   │   └── 📁 supabase/     # Supabase configuration
│   ├── 📁 lib/              # Utility libraries
│   ├── 📁 pages/            # Page components
│   └── App.tsx              # Main app component
├── 📄 package.json          # Project dependencies
├── 📄 vite.config.ts        # Vite configuration
├── 📄 tailwind.config.ts    # Tailwind CSS config
└── 📄 tsconfig.json         # TypeScript configuration
```

---

## 🎨 UI Components

This project uses **Shadcn/ui** components for a consistent and accessible design system:

- **Forms**: Input, Select, Textarea, Checkbox, Radio Group
- **Navigation**: Navigation Menu, Breadcrumb, Pagination
- **Data Display**: Table, Card, Badge, Avatar
- **Feedback**: Alert, Toast, Progress, Skeleton
- **Overlay**: Dialog, Popover, Tooltip, Sheet
- **Charts**: Recharts integration for data visualization

---

## 🗄️ Database Schema

The application uses Supabase PostgreSQL with the following main entities:

### Proteins Table

```sql
- id: UUID (Primary Key)
- hsn_id: String (Human S-Nitrosylation ID)
- protein_name: String
- gene_name: String
- uniprot_id: String
- alphafold_id: String
- protein_length: Integer
- positions_of_nitrosylation: String
- total_sites: Integer
- cancer_causing: Boolean
- cancer_types: String Array
- created_at: Timestamp
- updated_at: Timestamp
```

---

## 🚀 Deployment

### Production Build

```bash
bun run build
```

### Environment Variables

Create a `.env.local` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 🤝 Contributing

We welcome contributions from the research community!

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use Tailwind CSS for styling
- Write meaningful commit messages
- Test your changes thoroughly
- Update documentation as needed

---

## 📋 Roadmap

- [ ] **Advanced Analytics Dashboard**
- [ ] **Machine Learning Predictions**
- [ ] **API Documentation & Public API**
- [ ] **Mobile App Version**
- [ ] **Integration with PDB Database**
- [ ] **Real-time Collaboration Features**
- [ ] **Enhanced Visualization Tools**

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Development Team

Built with ❤️ for the scientific research community.

---

## 📞 Support & Contact

- **Issues**: [GitHub Issues](../../issues)
- **Discussions**: [GitHub Discussions](../../discussions)
- **Email**: [Contact Research Team](mailto:research@hsndb.org)

---

<div align="center">
  <sub>🧬 Advancing S-nitrosylation research through innovative technology 🧬</sub>
</div>

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

