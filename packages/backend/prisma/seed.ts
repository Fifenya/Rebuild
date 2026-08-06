import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);

  // Upsert two users for development/testing
  const alice = await prisma.user.upsert({
    where: { username: 'alice' },
    update: {},
    create: {
      username: 'alice',
      phone: '+10000000001',
      publicKey: 'pub_alice_1',
      displayName: 'Alice',
      password: hash,
      email: 'alice@example.local',
      bio: 'Test user Alice',
    },
  });

  const bob = await prisma.user.upsert({
    where: { username: 'bob' },
    update: {},
    create: {
      username: 'bob',
      phone: '+10000000002',
      publicKey: 'pub_bob_1',
      displayName: 'Bob',
      password: hash,
      email: 'bob@example.local',
      bio: 'Test user Bob',
    },
  });

  // Create a private chat between Alice and Bob
  const chat = await prisma.chat.upsert({
    where: { id: 'chat-alice-bob' },
    update: {},
    create: {
      id: 'chat-alice-bob',
      name: null,
      isGroup: false,
      creatorId: alice.id,
      type: 'PRIVATE',
    },
  });

  // Ensure chat members exist (ChatMember explicit model)
  await prisma.chatMember.upsert({
    where: { chatId_userId: { chatId: chat.id, userId: alice.id } },
    update: {},
    create: {
      chatId: chat.id,
      userId: alice.id,
      role: 'member',
    },
  });

  await prisma.chatMember.upsert({
    where: { chatId_userId: { chatId: chat.id, userId: bob.id } },
    update: {},
    create: {
      chatId: chat.id,
      userId: bob.id,
      role: 'member',
    },
  });

  // Add a couple messages
  await prisma.chatMessage.create({
    data: {
      content: 'Hello Bob! Welcome to Nexus (dev seed).',
      senderId: alice.id,
      chatId: chat.id,
    },
  });

  await prisma.chatMessage.create({
    data: {
      content: 'Thanks Alice! Ready to test messages.',
      senderId: bob.id,
      chatId: chat.id,
    },
  });

  // Optional: add a direct Message entry (non-chat)
  await prisma.message.create({
    data: {
      content: 'This is a direct message from Alice to Bob.',
      senderId: alice.id,
      receiverId: bob.id,
      text: 'This is a direct message body',
    },
  });

  console.log('Seed completed: users, chat, members, messages created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
