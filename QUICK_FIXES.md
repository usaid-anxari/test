# Quick Fixes for API Delays

## 🚨 Immediate Actions (Can implement now)

### 1. Frontend - Reduce Axios Timeout
```javascript
// frontend/src/service/axiosInstanse.js
const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 10000, // Change from 50000 to 10000 (10 seconds)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});
```

### 2. Backend - Remove Console.log in Production
```typescript
// backend/src/billing/billing.service.ts
// Comment out or remove all console.log statements:
// console.log('Billing Service - Storage Info:', storageInfo);
// console.log('Billing Service - Bytes Used:', storageInfo.bytesUsed);
// etc.
```

### 3. Frontend - Optimize Moderation Page Loading
```javascript
// frontend/src/pages/Dashboard/Moderation.js
// Add loading states and error boundaries
const [businessLoading, setBusinessLoading] = useState(true);
const [reviewsLoading, setReviewsLoading] = useState(true);

// Separate business and reviews loading
useEffect(() => {
  const fetchBusinessInfo = async () => {
    try {
      setBusinessLoading(true);
      const businessResponse = await axiosInstance.get(API_PATHS.BUSINESSES?.GET_PRIVATE_PROFILE);
      setBusiness(businessResponse.data?.business);
    } finally {
      setBusinessLoading(false);
    }
  };
  
  const fetchReviews = async () => {
    try {
      setReviewsLoading(true);
      // Fetch reviews separately if needed
      setReviews(businessResponse.data?.reviews || []);
    } finally {
      setReviewsLoading(false);
    }
  };
  
  if (isAuthenticated) {
    fetchBusinessInfo();
    fetchReviews();
  }
}, [isAuthenticated]);
```

### 4. Backend - Add Database Indexes
```sql
-- Run these SQL commands on your database
CREATE INDEX IF NOT EXISTS idx_reviews_business_status ON reviews(business_id, status);
CREATE INDEX IF NOT EXISTS idx_reviews_published_at ON reviews(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_media_assets_review_id ON media_assets(review_id);
CREATE INDEX IF NOT EXISTS idx_business_users_default ON business_users(user_id, is_default);
```

### 5. Frontend - Add Request Deduplication
```javascript
// frontend/src/service/axiosInstanse.js
const pendingRequests = new Map();

axiosInstance.interceptors.request.use((config) => {
  const requestKey = `${config.method}:${config.url}`;
  
  if (pendingRequests.has(requestKey)) {
    // Return existing promise instead of making new request
    return pendingRequests.get(requestKey);
  }
  
  const requestPromise = axios(config);
  pendingRequests.set(requestKey, requestPromise);
  
  // Clean up after request completes
  requestPromise.finally(() => {
    pendingRequests.delete(requestKey);
  });
  
  return requestPromise;
});
```

## 🔧 Medium Priority (Next sprint)

### 1. Implement Response Caching
### 2. Optimize Database Queries
### 3. Add Background Job Processing
### 4. Implement Lazy Loading

## 📊 Monitoring Setup

### Add Performance Logging
```typescript
// backend/src/common/interceptors/performance.interceptor.ts
@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    
    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        if (duration > 1000) {
          console.warn(`Slow API: ${request.method} ${request.url} - ${duration}ms`);
        }
      })
    );
  }
}
```

## 🎯 Expected Results

After implementing these fixes:
- API response times should reduce by 40-60%
- Frontend loading states will be more responsive
- Database queries will be faster with proper indexes
- Duplicate requests will be eliminated
- Production logs will be cleaner