import { DataSource } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { BusinessUser } from '../business/entities/business-user.entity';
import { Review } from '../review/entities/review.entity';
import { MediaAsset } from '../review/entities/media-asset.entity';
import { GoogleConnection } from '../google/entities/google-connection.entity';
import { GoogleReview } from '../google/entities/google-review.entity';
import { Widget } from '../widgets/entities/widget.entity';
import { BillingAccount, BillingStatus, PricingTier } from '../billing/entities/billing-account.entity';
import { AnalyticsEvent, AnalyticsEventType } from '../analytics/entities/analytics-event.entity';
import { EmailLog, EmailType, EmailStatus } from '../email/entities/email-log.entity';
import { EmailPreference } from '../email/entities/email-preference.entity';

export async function seed(dataSource: DataSource) {
  console.log('🌱 Starting TrueTestify comprehensive seed...');

  // Get repositories
  const userRepo = dataSource.getRepository(User);
  const businessRepo = dataSource.getRepository(Business);
  const businessUserRepo = dataSource.getRepository(BusinessUser);
  const reviewRepo = dataSource.getRepository(Review);
  const mediaAssetRepo = dataSource.getRepository(MediaAsset);
  const googleConnectionRepo = dataSource.getRepository(GoogleConnection);
  const googleReviewRepo = dataSource.getRepository(GoogleReview);
  const widgetRepo = dataSource.getRepository(Widget);
  const billingAccountRepo = dataSource.getRepository(BillingAccount);
  const analyticsEventRepo = dataSource.getRepository(AnalyticsEvent);
  const emailLogRepo = dataSource.getRepository(EmailLog);
  const emailPreferenceRepo = dataSource.getRepository(EmailPreference);

  // 1. Create Users with Auth0 IDs
  console.log('👤 Creating users...');
  const users = [
    {
      auth0Id: 'auth0|truetestify_demo_123',
      email: 'demo@truetestify.com',
      name: 'TrueTestify Demo User',
      isActive: true,
    },
    {
      auth0Id: 'auth0|glambeauty_owner_456',
      email: 'owner@glambeauty.com',
      name: 'Sarah Johnson',
      isActive: true,
    },
    {
      auth0Id: 'auth0|citycuts_owner_789',
      email: 'owner@citycuts.com',
      name: 'Mike Chen',
      isActive: true,
    },
  ];

  const savedUsers: User[] = [];
  for (const userData of users) {
    let user = await userRepo.findOne({ where: { auth0Id: userData.auth0Id } });
    if (!user) {
      user = userRepo.create(userData);
      user = await userRepo.save(user);
    }
    savedUsers.push(user);
    console.log(`✅ User: ${user.name}`);
  }

  // 2. Create Businesses
  console.log('🏢 Creating businesses...');
  const businesses = [
    {
      slug: 'truetestify',
      name: 'TrueTestify Demo',
      primaryColor: '#1e3a8a',
      contactEmail: 'demo@truetestify.com',
      website: 'https://truetestify.com',
      settingsJson: { allowTextReviews: true, autoApproveReviews: false },
    },
    {
      slug: 'glambeauty',
      name: 'Glam Beauty Salon',
      primaryColor: '#ef7c00',
      contactEmail: 'contact@glambeauty.com',
      website: 'https://glambeauty.com',
      settingsJson: { allowTextReviews: true, autoApproveReviews: false },
    },
    {
      slug: 'citycuts',
      name: 'City Cuts Barbershop',
      primaryColor: '#3b82f6',
      contactEmail: 'contact@citycuts.com',
      website: 'https://citycuts.com',
      settingsJson: { allowTextReviews: true, autoApproveReviews: true },
    },
  ];

  const savedBusinesses: Business[] = [];
  for (const businessData of businesses) {
    let business = await businessRepo.findOne({ where: { slug: businessData.slug } });
    if (!business) {
      business = businessRepo.create(businessData);
      business = await businessRepo.save(business);
    }
    savedBusinesses.push(business);
    console.log(`✅ Business: ${business.name}`);
  }

  // 3. Create Business-User relationships
  console.log('🔗 Creating business-user relationships...');
  for (let i = 0; i < savedUsers.length; i++) {
    const existing = await businessUserRepo.findOne({
      where: { userId: savedUsers[i].id, businessId: savedBusinesses[i].id }
    });
    
    if (!existing) {
      await businessUserRepo.save({
        userId: savedUsers[i].id,
        businessId: savedBusinesses[i].id,
        role: 'owner',
        isDefault: true,
      });
      console.log(`✅ Linked ${savedUsers[i].name} to ${savedBusinesses[i].name}`);
    }
  }

  // 4. Create Reviews
  console.log('⭐ Creating reviews...');
  const reviews = [
    {
      businessId: savedBusinesses[0].id,
      type: 'text' as const,
      title: 'Amazing Platform!',
      bodyText: 'TrueTestify has transformed how we collect customer feedback.',
      rating: 5,
      reviewerName: 'Jennifer Smith',
      reviewerContactJson: { email: 'jennifer@example.com' },
      status: 'approved' as const,
      consentChecked: true,
      source: 'widget',
      submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      businessId: savedBusinesses[1].id,
      type: 'text' as const,
      title: 'Best Hair Salon Experience',
      bodyText: 'Sarah and her team are absolutely incredible!',
      rating: 5,
      reviewerName: 'Maria Rodriguez',
      reviewerContactJson: { email: 'maria@example.com' },
      status: 'approved' as const,
      consentChecked: true,
      source: 'direct',
      submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    },
    {
      businessId: savedBusinesses[2].id,
      type: 'text' as const,
      title: 'Perfect Haircut Every Time',
      bodyText: 'Mike always knows exactly what I want.',
      rating: 5,
      reviewerName: 'Alex Thompson',
      reviewerContactJson: { email: 'alex@example.com' },
      status: 'pending' as const,
      consentChecked: true,
      source: 'widget',
      submittedAt: new Date(),
    },
  ];

  const savedReviews: Review[] = [];
  for (const reviewData of reviews) {
    const review = reviewRepo.create(reviewData);
    const savedReview = await reviewRepo.save(review);
    savedReviews.push(savedReview);
    console.log(`✅ Review: "${reviewData.title}"`);
  }

  // 5. Create Google Integration
  console.log('🔗 Creating Google integration...');
  const googleConnection = await googleConnectionRepo.save({
    businessId: savedBusinesses[1].id,
    googleAccountId: 'google-account-123',
    locationId: 'location-456',
    accessToken: 'simulated-access-token',
    refreshToken: 'simulated-refresh-token',
    status: 'connected',
    connectedAt: new Date(),
  });

  await googleReviewRepo.save({
    businessId: savedBusinesses[1].id,
    reviewerName: 'Lisa Chen',
    rating: 5,
    text: 'Excellent service and beautiful results.',
    reviewedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    sourceJson: { googleReviewId: 'google-review-1', verified: true },
  });
  console.log('✅ Google reviews imported');

  // 6. Create Widgets
  console.log('🎨 Creating widgets...');
  const widgets = [
    {
      businessId: savedBusinesses[0].id,
      style: 'grid' as const,
      name: 'Homepage Grid Widget',
      settingsJson: { columns: 3, showRating: true, maxReviews: 6 },
      isActive: true,
    },
    {
      businessId: savedBusinesses[1].id,
      style: 'carousel' as const,
      name: 'Salon Carousel',
      settingsJson: { autoplay: true, showDots: true, maxReviews: 10 },
      isActive: true,
    },
  ];

  const savedWidgets: Widget[] = [];
  for (const widgetData of widgets) {
    const widget = widgetRepo.create(widgetData);
    const savedWidget = await widgetRepo.save(widget);
    savedWidgets.push(savedWidget);
    console.log(`✅ Widget: ${widgetData.name}`);
  }

  // 7. Create Billing Accounts
  console.log('💳 Creating billing accounts...');
  const billing1 = billingAccountRepo.create({
    businessId: savedBusinesses[0].id,
    billingStatus: BillingStatus.TRIALING,
    pricingTier: PricingTier.FREE,
    storageLimitGb: 1.0,
    monthlyPriceCents: 0,
    trialEndsAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
  });
  await billingAccountRepo.save(billing1);

  const billing2 = billingAccountRepo.create({
    businessId: savedBusinesses[1].id,
    billingStatus: BillingStatus.ACTIVE,
    pricingTier: PricingTier.STARTER,
    storageLimitGb: 10.0,
    monthlyPriceCents: 1900,
    currentPeriodStart: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    currentPeriodEnd: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
  });
  await billingAccountRepo.save(billing2);
  console.log('✅ Billing accounts created');

  // 8. Create Analytics Events
  console.log('📊 Creating analytics events...');
  const event1 = analyticsEventRepo.create({
    businessId: savedBusinesses[0].id,
    widgetId: savedWidgets[0].id,
    eventType: AnalyticsEventType.WIDGET_VIEW,
    eventData: { page: 'homepage' },
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    ipAddress: '192.168.1.100',
  });
  await analyticsEventRepo.save(event1);

  const event2 = analyticsEventRepo.create({
    businessId: savedBusinesses[1].id,
    eventType: AnalyticsEventType.REVIEW_SUBMISSION,
    eventData: { reviewType: 'text', rating: 5 },
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
    ipAddress: '192.168.1.101',
  });
  await analyticsEventRepo.save(event2);
  console.log('✅ Analytics events created');

  // 9. Create Email Preferences
  console.log('📧 Creating email preferences...');
  for (const user of savedUsers) {
    await emailPreferenceRepo.save({
      businessId: savedBusinesses[0].id,
      email: user.email,
      reviewNotifications: true,
      billingNotifications: true,
      marketingEmails: true,
      featureUpdates: true,
      unsubscribeToken: `token-${user.id}-${Date.now()}`,
    });
  }
  console.log('✅ Email preferences created');

  // 10. Create Email Logs
  console.log('📧 Creating email logs...');
  const emailLog = emailLogRepo.create({
    businessId: savedBusinesses[0].id,
    recipientEmail: savedUsers[0].email,
    recipientName: savedUsers[0].name,
    emailType: EmailType.WELCOME,
    subject: 'Welcome to TrueTestify!',
    templateData: { businessName: savedBusinesses[0].name },
    status: EmailStatus.SENT,
    sentAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
  });
  await emailLogRepo.save(emailLog);
  console.log('✅ Email logs created');

  console.log('\n🎉 Seed completed successfully!');
  console.log('\n📋 Created Data:');
  console.log(`   👤 ${savedUsers.length} users with Auth0 IDs`);
  console.log(`   🏢 ${savedBusinesses.length} businesses`);
  console.log(`   ⭐ ${savedReviews.length} reviews`);
  console.log(`   🎨 ${savedWidgets.length} widgets`);
  console.log(`   💳 2 billing accounts`);
  console.log(`   📊 2 analytics events`);
  console.log(`   📧 ${savedUsers.length} email preferences`);
  
  console.log('\n🔑 Test Auth0 Users:');
  savedUsers.forEach(user => {
    console.log(`   ${user.email} (Auth0: ${user.auth0Id})`);
  });
  
  console.log('\n🌐 Test Business URLs:');
  savedBusinesses.forEach(business => {
    console.log(`   /business/${business.slug} - ${business.name}`);
  });
  
  console.log('\n✅ All endpoints now have data and should work!');
}