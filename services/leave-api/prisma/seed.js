const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const alice = await prisma.employee.upsert({
    where: { email: "alice.manager@example.com" },
    update: {},
    create: { name: "Alice Manager", email: "alice.manager@example.com" },
  });
  const dave = await prisma.employee.upsert({
    where: { email: "dave.manager@example.com" },
    update: {},
    create: { name: "Dave Manager", email: "dave.manager@example.com" },
  });
  const bob = await prisma.employee.upsert({
    where: { email: "bob.dev@example.com" },
    update: {},
    create: { name: "Bob Dev", email: "bob.dev@example.com" },
  });
  const carol = await prisma.employee.upsert({
    where: { email: "carol.qa@example.com" },
    update: {},
    create: { name: "Carol QA", email: "carol.qa@example.com" },
  });
  const eve = await prisma.employee.upsert({
    where: { email: "eve.agent@example.com" },
    update: {},
    create: { name: "Eve Agent", email: "eve.agent@example.com" },
  });

  // Teams (create if missing), set managerId
  let platform = await prisma.team.findUnique({ where: { name: "Platform" } }).catch(() => null);
  if (!platform) {
    platform = await prisma.team.create({ data: { name: "Platform", managerId: alice.id } });
  } else if (platform.managerId !== alice.id) {
    platform = await prisma.team.update({ where: { id: platform.id }, data: { managerId: alice.id } });
  }

  let support = await prisma.team.findUnique({ where: { name: "Support" } }).catch(() => null);
  if (!support) {
    support = await prisma.team.create({ data: { name: "Support", managerId: dave.id } });
  } else if (support.managerId !== dave.id) {
    support = await prisma.team.update({ where: { id: support.id }, data: { managerId: dave.id } });
  }

  // Put people on teams
  await prisma.employee.update({ where: { id: alice.id }, data: { teamId: platform.id } });
  await prisma.employee.update({ where: { id: dave.id  }, data: { teamId: support.id  } });
  await prisma.employee.update({ where: { id: bob.id   }, data: { teamId: platform.id } });
  await prisma.employee.update({ where: { id: carol.id }, data: { teamId: platform.id } });
  await prisma.employee.update({ where: { id: eve.id   }, data: { teamId: support.id  } });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
