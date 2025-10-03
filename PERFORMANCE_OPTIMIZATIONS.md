# Performance Optimization Plan

## Frontend Optimizations

### 1. Reduce Axios Timeout
```javascript
// axiosInstanse.js
timeout: 10000, // Reduce from 50s to 10s
```

### 2. Implement Request Caching
```javascript
// Add request interceptor for caching
const cache = new Map();
axiosInstance.interceptors.request.use((config) => {
  if (config.method === 'get') {
    const cacheKey = `${config.url}${JSON.stringify(config.params)}`;
    const cached = cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 30000) { // 30s cache
      return Promise.resolve(cached.data);
    }
  }
  return config;
});
```

### 3. Optimize Auth Context
```javascript
// Reduce useEffect dependencies and add debouncing
const debouncedAuthCheck = useCallback(
  debounce(checkAuth, 300),
  [isAuthenticated, auth0User?.sub]
);
```

### 4. Lazy Load Components
```javascript
// Implement React.lazy for heavy components
const Moderation = lazy(() => import('./pages/Dashboard/Moderation'));
```

## Backend Optimizations

### 1. Add Database Indexes
```sql
-- Add indexes for common queries
CREATE INDEX idx_reviews_business_status ON reviews(business_id, status);
CREATE INDEX idx_reviews_published_at ON reviews(published_at DESC);
CREATE INDEX idx_media_assets_review_id ON media_assets(review_id);
```

### 2. Implement Query Optimization
```typescript
// Use select specific fields instead of full entities
const reviews = await this.reviewRepo
  .createQueryBuilder('r')
  .select(['r.id', 'r.type', 'r.title', 'r.rating', 'r.reviewerName'])
  .leftJoin('r.mediaAssets', 'm')
  .addSelect(['m.id', 'm.s3Key', 'm.assetType'])
  .where('r.businessId = :businessId', { businessId })
  .getMany();
```

### 3. Add Response Caching
```typescript
// Add caching decorator
@CacheKey('business-profile')
@CacheTTL(300) // 5 minutes
async getPublicProfileWithReviews(slug: string) {
  // existing logic
}
```

### 4. Async S3 Operations
```typescript
// Move S3 operations to background jobs
async createBusiness() {
  // Create business first
  const business = await this.businessRepo.save(businessData);
  
  // Queue logo upload as background job
  if (file) {
    await this.queueService.add('upload-logo', {
      businessId: business.id,
      file: file.buffer
    });
  }
  
  return business;
}
```

### 5. Remove Console Logs in Production
```typescript
// billing.service.ts - Remove all console.log statements
// Use proper logging with levels
this.logger.debug('Storage Info:', storageInfo);
```

## Database Schema Optimizations

### 1. Add Composite Indexes
```sql
CREATE INDEX idx_reviews_composite ON reviews(business_id, status, published_at DESC);
CREATE INDEX idx_business_users_composite ON business_users(user_id, is_default);
```

### 2. Optimize Media Assets Table
```sql
-- Add index for media asset queries
CREATE INDEX idx_media_assets_composite ON media_assets(review_id, asset_type);
```

## API Response Optimization

### 1. Implement Pagination
```typescript
// Add pagination to all list endpoints
async listReviews(page = 1, limit = 25) {
  const offset = (page - 1) * limit;
  return this.reviewRepo.find({
    skip: offset,
    take: limit,
    order: { submittedAt: 'DESC' }
  });
}
```

### 2. Use DTOs for Response Shaping
```typescript
// Create specific DTOs to limit response size
export class ReviewSummaryDto {
  id: string;
  type: string;
  title: string;
  rating: number;
  reviewerName: string;
  submittedAt: Date;
}
```

## Monitoring and Metrics

### 1. Add Performance Monitoring
```typescript
// Add timing interceptors
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 1000) { // Log slow requests
      logger.warn(`Slow request: ${req.method} ${req.url} - ${duration}ms`);
    }
  });
  next();
});
```

### 2. Database Query Monitoring
```typescript
// Log slow queries
@Entity()
export class QueryLog {
  @Column()
  query: string;
  
  @Column()
  duration: number;
  
  @Column()
  timestamp: Date;
}
```