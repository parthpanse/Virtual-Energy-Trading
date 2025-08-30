# Contributing to Virtual Energy Trading Platform

Thank you for your interest in contributing to the Virtual Energy Trading Platform! This document provides guidelines and information for contributors.

## 🤝 How to Contribute

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Report bugs and issues you encounter
- **Feature Requests**: Suggest new features or improvements
- **Code Contributions**: Submit pull requests with code changes
- **Documentation**: Improve or expand documentation
- **Testing**: Help test the platform and report findings
- **Design**: Contribute to UI/UX improvements

### Getting Started

1. **Fork the Repository**
   - Click the "Fork" button on the GitHub repository page
   - Clone your forked repository to your local machine

2. **Set Up Development Environment**
   ```bash
   git clone https://github.com/your-username/Virtual-Energy-Trading.git
   cd Virtual-Energy-Trading
   
   # Backend setup
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   
   # Frontend setup
   cd ../frontend
   npm install
   ```

3. **Create a Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📋 Development Guidelines

### Code Style

#### Python (Backend)
- **Formatting**: Use Black for code formatting
- **Linting**: Use flake8 for linting
- **Type Hints**: Use type hints for all function parameters and return values
- **Docstrings**: Follow Google docstring format

```python
def calculate_pnl(da_price: Decimal, rt_price: Decimal, quantity: Decimal) -> Decimal:
    """Calculate profit and loss for a given contract.
    
    Args:
        da_price: Day-ahead market price
        rt_price: Real-time market price
        quantity: Contract quantity in MWh
        
    Returns:
        Calculated PnL value
        
    Raises:
        ValueError: If prices or quantity are negative
    """
    if da_price < 0 or rt_price < 0 or quantity < 0:
        raise ValueError("Prices and quantity must be positive")
    
    return (rt_price - da_price) * quantity
```

#### TypeScript/React (Frontend)
- **Formatting**: Use Prettier for code formatting
- **Linting**: Use ESLint with TypeScript rules
- **Type Safety**: Use strict TypeScript configuration
- **Component Structure**: Use functional components with hooks

```typescript
interface BidFormProps {
  onSubmit: (bid: BidData) => void;
  onCancel: () => void;
  loading?: boolean;
}

const BidForm: React.FC<BidFormProps> = ({ onSubmit, onCancel, loading = false }) => {
  const [form] = Form.useForm();
  
  const handleSubmit = (values: BidData) => {
    onSubmit(values);
  };
  
  return (
    <Form form={form} onFinish={handleSubmit}>
      {/* Form fields */}
    </Form>
  );
};
```

### Testing Requirements

#### Backend Testing
- **Coverage**: Aim for >80% test coverage
- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints and database operations
- **Test Structure**: Use pytest fixtures and parametrized tests

```python
import pytest
from decimal import Decimal
from app.services.pnl_service import calculate_pnl

@pytest.mark.parametrize("da_price,rt_price,quantity,expected", [
    (Decimal("45.50"), Decimal("47.25"), Decimal("100"), Decimal("175.00")),
    (Decimal("48.75"), Decimal("46.80"), Decimal("50"), Decimal("-97.50")),
])
def test_calculate_pnl(da_price, rt_price, quantity, expected):
    result = calculate_pnl(da_price, rt_price, quantity)
    assert result == expected
```

#### Frontend Testing
- **Component Tests**: Test component rendering and interactions
- **Integration Tests**: Test page workflows
- **Accessibility**: Ensure components meet accessibility standards
- **Test Structure**: Use React Testing Library

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import BidForm from '../BidForm';

describe('BidForm', () => {
  it('should submit form with valid data', () => {
    const mockSubmit = jest.fn();
    const mockCancel = jest.fn();
    
    render(<BidForm onSubmit={mockSubmit} onCancel={mockCancel} />);
    
    fireEvent.change(screen.getByLabelText('Hour'), { target: { value: '14' } });
    fireEvent.change(screen.getByLabelText('Quantity'), { target: { value: '100' } });
    fireEvent.click(screen.getByText('Submit'));
    
    expect(mockSubmit).toHaveBeenCalledWith({
      hour: 14,
      quantity: 100,
      // other fields...
    });
  });
});
```

### Database and Models

#### Model Design
- **Naming**: Use descriptive table and column names
- **Relationships**: Define clear foreign key relationships
- **Indexes**: Add indexes for frequently queried columns
- **Constraints**: Use database constraints for data integrity

```python
class Bid(SQLModel, table=True):
    __tablename__ = "bids"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    hour: int = Field(ge=0, le=23, index=True)
    date: date = Field(index=True)
    type: BidType = Field(index=True)
    quantity: Decimal = Field(max_digits=10, decimal_places=2)
    price: Decimal = Field(max_digits=10, decimal_places=2)
    status: BidStatus = Field(default=BidStatus.PENDING, index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        arbitrary_types_allowed = True
```

#### Migration Strategy
- **Version Control**: Track database schema changes
- **Backward Compatibility**: Ensure migrations are reversible
- **Testing**: Test migrations on sample data

### API Design

#### Endpoint Structure
- **RESTful**: Follow REST principles
- **Versioning**: Use URL versioning (e.g., `/api/v1/bids`)
- **Error Handling**: Return consistent error responses
- **Validation**: Validate all input data

```python
@router.post("/bids", response_model=BidResponse, status_code=201)
async def create_bid(
    bid: BidCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> BidResponse:
    """Create a new bid for energy trading."""
    try:
        # Validate business rules
        await validate_bid_rules(bid, current_user, db)
        
        # Create bid
        db_bid = Bid.from_orm(bid)
        db_bid.user_id = current_user.id
        db.add(db_bid)
        db.commit()
        db.refresh(db_bid)
        
        return BidResponse.from_orm(db_bid)
        
    except ValidationError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        logger.error(f"Error creating bid: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
```

#### Response Format
```json
{
  "success": true,
  "data": {
    "id": 1,
    "hour": 14,
    "type": "BUY",
    "quantity": "100.00",
    "price": "45.50"
  },
  "message": "Bid created successfully"
}
```

## 🚀 Pull Request Process

### Before Submitting

1. **Ensure Code Quality**
   - Run all tests: `pytest` (backend) and `npm test` (frontend)
   - Check code formatting: `black .` (backend) and `npm run lint` (frontend)
   - Verify no linting errors

2. **Update Documentation**
   - Update README.md if adding new features
   - Add docstrings for new functions
   - Update API documentation if changing endpoints

3. **Test Your Changes**
   - Test locally with Docker: `docker-compose up --build`
   - Verify all functionality works as expected
   - Test edge cases and error conditions

### Pull Request Template

```markdown
## Description
Brief description of changes and why they're needed.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Backend tests pass
- [ ] Frontend tests pass
- [ ] Manual testing completed
- [ ] Edge cases tested

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console errors
- [ ] Responsive design tested

## Screenshots (if applicable)
Add screenshots for UI changes.

## Additional Notes
Any additional information or context.
```

### Review Process

1. **Code Review**
   - At least one maintainer must approve
   - Address all review comments
   - Ensure CI/CD checks pass

2. **Merge Requirements**
   - All tests must pass
   - No merge conflicts
   - Documentation updated
   - Code review approved

## 🐛 Bug Reports

### Bug Report Template

```markdown
## Bug Description
Clear description of the bug.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. See error

## Expected Behavior
What should happen.

## Actual Behavior
What actually happens.

## Environment
- OS: [e.g., Windows 10, macOS 12.0]
- Browser: [e.g., Chrome 96, Firefox 95]
- Version: [e.g., 1.0.0]

## Additional Context
Any other context, logs, or screenshots.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
## Feature Description
Clear description of the requested feature.

## Problem Statement
What problem does this feature solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other approaches were considered?

## Additional Context
Any other context or examples.
```

## 📚 Documentation

### Documentation Standards

- **Clarity**: Write clear, concise documentation
- **Examples**: Include code examples and use cases
- **Structure**: Use consistent formatting and organization
- **Updates**: Keep documentation current with code changes

### Documentation Types

1. **Code Documentation**: Inline comments and docstrings
2. **API Documentation**: Endpoint descriptions and examples
3. **User Guides**: How-to guides for end users
4. **Developer Guides**: Setup and contribution instructions

## 🏷️ Version Control

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, test, chore
**Scope**: backend, frontend, docs, docker, etc.

**Examples**:
```
feat(backend): add bid validation service
fix(frontend): resolve navigation menu collapse issue
docs(readme): update installation instructions
```

### Branch Naming

- **Feature branches**: `feature/description`
- **Bug fix branches**: `fix/description`
- **Documentation branches**: `docs/description`
- **Release branches**: `release/version`

## 🔒 Security

### Security Guidelines

- **Input Validation**: Validate all user inputs
- **Authentication**: Implement proper authentication
- **Authorization**: Use role-based access control
- **Data Protection**: Protect sensitive data
- **Dependencies**: Keep dependencies updated

### Reporting Security Issues

If you discover a security vulnerability:
1. **DO NOT** create a public issue
2. Email security@example.com
3. Include detailed description and steps to reproduce
4. Allow time for response before public disclosure

## 📞 Getting Help

### Communication Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Email**: For security issues or private matters

### Resources

- [Project README](README.md)
- [API Documentation](API_DOCS.md)
- [Engineering Decisions](DECISIONS.md)
- [Evaluation Guide](EVALUATION.md)

## 🎉 Recognition

Contributors will be recognized in:
- Project README
- Release notes
- Contributor hall of fame
- GitHub contributors page

---

Thank you for contributing to the Virtual Energy Trading Platform! Your contributions help make this project better for everyone.
