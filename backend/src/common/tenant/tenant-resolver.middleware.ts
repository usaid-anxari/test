import { Injectable, NestMiddleware, NotFoundException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { BusinessService } from 'src/business/business.service';

@Injectable()
export class TenantResolverMiddleware implements NestMiddleware {
  constructor(private readonly businessService: BusinessService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const slug = req.params.slug || req.query.slug;
    if (!slug) return next(); // endpoints that don't need slug

    const biz = await this.businessService.findBySlug(String(slug));
    if (!biz) throw new NotFoundException('Business not found');
    // attach tenant to request
    (req as any).tenant = { businessId: biz.id, business: biz };
    next();
  }
}
