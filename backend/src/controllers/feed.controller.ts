import { Request, Response } from 'express';
import { prisma } from '../config/database';

// GET /api/public/feeds/indeed/:companySlug.xml - Indeed XML Aggregator Job Feed
export const getIndeedXmlFeed = async (req: Request, res: Response) => {
  try {
    const companySlug = req.params.companySlug as string;

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      include: {
        jobs: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      return res.status(404).send('Company career portal not found');
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host.replace(':5000', ':3000')}`;

    const jobsXml = company.jobs.map((job) => `
    <job>
      <title><![CDATA[${job.title}]]></title>
      <date><![CDATA[${job.createdAt.toISOString()}]]></date>
      <referencenumber><![CDATA[JOB-${job.jobCode}]]></referencenumber>
      <url><![CDATA[${baseUrl}/apply/${job.id}]]></url>
      <company><![CDATA[${company.name}]]></company>
      <city><![CDATA[${job.location || 'Remote'}]]></city>
      <country><![CDATA[US]]></country>
      <description><![CDATA[${job.description}\n\nRequirements:\n${job.requirements || 'N/A'}]]></description>
      <salary><![CDATA[${job.salary || 'Competitive'}]]></salary>
      <jobtype><![CDATA[${job.type}]]></jobtype>
    </job>`).join('\n');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<source>
  <publisher><![CDATA[${company.name}]]></publisher>
  <publisherurl><![CDATA[${company.website || `${baseUrl}/careers/${company.slug}`}]]></publisherurl>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${jobsXml}
</source>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    res.status(500).send(`XML Feed Error: ${error.message}`);
  }
};

// GET /api/public/jobs/:id/schema - Google for Jobs JSON-LD Schema
export const getJobGoogleSchema = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const job = await prisma.job.findFirst({
      where: { id, status: 'published' },
      include: { company: true },
    });

    if (!job) {
      return res.status(404).json({ success: false, error: 'Job opening not found.' });
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host.replace(':5000', ':3000')}`;

    const schema = {
      '@context': 'https://schema.org/',
      '@type': 'JobPosting',
      title: job.title,
      description: `<p>${job.description.replace(/\n/g, '<br/>')}</p>`,
      identifier: {
        '@type': 'PropertyValue',
        name: job.company.name,
        value: `JOB-${job.jobCode}`,
      },
      datePosted: job.createdAt.toISOString().split('T')[0],
      validThrough: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      employmentType: job.type.toUpperCase().replace('-', '_'),
      hiringOrganization: {
        '@type': 'Organization',
        name: job.company.name,
        sameAs: job.company.website || `${baseUrl}/careers/${job.company.slug}`,
      },
      jobLocation: {
        '@type': 'Place',
        address: {
          '@type': 'PostalAddress',
          addressLocality: job.location || 'Remote',
        },
      },
      ...(job.salary ? {
        baseSalary: {
          '@type': 'MonetaryAmount',
          currency: 'USD',
          value: {
            '@type': 'QuantitativeValue',
            value: job.salary,
            unitText: 'YEAR',
          },
        },
      } : {}),
      directApply: true,
      url: `${baseUrl}/apply/${job.id}`,
    };

    res.json({ success: true, data: schema });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// GET /api/public/feeds/ziprecruiter/:companySlug.xml - ZipRecruiter XML Aggregator Feed
export const getZipRecruiterXmlFeed = async (req: Request, res: Response) => {
  try {
    const companySlug = req.params.companySlug as string;

    const company = await prisma.company.findUnique({
      where: { slug: companySlug },
      include: {
        jobs: {
          where: { status: 'published' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      return res.status(404).send('Company career portal not found');
    }

    const host = req.get('host') || 'localhost:3000';
    const protocol = req.protocol || 'http';
    const baseUrl = `${protocol}://${host.replace(':5000', ':3000')}`;

    const jobsXml = company.jobs.map((job) => `
    <job>
      <title><![CDATA[${job.title}]]></title>
      <reference_number><![CDATA[JOB-${job.jobCode}]]></reference_number>
      <url><![CDATA[${baseUrl}/apply/${job.id}?utm_source=ziprecruiter]]></url>
      <company><![CDATA[${company.name}]]></company>
      <city><![CDATA[${job.location || 'Remote'}]]></city>
      <state><![CDATA[US]]></state>
      <country><![CDATA[US]]></country>
      <postal_code><![CDATA[10001]]></postal_code>
      <description><![CDATA[${job.description}\n\nKey Requirements:\n${job.requirements || 'N/A'}]]></description>
      <compensation><![CDATA[${job.salary || 'Competitive'}]]></compensation>
      <job_type><![CDATA[${job.type}]]></job_type>
      <date><![CDATA[${job.createdAt.toISOString()}]]></date>
    </job>`).join('\n');

    const xml = `<?xml version="1.0" encoding="utf-8"?>
<jobs>
  <publisher>${company.name} Recruiting</publisher>
  <publisher_url>${company.website || `${baseUrl}/careers/${company.slug}`}</publisher_url>
  <last_build_date>${new Date().toUTCString()}</last_build_date>
${jobsXml}
</jobs>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error: any) {
    res.status(500).send(`ZipRecruiter XML Feed Error: ${error.message}`);
  }
};

