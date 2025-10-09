import { Injectable, Logger } from '@nestjs/common';

interface PerformanceMetric {
  endpoint: string;
  method: string;
  avgResponseTime: number;
  requestCount: number;
  errorCount: number;
  lastUpdated: Date;
}

@Injectable()
export class PerformanceService {
  private readonly logger = new Logger(PerformanceService.name);
  private metrics = new Map<string, PerformanceMetric>();
  private readonly MAX_METRICS = 1000;

  trackRequest(method: string, url: string, duration: number, statusCode: number): void {
    const endpoint = `${method}:${url.split('?')[0]}`;
    const existing = this.metrics.get(endpoint);

    if (existing) {
      // Update existing metric
      existing.avgResponseTime = (existing.avgResponseTime * existing.requestCount + duration) / (existing.requestCount + 1);
      existing.requestCount++;
      if (statusCode >= 400) {
        existing.errorCount++;
      }
      existing.lastUpdated = new Date();
    } else {
      // Create new metric
      this.metrics.set(endpoint, {
        endpoint,
        method,
        avgResponseTime: duration,
        requestCount: 1,
        errorCount: statusCode >= 400 ? 1 : 0,
        lastUpdated: new Date(),
      });
    }

    // Clean old metrics
    if (this.metrics.size > this.MAX_METRICS) {
      this.cleanOldMetrics();
    }

    // Log slow requests
    if (duration > 2000) {
      this.logger.error(`CRITICAL SLOW: ${endpoint} - ${duration}ms - ${statusCode}`);
    } else if (duration > 1000) {
      this.logger.warn(`SLOW: ${endpoint} - ${duration}ms - ${statusCode}`);
    }
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values())
      .sort((a, b) => b.avgResponseTime - a.avgResponseTime);
  }

  getSlowestEndpoints(limit = 10): PerformanceMetric[] {
    return this.getMetrics().slice(0, limit);
  }

  getErrorProneEndpoints(limit = 10): PerformanceMetric[] {
    return Array.from(this.metrics.values())
      .filter(m => m.errorCount > 0)
      .sort((a, b) => (b.errorCount / b.requestCount) - (a.errorCount / a.requestCount))
      .slice(0, limit);
  }

  private cleanOldMetrics(): void {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago
    
    for (const [key, metric] of this.metrics.entries()) {
      if (metric.lastUpdated < cutoff) {
        this.metrics.delete(key);
      }
    }
  }

  // Generate performance report
  generateReport(): {
    totalEndpoints: number;
    slowEndpoints: PerformanceMetric[];
    errorProneEndpoints: PerformanceMetric[];
    averageResponseTime: number;
    totalRequests: number;
    totalErrors: number;
  } {
    const metrics = this.getMetrics();
    const totalRequests = metrics.reduce((sum, m) => sum + m.requestCount, 0);
    const totalErrors = metrics.reduce((sum, m) => sum + m.errorCount, 0);
    const avgResponseTime = metrics.reduce((sum, m) => sum + (m.avgResponseTime * m.requestCount), 0) / totalRequests;

    return {
      totalEndpoints: metrics.length,
      slowEndpoints: this.getSlowestEndpoints(5),
      errorProneEndpoints: this.getErrorProneEndpoints(5),
      averageResponseTime: Math.round(avgResponseTime),
      totalRequests,
      totalErrors,
    };
  }
}