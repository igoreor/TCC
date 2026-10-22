import { randomUUID } from 'node:crypto';

/**
 * Dublê em memória do subconjunto do Prisma Client usado por autenticação, conversas e feedback.
 * Reproduz as regras do banco que importam para a lógica: unicidade de feedback por resposta e
 * usuário (erro P2002) e relação entre mensagem, conversa e dono da conversa.
 */
export interface FakeUser {
  id: string;
  username: string;
  passwordHash: string;
  active: boolean;
}

export interface FakeAuthSession {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface FakeChatSession {
  id: string;
  userType: string;
  userId: string | null;
}

export interface FakeChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface FakeFeedback {
  id: string;
  userId: string;
  sessionId: string;
  messageId: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
}

export function createInMemoryDb() {
  const data = {
    users: [] as FakeUser[],
    authSessions: [] as FakeAuthSession[],
    chatSessions: [] as FakeChatSession[],
    chatMessages: [] as FakeChatMessage[],
    feedback: [] as FakeFeedback[]
  };

  const sessionMatches = (session: FakeAuthSession, where: any) =>
    (where.id === undefined || session.id === where.id) &&
    (where.tokenHash === undefined || session.tokenHash === where.tokenHash) &&
    (where.userId === undefined || session.userId === where.userId) &&
    (where.expiresAt?.lte === undefined || session.expiresAt <= where.expiresAt.lte);

  const db = {
    user: {
      findUnique: async ({ where }: any) =>
        data.users.find((user) =>
          where.id ? user.id === where.id : user.username === where.username
        ) ?? null
    },
    authSession: {
      create: async ({ data: input }: any) => {
        const row: FakeAuthSession = { id: randomUUID(), createdAt: new Date(), ...input };
        data.authSessions.push(row);
        return row;
      },
      findUnique: async ({ where, include }: any) => {
        const session = data.authSessions.find((item) => item.tokenHash === where.tokenHash);
        if (!session) return null;
        return include?.user
          ? { ...session, user: data.users.find((user) => user.id === session.userId) }
          : session;
      },
      deleteMany: async ({ where }: any) => {
        const before = data.authSessions.length;
        data.authSessions = data.authSessions.filter((session) => !sessionMatches(session, where));
        return { count: before - data.authSessions.length };
      }
    },
    chatSession: {
      findFirst: async ({ where }: any) =>
        data.chatSessions.find(
          (session) => session.id === where.id && session.userId === where.userId
        ) ?? null,
      create: async ({ data: input }: any) => {
        const row: FakeChatSession = { id: randomUUID(), userId: null, ...input };
        data.chatSessions.push(row);
        return row;
      }
    },
    chatMessage: {
      findUnique: async ({ where }: any) => {
        const message = data.chatMessages.find((item) => item.id === where.id);
        if (!message) return null;
        const session = data.chatSessions.find((item) => item.id === message.sessionId);
        return {
          id: message.id,
          role: message.role,
          sessionId: message.sessionId,
          session: { userId: session?.userId ?? null }
        };
      }
    },
    feedback: {
      create: async ({ data: input }: any) => {
        if (
          data.feedback.some(
            (item) => item.messageId === input.messageId && item.userId === input.userId
          )
        ) {
          throw Object.assign(
            new Error('Unique constraint failed on the fields: (`message_id`,`user_id`)'),
            {
              code: 'P2002'
            }
          );
        }
        const row: FakeFeedback = {
          id: randomUUID(),
          createdAt: new Date(),
          comment: null,
          ...input
        };
        data.feedback.push(row);
        return row;
      }
    }
  };

  /** Cria uma conversa do usuário com uma pergunta e a resposta da IA. */
  function addConversation(userId: string | null) {
    const session: FakeChatSession = {
      id: randomUUID(),
      userType: 'Profissional de saúde',
      userId
    };
    const question: FakeChatMessage = {
      id: randomUUID(),
      sessionId: session.id,
      role: 'user',
      content: 'Pergunta'
    };
    const answer: FakeChatMessage = {
      id: randomUUID(),
      sessionId: session.id,
      role: 'assistant',
      content: 'Resposta'
    };
    data.chatSessions.push(session);
    data.chatMessages.push(question, answer);
    return { session, question, answer };
  }

  return { db: db as any, data, addConversation };
}
