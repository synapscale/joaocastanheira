# Collapsible Sidebar Component Guide

## Overview

The `CollapsibleSidebar` component provides a fully-featured navigation sidebar with minimize/maximize functionality, state persistence, responsive behavior, and comprehensive accessibility support.

## Features

### ✨ Core Functionality
- **Minimize/Maximize**: Toggle between full and compact states
- **State Persistence**: User preferences saved across sessions
- **Responsive Design**: Adapts to mobile, tablet, and desktop screens
- **Smooth Animations**: CSS transitions for state changes
- **Accessibility**: Full keyboard navigation and screen reader support

### 🎯 Navigation Features
- **Icon-only Mode**: Minimized state shows only icons with tooltips
- **Priority Filtering**: High-priority items shown in minimized state
- **Badge Support**: Notification badges on navigation items
- **External Link Indicators**: Visual cues for external links
- **Active State Tracking**: Highlights current page/section

### 📱 Responsive Behavior
- **Desktop**: Minimize/maximize with smooth width transitions
- **Tablet**: Auto-minimizes to save space
- **Mobile**: Slides in/out as overlay with backdrop

## Usage Examples

### Basic Implementation

\`\`\`tsx
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"

function App() {
  return (
    <div className="flex h-screen">
      <CollapsibleSidebar />
      <main className="flex-1">
        {/* Your content */}
      </main>
    </div>
  )
}
\`\`\`

### With State Monitoring

\`\`\`tsx
import { CollapsibleSidebar } from "@/components/layout/collapsible-sidebar"

function App() {
  const handleSidebarChange = (state) => {
    console.log('Sidebar state:', state)
    // Adjust layout based on sidebar state
  }

  return (
    <CollapsibleSidebar 
      onStateChange={handleSidebarChange}
      showDevelopmentTools={true}
    />
  )
}
\`\`\`

### Using Pre-configured Variants

\`\`\`tsx
import { SidebarVariants } from "@/components/layout/collapsible-sidebar"

// Different variants for different use cases
<SidebarVariants.Default />      // Full-featured sidebar
<SidebarVariants.Compact />      // Dense layout variant
<SidebarVariants.Minimal />      // Simple interface variant
<SidebarVariants.Development />  // With dev tools visible
\`\`\`

## Props API

### CollapsibleSidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `itemVariant` | `"default" \| "compact" \| "minimal"` | `"default"` | Visual style of navigation items |
| `showDevelopmentTools` | `boolean` | `auto` | Whether to show development tools section |
| `showBadges` | `boolean` | `true` | Whether to display notification badges |
| `showTooltips` | `boolean` | `true` | Whether to show tooltips on hover |
| `className` | `string` | - | Additional CSS classes |
| `onStateChange` | `(state) => void` | - | Callback when sidebar state changes |

## State Management

### useSidebarState Hook

The sidebar uses a custom hook for state management:

\`\`\`tsx
const {
  isMinimized,     // Current minimized state
  isHidden,        // Current visibility state
  isMobile,        // Is mobile viewport
  toggleMinimized, // Toggle minimize/maximize
  toggleVisibility, // Toggle show/hide (mobile)
  userPreference,  // User's saved preference
} = useSidebarState()
\`\`\`

### User Preferences

The sidebar persists three preference states:
- `"expanded"`: Always show full sidebar
- `"minimized"`: Always show minimized sidebar
- `"auto"`: Responsive behavior based on screen size

## Accessibility Features

### Keyboard Navigation
- **Tab**: Navigate through sidebar items
- **Enter/Space**: Activate navigation items or toggle button
- **Escape**: Close sidebar on mobile

### Screen Reader Support
- **ARIA Labels**: Descriptive labels for all interactive elements
- **ARIA Expanded**: Indicates sidebar state
- **Role Attributes**: Proper semantic roles
- **Live Regions**: Announces state changes

### Focus Management
- **Focus Trapping**: Keeps focus within sidebar on mobile
- **Focus Restoration**: Returns focus appropriately after actions
- **Visible Focus**: Clear focus indicators

## Responsive Breakpoints

| Screen Size | Behavior |
|-------------|----------|
| Mobile (< 768px) | Overlay sidebar with backdrop |
| Tablet (768px - 1024px) | Auto-minimized by default |
| Desktop (> 1024px) | Full sidebar by default |

## Animation Details

### Transition Properties
- **Duration**: 300ms for width changes, 200ms for content
- **Easing**: `ease-in-out` for smooth transitions
- **Properties**: Width, padding, opacity, transform

### Performance Optimizations
- **CSS Transforms**: Hardware-accelerated animations
- **Will-change**: Optimized for transform properties
- **Reduced Motion**: Respects user's motion preferences

## Customization

### Navigation Configuration

Extend the navigation config to support minimized states:

\`\`\`tsx
// config/navigation-config.ts
export const NAVIGATION_CONFIG = {
  section: {
    title: "Section Title",
    shortTitle: "Short",           // Title for minimized state
    showInMinimized: true,         // Show in minimized state
    items: [
      {
        label: "Full Label",
        shortLabel: "Short",       // Label for minimized state
        priority: 10,              // Priority for minimized filtering
        // ... other props
      }
    ]
  }
}
\`\`\`

### Styling Customization

Override default styles using CSS classes:

\`\`\`css
/* Custom sidebar width */
.sidebar-custom {
  --sidebar-width-expanded: 280px;
  --sidebar-width-minimized: 72px;
}

/* Custom animation timing */
.sidebar-slow {
  transition-duration: 500ms;
}
\`\`\`

## Integration with Layout Systems

### With App Layout

\`\`\`tsx
import { AppLayout } from "@/components/layout/app-layout-optimized"

function App() {
  return (
    <AppLayout sidebarVariant="compact">
      {/* Your app content */}
    </AppLayout>
  )
}
\`\`\`

### Manual Integration

\`\`\`tsx
function CustomLayout() {
  const [sidebarState, setSidebarState] = useState({ isMinimized: false })

  return (
    <div className="flex h-screen">
      <CollapsibleSidebar onStateChange={setSidebarState} />
      <main 
        className={cn(
          "flex-1 transition-all duration-300",
          sidebarState.isMinimized ? "ml-16" : "ml-64"
        )}
      >
        {/* Content adjusts to sidebar state */}
      </main>
    </div>
  )
}
\`\`\`

## Best Practices

### Performance
- Use `onStateChange` callback sparingly to avoid unnecessary re-renders
- Implement proper memoization for content that depends on sidebar state
- Consider using CSS-only animations where possible

### UX Guidelines
- Always provide visual feedback for state changes
- Ensure touch targets are at least 44px on mobile
- Test with keyboard-only navigation
- Verify screen reader announcements

### Accessibility
- Always provide meaningful `aria-label` attributes
- Test with multiple screen readers
- Ensure sufficient color contrast in all states
- Support high contrast mode

## Troubleshooting

### Common Issues

**Sidebar not persisting state**
- Check if `localStorage` is available
- Verify the storage key isn't conflicting
- Ensure the hook is properly initialized

**Animations not smooth**
- Check for conflicting CSS transitions
- Verify hardware acceleration is enabled
- Test on lower-end devices

**Mobile overlay not working**
- Ensure proper z-index stacking
- Check for conflicting fixed positioning
- Verify touch event handling

### Debug Mode

Enable debug logging:

\`\`\`tsx
<CollapsibleSidebar 
  onStateChange={(state) => {
    console.log('Sidebar state changed:', state)
  }}
/>
\`\`\`

## Migration Guide

### From UnifiedSidebar

Replace existing `UnifiedSidebar` usage:

\`\`\`tsx
// Before
<UnifiedSidebar itemVariant="compact" />

// After
<CollapsibleSidebar itemVariant="compact" />
\`\`\`

### Configuration Updates

Update navigation configuration to support new features:

\`\`\`tsx
// Add shortLabel and priority to navigation items
// Add shortTitle and showInMinimized to sections
\`\`\`

The `CollapsibleSidebar` is fully backward compatible with existing `UnifiedSidebar` props while adding new functionality.
