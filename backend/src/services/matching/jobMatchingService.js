const db = require('../../database/db');

class JobMatchingService {
  /**
   * Compute comprehensive match score between a client and a job
   * Formula: Skill Match (60%) + Location Match (20%) + Category Preference Match (20%)
   */
  static calculateMatchScore(client, clientSkills, job, jobSkills) {
    let score = 0;
    const matchBreakdown = {
      skillsScore: 0,
      locationScore: 0,
      categoryScore: 0,
      matchedSkills: [],
      missingSkills: []
    };

    // 1. Skill Match (Max 60 points)
    const clientSkillIds = new Set(clientSkills.map(s => s.skill_id || s.id));
    const requiredJobSkills = jobSkills.length > 0 ? jobSkills : [];

    if (requiredJobSkills.length === 0) {
      matchBreakdown.skillsScore = 50; // default baseline if no specific skills required
    } else {
      let matchedCount = 0;
      requiredJobSkills.forEach(js => {
        const skillId = js.skill_id || js.id;
        const skillName = js.name || 'Skill';
        if (clientSkillIds.has(skillId)) {
          matchedCount++;
          matchBreakdown.matchedSkills.push(skillName);
        } else {
          matchBreakdown.missingSkills.push(skillName);
        }
      });

      const skillRatio = matchedCount / requiredJobSkills.length;
      matchBreakdown.skillsScore = Math.round(skillRatio * 60);
    }
    score += matchBreakdown.skillsScore;

    // 2. Location Match (Max 20 points)
    const clientLoc = (client.location || '').toLowerCase();
    const jobLoc = (job.location || '').toLowerCase();

    // Check shared districts / areas in Uganda (Kampala, Makindye, Nakawa, Rubaga, Kawempe, Wakiso, Mukono, Entebbe, Kira)
    const commonUgandanDistricts = ['kampala', 'makindye', 'nakawa', 'rubaga', 'kawempe', 'wakiso', 'mukono', 'entebbe', 'kira', 'jinja', 'industrial area'];
    let locationMatched = false;

    for (const dist of commonUgandanDistricts) {
      if (clientLoc.includes(dist) && jobLoc.includes(dist)) {
        locationMatched = true;
        break;
      }
    }

    if (locationMatched || clientLoc === jobLoc) {
      matchBreakdown.locationScore = 20;
    } else if (clientLoc.includes('kampala') && jobLoc.includes('wakiso')) {
      matchBreakdown.locationScore = 15; // Adjacent metropolitan district
    } else {
      matchBreakdown.locationScore = 5;
    }
    score += matchBreakdown.locationScore;

    // 3. Category Preference Match (Max 20 points)
    const clientPref = (client.preferred_job_category || '').toLowerCase();
    const jobCat = (job.preferred_job_category || '').toLowerCase();

    if (clientPref && jobCat && (clientPref === jobCat || clientPref.includes(jobCat) || jobCat.includes(clientPref))) {
      matchBreakdown.categoryScore = 20;
    } else if (!clientPref) {
      matchBreakdown.categoryScore = 10;
    } else {
      matchBreakdown.categoryScore = 0;
    }
    score += matchBreakdown.categoryScore;

    const finalScore = Math.min(100, Math.max(0, score));

    return {
      matchScore: finalScore,
      breakdown: matchBreakdown
    };
  }

  /**
   * Find top matching jobs for a specific client
   */
  static async getMatchesForClient(clientId) {
    const client = await db.getOne('SELECT * FROM clients WHERE id = $1', [clientId]);
    if (!client) {
      throw new Error(`Client '${clientId}' not found`);
    }

    // Get client skills
    const clientSkills = await db.query(
      `SELECT s.id, s.name, s.category, cs.proficiency_level
       FROM client_skills cs
       JOIN skills s ON cs.skill_id = s.id
       WHERE cs.client_id = $1`,
      [clientId]
    );

    // Get all open jobs
    const jobs = await db.query(
      `SELECT j.*, e.company_name, e.contact_person, e.phone as employer_phone
       FROM jobs j
       JOIN employers e ON j.employer_id = e.id
       WHERE j.status = 'open'`
    );

    // Get all job skills
    const allJobSkills = await db.query(
      `SELECT js.job_id, s.id, s.name, s.category, js.is_required
       FROM job_skills js
       JOIN skills s ON js.skill_id = s.id`
    );

    // Group job skills by job_id
    const jobSkillsMap = {};
    allJobSkills.rows.forEach(js => {
      if (!jobSkillsMap[js.job_id]) jobSkillsMap[js.job_id] = [];
      jobSkillsMap[js.job_id].push(js);
    });

    const scoredJobs = jobs.rows.map(job => {
      const jSkills = jobSkillsMap[job.id] || [];
      const { matchScore, breakdown } = this.calculateMatchScore(client, clientSkills.rows, job, jSkills);
      return {
        ...job,
        matchScore,
        breakdown,
        requiredSkills: jSkills
      };
    });

    // Sort highest match first
    scoredJobs.sort((a, b) => b.matchScore - a.matchScore);

    return {
      client: {
        id: client.id,
        name: client.full_name,
        location: client.location,
        preferredCategory: client.preferred_job_category,
        skills: clientSkills.rows
      },
      matches: scoredJobs
    };
  }
}

module.exports = JobMatchingService;
