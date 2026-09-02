const JobMatchingService = require('../src/services/matching/jobMatchingService');

describe('JobMatchingService Unit Tests', () => {
  test('calculateMatchScore calculates skills (60%), location (20%), category (20%) accurately', () => {
    const client = {
      location: 'Makindye, Kampala',
      preferred_job_category: 'Logistics & Retail'
    };
    const clientSkills = [
      { skill_id: 'skl-04', name: 'Customer Service' },
      { skill_id: 'skl-05', name: 'Stock Handling & Inventory' }
    ];

    const job = {
      location: 'Industrial Area, 7th Street, Kampala',
      preferred_job_category: 'Logistics & Retail'
    };
    const jobSkills = [
      { skill_id: 'skl-04', name: 'Customer Service' },
      { skill_id: 'skl-05', name: 'Stock Handling & Inventory' }
    ];

    const result = JobMatchingService.calculateMatchScore(client, clientSkills, job, jobSkills);

    expect(result.matchScore).toBe(100);
    expect(result.breakdown.skillsScore).toBe(60);
    expect(result.breakdown.locationScore).toBe(20);
    expect(result.breakdown.categoryScore).toBe(20);
    expect(result.breakdown.matchedSkills.length).toBe(2);
  });

  test('calculateMatchScore handles partial matches gracefully', () => {
    const client = {
      location: 'Entebbe',
      preferred_job_category: 'Hospitality & Catering'
    };
    const clientSkills = [
      { skill_id: 'skl-01', name: 'Cleaning & Sanitation' }
    ];

    const job = {
      location: 'Mukono',
      preferred_job_category: 'Agriculture'
    };
    const jobSkills = [
      { skill_id: 'skl-03', name: 'Agriculture & Farming' },
      { skill_id: 'skl-01', name: 'Cleaning & Sanitation' }
    ];

    const result = JobMatchingService.calculateMatchScore(client, clientSkills, job, jobSkills);

    expect(result.matchScore).toBeLessThan(60);
    expect(result.breakdown.matchedSkills).toContain('Cleaning & Sanitation');
    expect(result.breakdown.missingSkills).toContain('Agriculture & Farming');
  });
});
