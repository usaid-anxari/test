import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Business } from '../business/entities/business.entity';

@Injectable()
export class ValidationService {
  constructor(
    @InjectRepository(Business)
    private businessRepo: Repository<Business>,
  ) {}

  async isSlugAvailable(slug: string): Promise<boolean> {
    const existing = await this.businessRepo.findOne({
      where: { slug }
    });
    return !existing;
  }

  async generateSlugSuggestions(name: string): Promise<string[]> {
    if (!name) return [];

    const baseSlug = name.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    const suggestions = [baseSlug];

    // Add variations
    const variations = [
      `${baseSlug}-inc`,
      `${baseSlug}-co`,
      `${baseSlug}-llc`,
      `${baseSlug}-group`,
      `${baseSlug}-solutions`,
      `${baseSlug}-services`,
      `${baseSlug}-company`,
      `${baseSlug}-biz`,
      `${baseSlug}-pro`,
      `${baseSlug}-official`
    ];

    // Add numbered variations
    for (let i = 1; i <= 5; i++) {
      variations.push(`${baseSlug}-${i}`);
      variations.push(`${baseSlug}${i}`);
    }

    suggestions.push(...variations);

    // Check availability for each suggestion
    const availableSuggestions: string[] = [];
    for (const suggestion of suggestions) {
      if (suggestion && suggestion.length >= 3) {
        const isAvailable = await this.isSlugAvailable(suggestion);
        if (isAvailable) {
          availableSuggestions.push(suggestion);
        }
      }
    }

    return availableSuggestions.slice(0, 10); // Return top 10 suggestions
  }
}