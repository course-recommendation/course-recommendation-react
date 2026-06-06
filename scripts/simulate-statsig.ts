/**
 * Simulates 4 groups of users (2 tenants × 2 showExplanation values) sending
 * Statsig events without needing the frontend or backend to be running.
 *
 * Usage:
 *   STATSIG_SECRET_KEY=secret-xxx bun run scripts/simulate-statsig.ts
 */

import Statsig from 'statsig-node';

const STATSIG_SECRET_KEY = process.env.STATSIG_SECRET_KEY ?? '';
// const STATSIG_SECRET_KEY = 'client-He66Rqt8SmdRDA1cwWGzAAnYGiohDkJFTmSaCBLmZhh'
const USERS_PER_GROUP = 20;

// Sample course codes to use in event metadata
const SAMPLE_COURSES = [
  'IT001',
  'IT002',
  'IT003',
  'IT004',
  'IT005',
  'IT006',
  'IT007',
  'IT008',
  'IT009',
  'IT010',
  'CS101',
  'CS102',
  'CS201',
  'CS202',
  'CS301',
  'MT001',
  'MT002',
  'MT003',
  'MT101',
  'MT201',
];

const FS_ATTRIBUTES = ['Giảng viên', 'Nội dung', 'Tài liệu', 'Bài tập', 'Thi cử'];
const TRIRANK_ATTRIBUTES = ['Độ khó', 'Ứng dụng thực tế', 'Chất lượng giảng dạy'];

function chance(p: number) {
  return Math.random() < p;
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}
function pickN<T>(arr: T[], n: number): T[] {
  return [...arr].sort(() => Math.random() - 0.5).slice(0, n);
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

type Algorithm = 'FS' | 'TriRank';

type Group = {
  tenantName: string;
  algorithm: Algorithm;
  showExplanation: boolean;
};

// 4 groups: tenant-a uses FS, tenant-b uses TriRank, each with showExplanation on/off
const GROUPS: Group[] = [
  { tenantName: 'tenant-a', algorithm: 'FS', showExplanation: true },
  { tenantName: 'tenant-a', algorithm: 'FS', showExplanation: false },
  { tenantName: 'tenant-b', algorithm: 'TriRank', showExplanation: true },
  { tenantName: 'tenant-b', algorithm: 'TriRank', showExplanation: false },
];

type LogFn = (name: string, value?: string | number, extra?: Record<string, string>) => void;

function simulateFSSession(log: LogFn, showExplanation: boolean) {
  // Adjust some preferences before getting a recommendation
  if (chance(0.65)) {
    const attrs = pickN(FS_ATTRIBUTES, randInt(1, 3));
    for (const attr of attrs) {
      log('adjust_preference', randInt(1, 5), { attribute: attr });
    }
  }

  // Optionally toggle a filter option
  if (chance(0.35)) log('click_filter_courses_option');

  // Get the recommendation (always happens)
  log('get_recommendation');

  // Browse recommended courses
  const courses = pickN(SAMPLE_COURSES, randInt(2, 6));
  for (const [idx, courseCode] of courses.entries()) {
    const rank = String(idx + 1);

    log('see_course_detail', undefined, { courseCode, rank });

    // Explanation modal — only available when showExplanation is true
    if (showExplanation && chance(0.5)) {
      log('view_course_explanation', undefined, { courseCode, rank });
    }

    // Plan the course
    if (chance(0.4)) {
      log('click_planned', undefined, { courseCode, page: 'recommendation', rank });
    }

    // FS-only: ask for refined (similar) recommendations
    if (chance(0.25)) {
      log('get_refined_recommendation', undefined, { courseCode, rank });

      // After refinement, user browses the new results
      const refinedCourses = pickN(
        SAMPLE_COURSES.filter((c) => c !== courseCode),
        randInt(1, 3),
      );
      for (const [ri, rc] of refinedCourses.entries()) {
        const rRank = String(ri + 1);
        log('see_course_detail', undefined, { courseCode: rc, rank: rRank });

        if (showExplanation && chance(0.4)) {
          log('view_course_explanation', undefined, { courseCode: rc, rank: rRank });
        }

        if (chance(0.3)) {
          log('click_planned', undefined, { courseCode: rc, page: 'recommendation', rank: rRank });
        }
      }
    }
  }

  // Some users tweak settings and get a second recommendation
  if (chance(0.3)) {
    if (chance(0.6)) {
      log('adjust_preference', randInt(1, 5), { attribute: pick(FS_ATTRIBUTES) });
    }
    log('get_recommendation');

    const secondRound = pickN(SAMPLE_COURSES, randInt(1, 3));
    for (const [idx, courseCode] of secondRound.entries()) {
      const rank = String(idx + 1);
      log('see_course_detail', undefined, { courseCode, rank });

      if (showExplanation && chance(0.4)) {
        log('view_course_explanation', undefined, { courseCode, rank });
      }
    }
  }
}

function simulateTriRankSession(log: LogFn, showExplanation: boolean) {
  // Adjust some preferences
  if (chance(0.6)) {
    const attrs = pickN(TRIRANK_ATTRIBUTES, randInt(1, 2));
    for (const attr of attrs) {
      log('adjust_preference', randInt(1, 5), { attribute: attr });
    }
  }

  // Optionally toggle a filter option
  if (chance(0.3)) log('click_filter_courses_option');

  // Get the recommendation (always happens)
  log('get_recommendation');

  // Browse recommended courses
  const courses = pickN(SAMPLE_COURSES, randInt(2, 5));
  for (const [idx, courseCode] of courses.entries()) {
    const rank = String(idx + 1);

    log('see_course_detail', undefined, { courseCode, rank });

    // Explanation modal — only available when showExplanation is true
    if (showExplanation && chance(0.5)) {
      log('view_course_explanation', undefined, { courseCode, rank });
    }

    // Plan the course
    if (chance(0.35)) {
      log('click_planned', undefined, { courseCode, page: 'recommendation', rank });
    }
  }

  // Some users go for a second recommendation cycle
  if (chance(0.25)) {
    if (chance(0.5)) {
      log('adjust_preference', randInt(1, 5), { attribute: pick(TRIRANK_ATTRIBUTES) });
    }
    log('get_recommendation');

    const secondRound = pickN(SAMPLE_COURSES, randInt(1, 3));
    for (const [idx, courseCode] of secondRound.entries()) {
      const rank = String(idx + 1);
      log('see_course_detail', undefined, { courseCode, rank });

      if (showExplanation && chance(0.4)) {
        log('view_course_explanation', undefined, { courseCode, rank });
      }
    }
  }
}

function simulateUser(userID: string, group: Group): void {
  const statsigUser = {
    userID,
    custom: { tenantName: group.tenantName },
  };

  const baseMetadata: Record<string, string> = {
    algorithm: group.algorithm,
    tenantName: group.tenantName,
    showExplanation: String(group.showExplanation),
  };

  const log: LogFn = (name, value, extra) => {
    Statsig.logEvent(statsigUser, name, value, { ...baseMetadata, ...extra });
  };

  if (group.algorithm === 'FS') {
    simulateFSSession(log, group.showExplanation);
  } else {
    simulateTriRankSession(log, group.showExplanation);
  }
}

async function main() {
  if (!STATSIG_SECRET_KEY) {
    console.error('Error: STATSIG_SECRET_KEY environment variable is not set.');
    console.error('Usage: STATSIG_SECRET_KEY=secret-xxx bun run scripts/simulate-statsig.ts');
    process.exit(1);
  }

  await Statsig.initialize(STATSIG_SECRET_KEY);
  console.log('Statsig initialized.\n');

  let totalEvents = 0;
  const origLogEvent = Statsig.logEvent.bind(Statsig);
  Statsig.logEvent = (...args: Parameters<typeof Statsig.logEvent>) => {
    totalEvents++;
    return origLogEvent(...args);
  };

  for (const group of GROUPS) {
    const label = `${group.tenantName} | ${group.algorithm} | showExplanation=${group.showExplanation}`;
    process.stdout.write(`Simulating [${label}] `);

    for (let i = 0; i < USERS_PER_GROUP; i++) {
      const suffix = `${group.algorithm.toLowerCase()}_${group.showExplanation ? 'exp' : 'noexp'}`;
      const userID = `sim_${group.tenantName}_${suffix}_user${String(i + 1).padStart(2, '0')}`;
      simulateUser(userID, group);
      process.stdout.write('.');
    }

    console.log(` done (${USERS_PER_GROUP} users)`);
  }

  console.log(`\nFlushing ~${totalEvents} events to Statsig...`);
  await Statsig.flush();
  await Statsig.shutdown();
  console.log('Done!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
