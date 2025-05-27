# AI-Friendly Architecture Guide

## Overview

This document outlines the AI-friendly patterns and practices implemented throughout the codebase. These patterns are designed to make the code highly readable, predictable, and easy for AI systems to understand, extend, and maintain.

## Core Principles

### 1. Predictable Patterns
- **Consistent naming conventions**: All functions, variables, and components follow clear naming patterns
- **Standardized interfaces**: Common props and return types across similar components
- **Uniform error handling**: Consistent error patterns throughout the application

### 2. Clear Separation of Concerns
- **Presentation vs Logic**: UI components are separate from business logic
- **State Management**: Centralized state with predictable update patterns
- **Side Effects**: Isolated in custom hooks and services

### 3. Type Safety
- **Comprehensive TypeScript**: Full type coverage with meaningful interfaces
- **Generic Patterns**: Reusable type patterns for common scenarios
- **Runtime Validation**: Type guards and validation functions where needed

### 4. Documentation Standards
- **JSDoc Comments**: Comprehensive documentation for all public APIs
- **Usage Examples**: Clear examples for complex functions and components
- **AI Context**: Special comments explaining patterns for AI understanding

## Component Architecture

### Base Component Pattern

All components extend from base interfaces that provide consistent APIs:

\`\`\`typescript
interface BaseComponentProps {
  id?: string
  className?: string
  testId?: string
  ariaLabel?: string
  disabled?: boolean
}
\`\`\`

### Interactive Component Pattern

Interactive components follow a standard pattern:

\`\`\`typescript
interface InteractiveComponentProps extends BaseComponentProps {
  onClick?: (event: React.MouseEvent) => void
  onKeyDown?: (event: React.KeyboardEvent) => void
  isFocused?: boolean
  isLoading?: boolean
}
\`\`\`

### State Management Pattern

State is managed through predictable patterns:

\`\`\`typescript
const {
  state,
  setState,
  resetState,
  updateState,
  isLoading,
  error
} = useAIFriendlyState(initialState, options)
\`\`\`

## Naming Conventions

### Functions
- **Verbs first**: `handleClick`, `validateEmail`, `formatDate`
- **Clear purpose**: Function names describe exactly what they do
- **Consistent prefixes**: `get`, `set`, `handle`, `validate`, `format`, `create`, `update`, `delete`

### Components
- **PascalCase**: `AIFriendlyButton`, `CanvasNode`, `NodeDetailsPanel`
- **Descriptive names**: Names clearly indicate the component's purpose
- **Consistent suffixes**: `Button`, `Panel`, `Dialog`, `Form`, `Card`

### Variables
- **camelCase**: `isLoading`, `userPreferences`, `canvasState`
- **Boolean prefixes**: `is`, `has`, `can`, `should`, `will`
- **Clear context**: Variable names provide context about their purpose

### Types and Interfaces
- **PascalCase**: `CanvasNode`, `ComponentProps`, `StateHookReturn`
- **Descriptive suffixes**: `Props`, `State`, `Config`, `Options`, `Return`
- **Clear relationships**: Type names indicate their role in the system

## Error Handling Patterns

### Consistent Error Structure
\`\`\`typescript
interface ErrorResult {
  success: false
  error: {
    message: string
    code?: string
    details?: any
  }
}
\`\`\`

### Try-Catch Patterns
\`\`\`typescript
try {
  const result = await operation()
  return { success: true, data: result }
} catch (error) {
  return {
    success: false,
    error: {
      message: error instanceof Error ? error.message : 'Unknown error',
      details: error
    }
  }
}
\`\`\`

## Performance Patterns

### Memoization
- **useMemo**: For expensive calculations
- **useCallback**: For event handlers and functions passed as props
- **React.memo**: For components that don't need frequent re-renders

### Lazy Loading
- **Dynamic imports**: For code splitting
- **Lazy components**: For components that aren't immediately needed
- **Data fetching**: Load data only when needed

## Testing Patterns

### Component Testing
- **Test IDs**: All interactive elements have `data-testid` attributes
- **Accessibility**: Tests include ARIA labels and keyboard navigation
- **User interactions**: Tests simulate real user behavior

### Hook Testing
- **Isolated testing**: Hooks are tested independently
- **State transitions**: All state changes are tested
- **Error scenarios**: Error conditions are thoroughly tested

## AI Integration Guidelines

### Code Structure for AI Understanding
1. **Clear hierarchies**: Logical file and folder organization
2. **Consistent patterns**: Similar problems solved in similar ways
3. **Comprehensive documentation**: Every public API is documented
4. **Type annotations**: Full TypeScript coverage for better AI understanding

### AI-Friendly Comments
\`\`\`typescript
/**
 * AI Context: This function demonstrates the standard pattern for
 * handling async operations with error handling and loading states
 */
\`\`\`

### Predictable APIs
- **Standard parameters**: Common parameter patterns across functions
- **Consistent return types**: Similar operations return similar structures
- **Clear side effects**: All side effects are documented and predictable

## Migration Guide

When updating existing code to follow AI-friendly patterns:

1. **Add type annotations**: Ensure all functions and variables are properly typed
2. **Standardize naming**: Update names to follow consistent conventions
3. **Add documentation**: Include JSDoc comments for all public APIs
4. **Extract patterns**: Move common logic to reusable utilities
5. **Improve error handling**: Implement consistent error patterns
6. **Add tests**: Ensure all functionality is properly tested

## Best Practices

### Do's
- ✅ Use descriptive names that explain purpose
- ✅ Follow consistent patterns throughout the codebase
- ✅ Document complex logic with clear comments
- ✅ Separate concerns into focused modules
- ✅ Use TypeScript for better code understanding
- ✅ Include usage examples in documentation

### Don'ts
- ❌ Use abbreviations or unclear names
- ❌ Mix different patterns in similar contexts
- ❌ Leave complex logic undocumented
- ❌ Create large, multi-purpose functions
- ❌ Ignore TypeScript errors or use `any` types
- ❌ Skip error handling in async operations

## Conclusion

By following these AI-friendly patterns, the codebase becomes more maintainable, understandable, and ready for AI-assisted development. These patterns ensure that both human developers and AI systems can effectively work with the code to build and maintain robust applications.
