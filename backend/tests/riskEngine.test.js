const RiskEngine = require('../src/services/risk/riskEngine');
const { RISK_LEVELS } = require('../src/config/constants');

describe('RiskEngine Unit Tests', () => {
  test('calculateRiskLevel maps scores to correct clinical categories', () => {
    expect(RiskEngine.calculateRiskLevel(15)).toBe(RISK_LEVELS.STABLE);
    expect(RiskEngine.calculateRiskLevel(29)).toBe(RISK_LEVELS.STABLE);
    expect(RiskEngine.calculateRiskLevel(30)).toBe(RISK_LEVELS.MONITOR);
    expect(RiskEngine.calculateRiskLevel(49)).toBe(RISK_LEVELS.MONITOR);
    expect(RiskEngine.calculateRiskLevel(50)).toBe(RISK_LEVELS.AT_RISK);
    expect(RiskEngine.calculateRiskLevel(74)).toBe(RISK_LEVELS.AT_RISK);
    expect(RiskEngine.calculateRiskLevel(75)).toBe(RISK_LEVELS.CRITICAL);
    expect(RiskEngine.calculateRiskLevel(100)).toBe(RISK_LEVELS.CRITICAL);
  });

  test('calculateRiskScore increases by +25 on reply "2" (struggling)', () => {
    const result = RiskEngine.calculateRiskScore({
      currentScore: 10,
      checkinResponseCode: '2',
      checkinStatus: 'received'
    });

    expect(result.score).toBeGreaterThanOrEqual(25);
    expect(result.reasons.some(r => r.includes('indicated struggling'))).toBe(true);
  });

  test('calculateRiskScore adds +15 for missed check-in', () => {
    const result = RiskEngine.calculateRiskScore({
      currentScore: 10,
      checkinStatus: 'missed'
    });

    expect(result.score).toBe(15);
    expect(result.reasons.some(r => r.includes('Missed weekly check-in'))).toBe(true);
  });

  test('calculateRiskScore factors in NLP distress signal (+20)', () => {
    const result = RiskEngine.calculateRiskScore({
      currentScore: 10,
      checkinResponseCode: '2',
      checkinStatus: 'received',
      aiSentiment: 'distressed'
    });

    expect(result.score).toBe(45); // 25 + 20
    expect(result.reasons.some(r => r.includes('distress'))).toBe(true);
  });

  test('calculateRiskScore caps strictly at 100 max', () => {
    const result = RiskEngine.calculateRiskScore({
      currentScore: 80,
      checkinResponseCode: '2',
      checkinStatus: 'missed',
      aiSentiment: 'distressed',
      hasUnresolvedAlert: true,
      recentCheckins: [{ response_code: '2' }, { response_code: '2' }, { status: 'missed' }, { status: 'missed' }, { status: 'missed' }]
    });

    expect(result.score).toBe(100);
    expect(result.level).toBe(RISK_LEVELS.CRITICAL);
  });
});
