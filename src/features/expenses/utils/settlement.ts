import type { ExpenseRow } from '../types';

export type MemberRole = 'owner' | 'editor' | 'viewer';

export interface TripMember {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: MemberRole;
  isOwner: boolean;
  avatarUrl: string | null;
}

export interface MemberBalance {
  member: TripMember;
  paid: number;
  owes: number;
  net: number;
}

export interface Settlement {
  from: TripMember;
  to: TripMember;
  amount: number;
}

interface SplitMeta {
  _paidBy: string;
  _notes: string | null;
}

export function parseSplitMeta(notes: string | null): SplitMeta | null {
  if (!notes) return null;
  try {
    const obj = JSON.parse(notes) as Record<string, unknown>;
    if (typeof obj['_paidBy'] === 'string') {
      return {
        _paidBy: obj['_paidBy'],
        _notes: typeof obj['_notes'] === 'string' ? obj['_notes'] : null,
      };
    }
  } catch {
    // plain text notes
  }
  return null;
}

export function encodeSplitMeta(paidById: string, userNotes: string): string {
  const meta: SplitMeta = { _paidBy: paidById, _notes: userNotes || null };
  return JSON.stringify(meta);
}

export function getDisplayNotes(notes: string | null): string | null {
  const meta = parseSplitMeta(notes);
  if (meta) return meta._notes;
  return notes;
}

export function calcBalances(
  expenses: ExpenseRow[],
  members: TripMember[],
  ownerMemberId: string,
): MemberBalance[] {
  if (members.length === 0) return [];
  const n = members.length;

  const memberIds = new Set(members.map((m) => m.id));
  const paid = new Map<string, number>(members.map((m) => [m.id, 0]));
  const owes = new Map<string, number>(members.map((m) => [m.id, 0]));

  for (const exp of expenses) {
    const meta = parseSplitMeta(exp.notes);
    const payerId = meta?._paidBy ?? ownerMemberId;

    if (!memberIds.has(payerId)) continue;

    paid.set(payerId, (paid.get(payerId) ?? 0) + exp.amount);

    const share = exp.amount / n;
    members.forEach((m) => {
      owes.set(m.id, (owes.get(m.id) ?? 0) + share);
    });
  }

  return members.map((m) => {
    const p = paid.get(m.id) ?? 0;
    const o = owes.get(m.id) ?? 0;
    return { member: m, paid: p, owes: o, net: p - o };
  });
}

export function calcSettlement(balances: MemberBalance[]): Settlement[] {
  const credits = balances
    .filter((b) => b.net > 0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => b.net - a.net);
  const debts = balances
    .filter((b) => b.net < -0.01)
    .map((b) => ({ ...b }))
    .sort((a, b) => a.net - b.net);

  const transactions: Settlement[] = [];
  let ci = 0;
  let di = 0;

  while (ci < credits.length && di < debts.length) {
    const credit = credits[ci];
    const debt = debts[di];
    if (!credit || !debt) break;

    const amount = Math.min(credit.net, -debt.net);
    if (amount > 0.01) {
      transactions.push({
        from: debt.member,
        to: credit.member,
        amount: Math.round(amount * 100) / 100,
      });
    }

    credit.net -= amount;
    debt.net += amount;

    if (Math.abs(credit.net) < 0.01) ci++;
    if (Math.abs(debt.net) < 0.01) di++;
  }

  return transactions;
}

export function memberInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((w) => (w[0] ?? '').toUpperCase())
    .slice(0, 2)
    .join('');
}
