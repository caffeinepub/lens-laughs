# Lens & Laughs - Portfolio Manager Page

## Current State
The app has a Home page and an Admin page at /admin with 5 tabs including a Portfolio tab. The backend already supports portfolio CRUD (getPortfolioItems, addPortfolioItem, deletePortfolioItem, updatePortfolioCaption). The blob-storage component is already installed.

## Requested Changes (Diff)

### Add
- A new dedicated page at `/portfolio-manager` for managing portfolio photos
- Drag-and-drop upload zone using the blob-storage StorageClient for uploading photos
- Visual masonry/grid of all current portfolio photos loaded from the backend
- Remove button on each photo in the grid
- Optional caption editing per photo
- No login/password required (open access, consistent with /admin)
- Route registered in App.tsx

### Modify
- App.tsx: add portfolioManagerRoute at /portfolio-manager

### Remove
- Nothing

## Implementation Plan
1. Create src/frontend/src/pages/PortfolioManager.tsx
   - Drag-and-drop zone (supports multiple files, shows preview on drop)
   - On drop/select: upload each file via StorageClient, then call addPortfolioItem with blobKey and filename as caption
   - Use admin password "lensandlaughs2024" for write operations
   - Grid of current portfolio items: load via getPortfolioItems, display using blob-storage URLs
   - Each photo card has a trash/remove button that calls deletePortfolioItem
   - Toast feedback for upload success/error and delete
2. Register /portfolio-manager route in App.tsx
