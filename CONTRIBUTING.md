# Contributing to Lumiere.ai

First off, thank you for considering contributing to Lumiere.ai! It's people like you that make Lumiere.ai such a great tool.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Process](#development-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)
- [Pull Request Process](#pull-request-process)

---

## Code of Conduct

This project and everyone participating in it is governed by our commitment to creating a welcoming and inclusive environment. By participating, you are expected to uphold this code. Please report unacceptable behavior to the project maintainers.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18 or higher
- **npm** 9 or higher
- **Git**
- A code editor (we recommend VS Code)

### Setting Up Your Development Environment

1. **Fork the repository**

   Click the "Fork" button at the top right of the repository page.

2. **Clone your fork**

   ```bash
   git clone https://github.com/YOUR_USERNAME/lumiere.ai.git
   cd lumiere.ai
   ```

3. **Add the upstream remote**

   ```bash
   git remote add upstream https://github.com/dlmastery/lumiere.ai.git
   ```

4. **Install dependencies**

   ```bash
   npm install
   ```

5. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your API keys
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

---

## How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues to avoid duplicates.

**When creating a bug report, include:**

- A clear and descriptive title
- Steps to reproduce the behavior
- Expected behavior vs actual behavior
- Screenshots if applicable
- Your environment (OS, browser, Node.js version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues.

**When creating an enhancement suggestion, include:**

- A clear and descriptive title
- A detailed description of the proposed functionality
- Explain why this enhancement would be useful
- List any alternatives you've considered

### Your First Code Contribution

Unsure where to begin? Look for issues labeled:

- `good first issue` - Good for newcomers
- `help wanted` - Extra attention needed
- `documentation` - Improvements to docs

---

## Development Process

### Branching Strategy

We use a simplified Git flow:

- `main` - Production-ready code
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates

### Creating a Branch

```bash
# Sync with upstream
git fetch upstream
git checkout main
git merge upstream/main

# Create a new branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in your feature branch
2. Test your changes locally
3. Ensure your code follows the style guidelines
4. Write or update tests if applicable
5. Update documentation if needed

---

## Style Guidelines

### TypeScript

- Use TypeScript for all new code
- Define types for all function parameters and return values
- Use interfaces for object shapes
- Avoid `any` type when possible

```typescript
// Good
interface Scene {
  id: string;
  description: string;
  narrative: string;
}

function processScene(scene: Scene): Promise<void> {
  // ...
}

// Avoid
function processScene(scene: any): any {
  // ...
}
```

### React Components

- Use functional components with hooks
- Use descriptive component names (PascalCase)
- Keep components focused and small
- Extract reusable logic into custom hooks

```typescript
// Good
export const SceneCard: React.FC<SceneCardProps> = ({ scene, onEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  // ...
};

// Avoid
export const Card = (props) => {
  // Too generic, unclear purpose
};
```

### CSS/Tailwind

- Use Tailwind CSS utility classes
- Keep class lists readable (use template literals for long lists)
- Follow the project's color scheme (gold, slate)

```typescript
// Good
<button className="px-4 py-2 bg-gold-500 text-white rounded-lg hover:bg-gold-600 transition-colors">
  Click me
</button>

// For longer class lists
const buttonClasses = `
  px-4 py-2
  bg-gold-500 text-white
  rounded-lg shadow-lg
  hover:bg-gold-600
  transition-all
`;
```

### File Organization

- One component per file
- Co-locate related files (component + types + tests)
- Use index files for clean exports

---

## Commit Messages

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Format

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

### Types

| Type | Description |
|------|-------------|
| `feat` | A new feature |
| `fix` | A bug fix |
| `docs` | Documentation changes |
| `style` | Code style changes (formatting, etc.) |
| `refactor` | Code changes that neither fix bugs nor add features |
| `perf` | Performance improvements |
| `test` | Adding or updating tests |
| `chore` | Maintenance tasks |

### Examples

```bash
feat(auth): add Google Sign-In authentication

fix(player): resolve audio sync issue on Safari

docs(readme): update installation instructions

refactor(scenes): extract scene validation logic
```

---

## Pull Request Process

### Before Submitting

1. **Update your branch with the latest upstream changes**

   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run the build to ensure no errors**

   ```bash
   npm run build
   ```

3. **Test your changes thoroughly**

4. **Update documentation if needed**

### Submitting Your PR

1. Push your branch to your fork

   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a Pull Request against `main`

3. Fill out the PR template completely

4. Link any related issues

### PR Title Format

Use the same format as commit messages:

```
feat(component): add new feature description
```

### What to Expect

- A maintainer will review your PR within a few days
- You may be asked to make changes
- Once approved, your PR will be merged
- Your contribution will be credited

---

## Questions?

Feel free to open an issue with the `question` label if you need help or clarification.

---

Thank you for contributing to Lumiere.ai!
