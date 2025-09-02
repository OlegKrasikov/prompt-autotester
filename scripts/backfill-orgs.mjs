#!/usr/bin/env node
/*
 Backfill orgId on existing user-owned resources.
 - Ensures each user has a Personal org + Admin membership.
 - Sets UserProfile.lastActiveOrgId if missing.
 - Updates Scenario, ScenarioSuite, Prompt, Variable, UserApiKey where orgId is null.

 Usage:
   node scripts/backfill-orgs.mjs [--dry-run]

 Flags:
   --dry-run  Perform no writes. Prints per-user and per-table counts of rows that would be updated
              and whether a Personal org would be created.

 Requires: DATABASE_URL env set, prisma generated.
*/

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function uniqueSlug(base) {
  let attempt = 0;
  while (true) {
    const slug = attempt === 0 ? base : `${base}-${attempt}`;
    const exists = await prisma.organization.findUnique({ where: { slug } });
    if (!exists) return slug;
    attempt += 1;
  }
}

async function ensurePersonalOrg(user) {
  const activeMemberships = await prisma.organizationMember.findMany({
    where: { userId: user.id, status: 'ACTIVE' },
  });
  if (activeMemberships.length > 0) return activeMemberships[0].orgId;

  const nameBase = user.name || user.email || 'Personal';
  const personalName = `${nameBase}\'s Workspace`;
  const slugBase = nameBase
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  const slug = await uniqueSlug(slugBase || 'workspace');
  const org = await prisma.organization.create({
    data: {
      name: personalName,
      slug,
      createdByUserId: user.id,
      members: { create: { userId: user.id, role: 'ADMIN', status: 'ACTIVE' } },
    },
  });
  return org.id;
}

async function main() {
  const args = new Set(process.argv.slice(2));
  const dryRun = args.has('--dry-run');
  const users = await prisma.user.findMany();
  const totals = {
    scenarios: 0,
    scenarioSuites: 0,
    prompts: 0,
    variables: 0,
    apiKeys: 0,
    users: users.length,
    orgsCreated: 0,
  };
  let totalUpdates = 0;
  for (const user of users) {
    // Tolerate missing user_profile table during early migration
    let profile = null;
    try {
      profile = await prisma.userProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
    } catch {}
    let activeOrgId = profile?.lastActiveOrgId ?? null;

    // Would we need to create a personal org?
    let willCreateOrg = false;
    if (!activeOrgId) {
      const activeMemberships = await prisma.organizationMember.count({
        where: { userId: user.id, status: 'ACTIVE' },
      });
      if (activeMemberships === 0) willCreateOrg = true;
    }

    if (!activeOrgId) {
      if (dryRun) {
        // Create a placeholder to reference in dry-run output
        activeOrgId = '<new-org-id>';
      } else {
        activeOrgId = await ensurePersonalOrg(user);
        totals.orgsCreated += 1;
        try {
          await prisma.userProfile.update({
            where: { userId: user.id },
            data: { lastActiveOrgId: activeOrgId },
          });
        } catch {}
      }
    }

    // Count records to update
    const [cScenarios, cSuites, cPrompts, cVars, cKeys] = await Promise.all([
      prisma.scenario.count({ where: { userId: user.id, orgId: null } }),
      prisma.scenarioSuite.count({ where: { userId: user.id, orgId: null } }),
      prisma.prompt.count({ where: { userId: user.id, orgId: null } }),
      prisma.variable.count({ where: { userId: user.id, orgId: null } }),
      prisma.userApiKey.count({ where: { userId: user.id, orgId: null } }),
    ]);

    // Update or report
    let s1 = { count: cScenarios },
      s2 = { count: cSuites },
      p1 = { count: cPrompts },
      v1 = { count: cVars },
      k1 = { count: cKeys };
    if (!dryRun) {
      [s1, s2, p1, v1, k1] = await prisma.$transaction([
        prisma.scenario.updateMany({
          where: { userId: user.id, orgId: null },
          data: { orgId: activeOrgId },
        }),
        prisma.scenarioSuite.updateMany({
          where: { userId: user.id, orgId: null },
          data: { orgId: activeOrgId },
        }),
        prisma.prompt.updateMany({
          where: { userId: user.id, orgId: null },
          data: { orgId: activeOrgId },
        }),
        prisma.variable.updateMany({
          where: { userId: user.id, orgId: null },
          data: { orgId: activeOrgId },
        }),
        prisma.userApiKey.updateMany({
          where: { userId: user.id, orgId: null },
          data: { orgId: activeOrgId },
        }),
      ]);
    }

    const updated = s1.count + s2.count + p1.count + v1.count + k1.count;
    totalUpdates += updated;
    totals.scenarios += s1.count;
    totals.scenarioSuites += s2.count;
    totals.prompts += p1.count;
    totals.variables += v1.count;
    totals.apiKeys += k1.count;
    const prefix = dryRun ? '[DRY-RUN] ' : '';
    console.log(
      `${prefix}User ${user.email || user.id}: org=${activeOrgId}${willCreateOrg ? ' (would create Personal org)' : ''}, updated { scenarios: ${s1.count}, suites: ${s2.count}, prompts: ${p1.count}, variables: ${v1.count}, apiKeys: ${k1.count} }`,
    );
  }
  const prefix = dryRun ? '[DRY-RUN] ' : '';
  console.log(`${prefix}Backfill complete.`);
  console.log(
    `${prefix}Totals: { scenarios: ${totals.scenarios}, suites: ${totals.scenarioSuites}, prompts: ${totals.prompts}, variables: ${totals.variables}, apiKeys: ${totals.apiKeys}, orgsCreated: ${totals.orgsCreated} }`,
  );
  console.log(`${prefix}Total updated records: ${totalUpdates}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
