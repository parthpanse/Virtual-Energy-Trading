# Contributing to Virtual Energy Trading Platform

Thank you for your interest in contributing to the Virtual Energy Trading Platform! This document provides guidelines and information for contributors.

## 🎯 Project Overview

The Virtual Energy Trading Platform is a sophisticated simulation environment for energy trading operations. The project consists of:

- **Backend**: FastAPI-based REST API with SQLModel database
- **Frontend**: React + TypeScript application with Arco Design
- **Infrastructure**: Docker containerization and deployment

## 🚀 Getting Started

### Prerequisites

- **Git**: Version control system
- **Docker & Docker Compose**: Containerization
- **Python 3.11+**: Backend development
- **Node.js 18+**: Frontend development
- **Code Editor**: VS Code, PyCharm, or similar

### Development Setup

1. **Fork and Clone**
   ```bash
   # Fork the repository on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/Virtual-Energy-Trading.git
   cd Virtual-Energy-Trading
   
   # Add upstream remote
   git remote add upstream https://github.com/ORIGINAL_OWNER/Virtual-Energy-Trading.git
   ```

2. **Start Development Environment**
   ```bash
   # Start all services
   docker-compose up --build
   
   # Or start services individually
   docker-compose up backend
   docker-compose up frontend
   ```

3. **Local Development**
   ```bash
   # Backend (in one terminal)
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   
   # Frontend (in another terminal)
   cd frontend
   npm install
   npm run dev
   ```

## 🏗️ Project Structure

```
Virtual-Energy-Trading/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── api/           # API endpoints
│   │   ├── models/        # Database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic
│   │   └── database.py    # Database configuration
│   ├── main.py            # Application entry point
│   ├── requirements.txt   # Python dependencies
│   └── Dockerfile         # Backend container
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   └── main.tsx       # Entry point
│   ├── package.json       # Node dependencies
│   └── Dockerfile         # Frontend container
├── docker-compose.yml      # Service orchestration
└── docs/                   # Documentation
```

## 📝 Development Guidelines

### Code Style

#### Python (Backend)
- **Formatting**: Use Black for code formatting
- **Linting**: Use flake8 for linting
- **Type Hints**: Use type hints for all function parameters and return values
- **Docstrings**: Use Google-style docstrings for all functions and classes

```python
def calculate_pnl(
    user_id: str, 
    target_date: date
) -> List[PnLRecord]:
    """Calculate PnL for a user on a specific date.
    
    Args:
        user_id: Unique identifier for the user
        target_date: Date for PnL calculation
        
    Returns:
        List of PnL records for the user and date
        
    Raises:
        HTTPException: If user_id is invalid
    """
    # Implementation here
    pass
```

#### TypeScript/React (Frontend)
- **Formatting**: Use Prettier for code formatting
- **Linting**: Use ESLint with TypeScript rules
- **Type Safety**: Use strict TypeScript configuration
- **Component Structure**: Use functional components with hooks

```typescript
interface BidFormProps {
  onSubmit: (bid: BidData) => void;
  isLoading?: boolean;
}

const BidForm: React.FC<BidFormProps> = ({ onSubmit, isLoading = false }) => {
  // Component implementation
  return (
    <form onSubmit={handleSubmit}>
      {/* Form content */}
    </form>
  );
};
```

### Database Guidelines

- **Migrations**: Use Alembic for database migrations
- **Models**: Extend SQLModel for all database models
- **Relationships**: Define clear foreign key relationships
- **Indexes**: Add appropriate database indexes for performance

### API Design

- **RESTful**: Follow REST principles for API design
- **Status Codes**: Use appropriate HTTP status codes
- **Error Handling**: Provide clear error messages and codes
- **Validation**: Use Pydantic for request/response validation

### Testing

#### Backend Testing
```bash
cd backend
pytest                    # Run all tests
pytest -v               # Verbose output
pytest -k "test_name"   # Run specific test
pytest --cov=app        # With coverage
```

#### Frontend Testing
```bash
cd frontend
npm test                 # Run all tests
npm test -- --watch     # Watch mode
npm test -- --coverage  # With coverage
```

### Testing Standards
- **Unit Tests**: Test individual functions and methods
- **Integration Tests**: Test API endpoints and database operations
- **Coverage**: Maintain >80% code coverage
- **Mocking**: Use appropriate mocking for external dependencies

## 🔄 Development Workflow

### 1. Create Feature Branch
```bash
# Update your fork
git fetch upstream
git checkout main
git merge upstream/main

# Create feature branch
git checkout -b feature/your-feature-name
```

### 2. Make Changes
- Write code following the style guidelines
- Add tests for new functionality
- Update documentation as needed
- Ensure all tests pass

### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add real-time price updates

- Implement WebSocket connection for live prices
- Add price change notifications
- Update dashboard with real-time data
- Add tests for WebSocket functionality"
```

#### Commit Message Format
Use conventional commits format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Maintenance tasks

### 4. Push and Create PR
```bash
git push origin feature/your-feature-name
```

Then create a Pull Request on GitHub with:
- Clear description of changes
- Screenshots for UI changes
- Test coverage information
- Any breaking changes noted

## 🧪 Testing Guidelines

### Backend Testing
- **Unit Tests**: Test individual service methods
- **API Tests**: Test endpoint functionality
- **Database Tests**: Test model operations
- **Integration Tests**: Test service interactions

### Frontend Testing
- **Component Tests**: Test React components
- **Hook Tests**: Test custom hooks
- **Integration Tests**: Test page functionality
- **E2E Tests**: Test complete user workflows

### Test Data
- Use factories for creating test data
- Clean up test data after each test
- Use realistic but minimal test data
- Mock external services appropriately

## 📚 Documentation

### Code Documentation
- Document all public APIs and functions
- Include usage examples in docstrings
- Keep README files up to date
- Document configuration options

### API Documentation
- Use FastAPI's automatic documentation
- Add detailed descriptions for endpoints
- Include request/response examples
- Document error codes and messages

### User Documentation
- Provide setup instructions
- Include usage examples
- Document configuration options
- Add troubleshooting guides

## 🚀 Deployment

### Development
```bash
# Start development environment
docker-compose up --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up --build

# Deploy to production
docker-compose -f docker-compose.prod.yml up -d
```

## 🐛 Issue Reporting

### Bug Reports
When reporting bugs, include:
- Clear description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Environment details (OS, browser, etc.)
- Screenshots or error logs

### Feature Requests
For feature requests:
- Clear description of the feature
- Use case and benefits
- Implementation suggestions (if any)
- Priority level

## 🤝 Code Review Process

### Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No breaking changes (or clearly documented)
- [ ] Performance considerations addressed
- [ ] Security implications considered

### Review Guidelines
- Be constructive and respectful
- Focus on code quality and functionality
- Suggest improvements when possible
- Approve only when satisfied with changes

## 📊 Performance Guidelines

### Backend Performance
- Use database indexes appropriately
- Implement caching where beneficial
- Optimize database queries
- Use async/await for I/O operations

### Frontend Performance
- Minimize bundle size
- Use React.memo for expensive components
- Implement lazy loading where appropriate
- Optimize re-renders

## 🔒 Security Guidelines

### Backend Security
- Validate all input data
- Use parameterized queries
- Implement proper authentication
- Sanitize user inputs
- Use HTTPS in production

### Frontend Security
- Sanitize user inputs
- Use Content Security Policy
- Implement proper CORS
- Validate data before submission

## 🌟 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor statistics
- Special acknowledgments for significant contributions

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and discussions
- **Pull Requests**: For code contributions

### Resources
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://reactjs.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Arco Design Documentation](https://arco.design/react/en-US)

## 📋 Contribution Checklist

Before submitting a contribution:

- [ ] Code follows style guidelines
- [ ] Tests are written and passing
- [ ] Documentation is updated
- [ ] No console errors or warnings
- [ ] All linting checks pass
- [ ] Performance impact considered
- [ ] Security implications reviewed
- [ ] Breaking changes documented

## 🎉 Thank You!

Thank you for contributing to the Virtual Energy Trading Platform! Your contributions help make this project better for everyone.

---

**Note**: This contributing guide is a living document. Please suggest improvements and updates as the project evolves.
