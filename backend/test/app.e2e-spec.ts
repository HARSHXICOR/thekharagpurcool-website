import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { AppModule } from './../src/app.module';
import { CmsController } from '../src/modules/cms/cms.controller';
import { CreateInquiryDto } from '../src/modules/inquiries/dto/create-inquiry.dto';
import { InquiriesController } from '../src/modules/inquiries/inquiries.controller';
import { MetaController } from '../src/modules/meta/meta.controller';
import { PrismaService } from '../src/prisma/prisma.service';

describe('API Architecture (integration)', () => {
  let cmsController: CmsController;
  let inquiriesController: InquiriesController;
  let metaController: MetaController;

  const mockPrisma: any = {
    service: {
      findMany: jest.fn().mockResolvedValue([
        { id: '1', slug: 'instagram-promotions', name: 'Instagram Promotions', isActive: true },
      ]),
      findUnique: jest.fn().mockResolvedValue({ id: 'service-123', slug: 'instagram-promotions' }),
    },
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    session: {
      create: jest.fn(),
    },
    refreshToken: {
      create: jest.fn(),
    },
    inquiry: {
      create: jest.fn().mockImplementation((args) =>
        Promise.resolve({ id: 'inquiry-123', status: 'new', ...args.data }),
      ),
      findFirst: jest.fn().mockResolvedValue(null),
    },
    instagramAccount: {
      upsert: jest.fn().mockResolvedValue({
        id: 'account-123',
        instagramUserId: '17841405331050302',
        username: 'cafemocha_kgp',
        displayName: 'Cafe Mocha Kharagpur',
        followersCount: 23500,
      }),
    },
    instagramToken: {
      create: jest.fn(),
    },
    instagramMedia: {
      upsert: jest.fn().mockResolvedValue({ id: 'media-123' }),
    },
    instagramMediaMetric: {
      upsert: jest.fn(),
    },
    instagramAudienceInsight: {
      upsert: jest.fn(),
    },
    $transaction: jest.fn().mockImplementation((cb) => cb(mockPrisma)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrisma)
      .compile();

    cmsController = moduleFixture.get(CmsController);
    inquiriesController = moduleFixture.get(InquiriesController);
    metaController = moduleFixture.get(MetaController);
  });

  describe('CMS / Services', () => {
    it('returns public services', async () => {
      const res = await cmsController.listServices();

      expect(res).toBeInstanceOf(Array);
      expect(res[0].slug).toBe('instagram-promotions');
    });
  });

  describe('Lead Funnel / Inquiries', () => {
    it('creates an inquiry with a valid DTO', async () => {
      const dto = plainToInstance(CreateInquiryDto, {
        name: 'Rahul Sen',
        email: 'rahul@kgpyouthfest.in',
        phone: '+919876543210',
        companyName: 'Kharagpur Youth Festival',
        serviceSlug: 'instagram-promotions',
        budgetBand: 'growth',
        source: 'contact_form',
      });

      const validationErrors = await validate(dto);
      expect(validationErrors).toHaveLength(0);

      const res = await inquiriesController.createInquiry(dto);

      expect(res.id).toBe('inquiry-123');
      expect(res.name).toBe(dto.name);
    });

    it('rejects an inquiry DTO when required fields are missing', async () => {
      const dto = plainToInstance(CreateInquiryDto, {
        name: 'Rahul Sen',
        email: 'rahul@kgpyouthfest.in',
        phone: '+919876543210',
        companyName: 'Kharagpur Youth Festival',
        serviceSlug: 'instagram-promotions',
      });

      const validationErrors = await validate(dto);
      const failingFields = validationErrors.map((error) => error.property);

      expect(failingFields).toEqual(expect.arrayContaining(['budgetBand', 'source']));
    });
  });

  describe('Meta OAuth Integrations', () => {
    it('connects an Instagram account from callback parameters', async () => {
      const state = Buffer.from(
        JSON.stringify({ orgId: 'org-123', userId: 'user-123' }),
      ).toString('base64');

      const res = await metaController.handleCallback('mock-code', state);

      expect(res.username).toBe('cafemocha_kgp');
      expect(res.followers).toBe(23500);
      expect(res.message).toContain('connected successfully');
    });
  });
});
