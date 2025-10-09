import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class PerformanceInterceptor implements NestInterceptor {
  private readonly logger = new Logger(PerformanceInterceptor.name);
  private metrics = new Map<string, { count: number; totalTime: number; errors: number }>();

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const { method, url } = request;

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        const statusCode = response.statusCode;
        
        // Add performance headers only if headers haven't been sent yet
        try {
          if (!response.headersSent) {
            response.set('X-Response-Time', `${duration}ms`);
          }
        } catch (error) {
          // Silently ignore header setting errors
        }
        
        // Track metrics
        this.trackMetrics(method, url, duration, statusCode);
        
        // Enhanced logging
        if (duration > 2000) {
          this.logger.error(`CRITICAL SLOW: ${method} ${url} - ${duration}ms - ${statusCode}`);
        } else if (duration > 1000) {
          this.logger.warn(`SLOW: ${method} ${url} - ${duration}ms - ${statusCode}`);
        }
      })
    );
  }

  private trackMetrics(method: string, url: string, duration: number, statusCode: number): void {
    const endpoint = `${method}:${url.split('?')[0]}`;
    const existing = this.metrics.get(endpoint) || { count: 0, totalTime: 0, errors: 0 };
    
    existing.count++;
    existing.totalTime += duration;
    if (statusCode >= 400) existing.errors++;
    
    this.metrics.set(endpoint, existing);
    
    // Log summary every 100 requests
    if (existing.count % 100 === 0) {
      const avgTime = Math.round(existing.totalTime / existing.count);
      const errorRate = Math.round((existing.errors / existing.count) * 100);
      this.logger.log(`${endpoint}: ${existing.count} requests, ${avgTime}ms avg, ${errorRate}% errors`);
    }
  }
}