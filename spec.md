# Lens & Laughs

## Current State
Photo upload fails with "Expected v3 response body" when the IC returns a 202 Accepted instead of a v3 synchronous response.

## Requested Changes (Diff)

### Add
- Slow-path fallback in getCertificate using pollForResponse + readState.

### Modify
- StorageClient.ts getCertificate: handle 202/null responses via polling.

### Remove
- Hard throw on non-v3 response body.

## Implementation Plan
1. Import pollForResponse and Principal.
2. Fast path: v3 response body (unchanged).
3. Slow path: pollForResponse to wait, then readState for raw cert bytes.
