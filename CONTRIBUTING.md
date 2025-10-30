# Contributing to QuickCalAI

Thank you for your interest in contributing to QuickCalAI! 🎉

QuickCalAI is an AI-powered calendar extraction tool that helps users transform images and PDFs into organized calendar events. While this is a commercial SaaS product, we're committed to open source development and welcome contributions that improve the platform for all users.

## Ways to Contribute

### 🐛 Bug Reports
- Use the [GitHub Issues](https://github.com/rocktownlabs/quickcalai/issues) to report bugs
- Include detailed steps to reproduce, expected vs. actual behavior, and environment details
- Check existing issues first to avoid duplicates

### 💡 Feature Requests
- Open a [GitHub Issue](https://github.com/rocktownlabs/quickcalai/issues) with the "enhancement" label
- Describe the problem you're trying to solve and why it matters
- Consider how the feature aligns with our mission of making calendar extraction effortless

### 🛠️ Code Contributions
- Fix bugs, improve performance, add features, or enhance documentation
- All contributions must follow our code standards and include tests
- See the development setup below to get started

### 📚 Documentation
- Improve README, API docs, or user guides
- Add code comments or examples
- Translate documentation to other languages

### 🧪 Testing
- Write or improve tests
- Report test failures or flaky tests
- Help with test automation

## Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- pnpm package manager
- Git

### Local Development

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/quickcalai.git
   cd quickcalai
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Database Setup**
   ```bash
   # Set up PostgreSQL database
   # Update .env with your database URL
   pnpm db:push
   ```

4. **Environment Variables**
   Copy `.env.example` to `.env` and configure:
   ```env
   DATABASE_URL="postgresql://..."
   CLERK_SECRET_KEY="..."
   GOOGLE_GEMINI_API_KEY="..."
   # ... other required variables
   ```

5. **Start Development**
   ```bash
   pnpm dev        # Start all apps
   pnpm dev:web    # Start web app only
   pnpm dev:native # Start native app only
   ```

6. **Database Management**
   ```bash
   pnpm db:studio   # Open database UI
   pnpm db:generate # Generate migrations
   ```

## Code Standards

We follow strict coding standards to maintain code quality. Please review our [AGENTS.md](AGENTS.md) file for detailed guidelines including:

- **TypeScript Configuration**: Strict mode, no unused variables, verbatim module syntax
- **Import Patterns**: ES6 imports, type-only imports, path aliases (`@/*`)
- **Naming Conventions**: camelCase for variables/functions, PascalCase for components
- **Component Patterns**: Functional components with TypeScript, proper prop typing
- **Error Handling**: TypeScript strict typing, optional chaining, nullish coalescing
- **Styling**: Tailwind CSS with shadcn/ui components

### Code Quality Checks
Before submitting a PR, ensure:
```bash
pnpm check-types    # TypeScript type checking
pnpm build         # Build verification
```

## Testing

We use a comprehensive testing strategy:

### Running Tests
```bash
# Run all tests (when available)
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run specific test file
pnpm test -- path/to/test.ts
```

### Test Guidelines
- Write tests for new features and bug fixes
- Aim for good test coverage (target: 80%+)
- Use descriptive test names that explain the behavior being tested
- Test both happy path and error scenarios
- Mock external dependencies (API calls, database, etc.)

## Commit Messages

We follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```
feat(auth): add Google OAuth integration

fix(calendar): resolve timezone parsing bug in PDF extraction

docs(readme): update installation instructions

test(api): add integration tests for upload endpoint
```

## Pull Request Process

### Before Submitting
1. **Update your fork** with the latest changes from main
2. **Run tests** and ensure they pass
3. **Run type checking** and build verification
4. **Update documentation** if needed
5. **Write clear commit messages**

### PR Template
When creating a PR, include:
- **Title**: Clear, descriptive title following conventional commit format
- **Description**: What problem does this solve? How does it work?
- **Testing**: How did you test this change?
- **Screenshots**: UI changes or before/after comparisons
- **Breaking Changes**: Any breaking changes for users/developers?

### Review Process
1. **Automated Checks**: CI/CD will run tests, type checking, and linting
2. **Code Review**: Maintainers will review code for quality and adherence to standards
3. **Testing**: Changes may be tested in staging environment
4. **Approval**: At least one maintainer approval required
5. **Merge**: Squash merge with conventional commit message

## AI Usage Policy

We embrace AI tools for development but require transparency:

### If You Use AI Assistance
- **Share the chat session** with your pull request
- Include AI-generated code in a separate commit with clear attribution
- Example commit message: `feat(component): add new feature (AI-assisted)`
- Link to the AI chat session in your PR description

### Why We Require This
- **Transparency**: Shows the human oversight and review process
- **Quality Assurance**: Allows reviewers to understand the AI's reasoning
- **Learning**: Helps the community learn from AI-assisted development
- **Future Tooling**: We're integrating AI PR review tools (like CodeRabbit) soon

### How to Share AI Sessions
```
## AI Usage
- Used ChatGPT for initial component structure
- Session link: https://chat.openai.com/share/abc123
- Reviewed and modified 40% of generated code for project-specific requirements
```

## Code of Conduct

### Our Standards
- **Respectful**: Be kind and respectful to all contributors
- **Inclusive**: Welcome people from all backgrounds and experiences
- **Collaborative**: Work together to improve the project
- **Professional**: Maintain professional communication

### Unacceptable Behavior
- Harassment, discrimination, or offensive comments
- Personal attacks or trolling
- Spam or off-topic content
- Sharing private information without consent

### Enforcement
Violations will be addressed by maintainers. Serious violations may result in temporary or permanent bans.

## Recognition

Contributors are recognized in several ways:

### 🏆 Hall of Fame
Top contributors featured in our README and documentation

### 💝 Special Thanks
Recognition in release notes and social media

### 🎯 Impact
Your contributions directly improve QuickCalAI for thousands of users

### 📈 Growth
Help shape the future of AI-powered calendar management

## Getting Help

- **Documentation**: Check our [README](README.md) and [AGENTS.md](AGENTS.md)
- **Discussions**: Use [GitHub Discussions](https://github.com/rocktownlabs/quickcalai/discussions) for questions
- **Discord**: Join our community Discord for real-time help
- **Issues**: Open an issue for bugs or feature requests

## License

By contributing to QuickCalAI, you agree that your contributions will be licensed under the same [AGPL-3.0](LICENSE) license as the project.

---

Thank you for contributing to QuickCalAI! Your efforts help make calendar extraction effortless for users worldwide. 🚀