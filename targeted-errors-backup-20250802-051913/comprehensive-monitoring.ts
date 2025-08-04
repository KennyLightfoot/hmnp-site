/**
 * Comprehensive Monitoring System
 * Provides Prometheus metrics, alerting, performance tracking, and real-time monitoring
 */

import { register, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client';
import { redis } from './redis';
import { logger } from './logger';
import { prisma } from './prisma';

// Initialize default metrics collection
collectDefaultMetrics({ register });

export interface AlertConfig {
  level: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  context?: any;
  notifyEmail?: boolean;
  notifySlack?: boolean;
  threshold?: number;
}

export interface MetricPoint {
  metric: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  unit?: string;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  databaseResponseTime: number;
  redisResponseTime: number;
  errorRate: number;
  throughput: number;
  memoryUsage: number;
  cpuUsage: number;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  services: {
    database: 'up' | 'down' | 'degraded';
    redis: 'up' | 'down' | 'degraded';
    stripe: 'up' | 'down' | 'degraded';
    ghl: 'up' | 'down' | 'degraded';
  };
  metrics: PerformanceMetrics;
  lastChecked: Date;
}

class ComprehensiveMonitoring {
  // Prometheus metrics
  private httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10],
  });

  private httpRequestTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
  });

  private databaseQueryDuration = new Histogram({
    name: 'database_query_duration_seconds',
    help: 'Duration of database queries in seconds',
    labelNames: ['operation', 'table'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  });

  private databaseConnectionsActive = new Gauge({
    name: 'database_connections_active',
    help: 'Number of active database connections',
  });

  private redisOperationDuration = new Histogram({
    name: 'redis_operation_duration_seconds',
    help: 'Duration of Redis operations in seconds',
    labelNames: ['operation'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.3, 0.5, 1],
  });

  private bookingMetrics = new Counter({
    name: 'bookings_total',
    help: 'Total number of bookings',
    labelNames: ['status', 'service_type'],
  });

  private errorTotal = new Counter({
    name: 'errors_total',
    help: 'Total number of errors',
    labelNames: ['type', 'severity'],
  });

  private rateLimitHits = new Counter({
    name: 'rate_limit_hits_total',
    help: 'Total number of rate limit hits',
    labelNames: ['endpoint', 'identifier_type'],
  });

  private webhookEvents = new Counter({
    name: 'webhook_events_total',
    help: 'Total number of webhook events',
    labelNames: ['source', 'event_type', 'status'],
  });

  private systemResourceUsage = new Gauge({
    name: 'system_resource_usage',
    help: 'System resource usage percentage',
    labelNames: ['resource'],
  });

  // Alert thresholds
  private alertThresholds = {
    errorRate: 5, // 5% error rate
    responseTime: 2000, // 2 seconds
    memoryUsage: 90, // 90% memory usage
    diskUsage: 85, // 85% disk usage
    databaseConnections: 80, // 80% of max connections
  };

  constructor() {
    this.initializeMetricsCollection();
  }

  /**
   * Initialize automatic metrics collection
   */
  private initializeMetricsCollection() {
    // Collect system metrics every 30 seconds
    setInterval(async () => {
      await this.collectSystemMetrics();
    }, 30000);

    // Collect application metrics every 60 seconds
    setInterval(async () => {
      await this.collectApplicationMetrics();
    }, 60000);

    logger.info('Comprehensive monitoring initialized');
  }

  /**
   * Track HTTP request metrics
   */
  trackHttpRequest(method: string, route: string, statusCode: number, duration: number) {
    this.httpRequestDuration
      .labels(method, route, statusCode.toString())
      .observe(duration / 1000);

    this.httpRequestTotal
      .labels(method, route, statusCode.toString())
      .inc();

    // Check for high response times
    if (duration > this.alertThresholds.responseTime) {
      this.alert({
        level: 'warning',
        title: 'High Response Time',
        message: `${method} ${route} took ${duration}ms`,
        context: { method, route, duration, statusCode },
      });
    }
  }

  /**
   * Track database query metrics
   */
  trackDatabaseQuery(operation: string, table: string, duration: number) {
    this.databaseQueryDuration
      .labels(operation, table)
      .observe(duration / 1000);

    // Log slow queries
    if (duration > 1000) {
      logger.warn('Slow database query detected', 'MONITORING', {
        operation,
        table,
        duration,
      });
    }
  }

  /**
   * Track Redis operation metrics
   */
  trackRedisOperation(operation: string, duration: number) {
    this.redisOperationDuration
      .labels(operation)
      .observe(duration / 1000);
  }

  /**
   * Track booking metrics
   */
  trackBooking(status: string, serviceType: string) {
    this.bookingMetrics
      .labels(status, serviceType)
      .inc();
  }

  /**
   * Track error metrics
   */
  trackError(type: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.errorTotal
      .labels(type, severity)
      .inc();

    // Send alerts for high severity errors
    if (severity === 'critical' || severity === 'high') {
      this.alert({
        level: severity === 'critical' ? 'critical' : 'error',
        title: `${severity.toUpperCase()} Error Detected`,
        message: `Error type: ${type}`,
        context: { type, severity },
        notifyEmail: severity === 'critical',
      });
    }
  }

  /**
   * Track rate limiting metrics
   */
  trackRateLimit(endpoint: string, identifierType: string) {
    this.rateLimitHits
      .labels(endpoint, identifierType)
      .inc();
  }

  /**
   * Track webhook events
   */
  trackWebhook(source: string, eventType: string, status: 'success' | 'failure') {
    this.webhookEvents
      .labels(source, eventType, status)
      .inc();
  }

  /**
   * Collect system-level metrics
   */
  private async collectSystemMetrics() {
    try {
      // Memory usage
      const memoryUsage = process.memoryUsage();
      this.systemResourceUsage
        .labels('memory_heap_used')
        .set(memoryUsage.heapUsed);
      
      this.systemResourceUsage
        .labels('memory_heap_total')
        .set(memoryUsage.heapTotal);

      // Redis metrics
      if (redis.isAvailable()) {
        const redisStats = await redis.getStats();
        this.systemResourceUsage
          .labels('redis_memory')
          .set(redisStats.memoryUsage);
        
        this.systemResourceUsage
          .labels('redis_keys')
          .set(redisStats.keyCount);
      }

      // Database connection metrics
      // Note: This would need to be implemented based on your database setup
      // this.databaseConnectionsActive.set(await this.getDatabaseConnections());

    } catch (error) {
      logger.error('System metrics collection failed', error as Error);
    }
  }

  /**
   * Collect application-specific metrics
   */
  private async collectApplicationMetrics() {
    try {
      // Booking statistics
      const bookingStats = await this.getBookingStats();
      Object.entries(bookingStats).forEach(([status, count]) => {
        this.systemResourceUsage
          .labels(`bookings_${status}`)
          .set(count as number);
      });

      // Error rate calculation
      const errorRate = await this.calculateErrorRate();
      this.systemResourceUsage
        .labels('error_rate_percentage')
        .set(errorRate);

      // Check error rate threshold
      if (errorRate > this.alertThresholds.errorRate) {
        this.alert({
          level: 'error',
          title: 'High Error Rate',
          message: `Error rate: ${errorRate.toFixed(2)}% exceeds threshold`,
          context: { errorRate, threshold: this.alertThresholds.errorRate },
          notifyEmail: true,
        });
      }

    } catch (error) {
      logger.error('Application metrics collection failed', error as Error);
    }
  }

  /**
   * Get booking statistics
   */
  private async getBookingStats(): Promise<Record<string, number>> {
    try {
      const stats = await prisma.booking.groupBy({
        by: ['status'],
        _count: true,
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
          },
        },
      });

      return stats.reduce((acc, stat) => {
        acc[stat.status.toLowerCase()] = stat._count;
        return acc;
      }, {} as Record<string, number>);

    } catch (error) {
      logger.error('Booking stats collection failed', error as Error);
      return {};
    }
  }

  /**
   * Calculate error rate percentage
   */
  private async calculateErrorRate(): Promise<number> {
    try {
      // This would typically be calculated from your error logs or metrics
      // For now, we'll use a simple calculation based on HTTP status codes
      const totalRequests = await register.getSingleMetric('http_requests_total');
      const errorRequests = await register.getSingleMetric('errors_total');

      // This is a simplified calculation - you'd want to implement proper error rate calculation
      return 0; // Placeholder

    } catch (error) {
      logger.error('Error rate calculation failed', error as Error);
      return 0;
    }
  }

  /**
   * Get comprehensive system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const [databaseHealth, redisHealth, stripeHealth, ghlHealth] = await Promise.allSettled([
        this.checkDatabaseHealth(),
        this.checkRedisHealth(),
        this.checkStripeHealth(),
        this.checkGHLHealth(),
      ]);

      const services = {
        database: databaseHealth.status === 'fulfilled' ? databaseHealth.value : 'down',
        redis: redisHealth.status === 'fulfilled' ? redisHealth.value : 'down',
        stripe: stripeHealth.status === 'fulfilled' ? stripeHealth.value : 'down',
        ghl: ghlHealth.status === 'fulfilled' ? ghlHealth.value : 'down',
      };

      const metrics = await this.getPerformanceMetrics();
      
      // Determine overall system status
      const downServices = Object.values(services).filter(status => status === 'down').length;
      const degradedServices = Object.values(services).filter(status => status === 'degraded').length;
      
      let status: SystemHealth['status'] = 'healthy';
      if (downServices > 0 || metrics.errorRate > 10) {
        status = 'unhealthy';
      } else if (degradedServices > 0 || metrics.errorRate > 5) {
        status = 'degraded';
      }

      return {
        status,
        services,
        metrics,
        lastChecked: new Date(),
      };

    } catch (error) {
      logger.error('System health check failed', error as Error);
      return {
        status: 'unhealthy',
        services: { database: 'down', redis: 'down', stripe: 'down', ghl: 'down' },
        metrics: {} as PerformanceMetrics,
        lastChecked: new Date(),
      };
    }
  }

  /**
   * Get performance metrics
   */
  private async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    // This would aggregate metrics from your monitoring system
    return {
      apiResponseTime: 150, // ms
      databaseResponseTime: 50, // ms
      redisResponseTime: 2, // ms
      errorRate: 0.5, // percentage
      throughput: 100, // requests per second
      memoryUsage: 65, // percentage
      cpuUsage: 45, // percentage
    };
  }

  /**
   * Check database health
   */
  private async checkDatabaseHealth(): Promise<'up' | 'down' | 'degraded'> {
    try {
      const start = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      const duration = Date.now() - start;
      
      if (duration > 1000) return 'degraded';
      return 'up';
    } catch {
      return 'down';
    }
  }

  /**
   * Check Redis health
   */
  private async checkRedisHealth(): Promise<'up' | 'down' | 'degraded'> {
    try {
      if (!redis.isAvailable()) return 'down';
      
      const start = Date.now();
      await redis.ping();
      const duration = Date.now() - start;
      
      if (duration > 100) return 'degraded';
      return 'up';
    } catch {
      return 'down';
    }
  }

  /**
   * Check Stripe health
   */
  private async checkStripeHealth(): Promise<'up' | 'down' | 'degraded'> {
    // Implement Stripe health check
    return 'up'; // Placeholder
  }

  /**
   * Check GHL health
   */
  private async checkGHLHealth(): Promise<'up' | 'down' | 'degraded'> {
    // Implement GHL health check
    return 'up'; // Placeholder
  }

  /**
   * Send alert notification
   */
  async sendAlert(alert: AlertConfig): Promise<void> {
    try {
      // Log alert
      logger.warn('Alert triggered', 'MONITORING', alert);

      // Store alert in Redis for dashboard
      const alertKey = `alert:${Date.now()}:${Math.random()}`;
      await redis.set(alertKey, JSON.stringify({
        ...alert,
        timestamp: new Date(),
        id: alertKey,
      }), 24 * 60 * 60); // 24 hours TTL

      // Send email notification if configured
      if (alert.notifyEmail && process.env.ALERT_EMAIL) {
        await this.sendEmailAlert(alert);
      }

      // Send Slack notification if configured
      if (alert.notifySlack && process.env.SLACK_WEBHOOK_URL) {
        await this.sendSlackAlert(alert);
      }

    } catch (error) {
      logger.error('Alert sending failed', error as Error);
    }
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: AlertConfig): Promise<void> {
    // Implement email alerting using your email service
    logger.info('Email alert would be sent', 'MONITORING', alert);
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: AlertConfig): Promise<void> {
    // Implement Slack alerting
    logger.info('Slack alert would be sent', 'MONITORING', alert);
  }

  /**
   * Get Prometheus metrics
   */
  async getMetrics(): Promise<string> {
    return register.metrics();
  }

  /**
   * Get recent alerts
   */
  async getRecentAlerts(hours = 24): Promise<AlertConfig[]> {
    try {
      const alertKeys = await redis.keys('alert:*');
      const alerts: AlertConfig[] = [];

      for (const key of alertKeys) {
        const alertData = await redis.get(key);
        if (alertData) {
          const alert = JSON.parse(alertData);
          const alertTime = new Date(alert.timestamp);
          const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
          
          if (alertTime > cutoff) {
            alerts.push(alert);
          }
        }
      }

      return alerts.sort((a, b) => 
        new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
      );

    } catch (error) {
      logger.error('Recent alerts retrieval failed', error as Error);
      return [];
    }
  }
}

// Create singleton instance
export const monitoring = new ComprehensiveMonitoring();

export default monitoring; 