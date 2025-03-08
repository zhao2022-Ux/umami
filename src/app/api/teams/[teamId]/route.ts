import { z } from 'zod';
import { unauthorized, json, notFound, ok } from '@/lib/response';
import { canDeleteTeam, canUpdateTeam, canViewTeam } from '@/lib/auth';
import { parseRequest } from '@/lib/request';
import { deleteTeam, getTeam, updateTeam } from '@/queries';

export async function GET(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canViewTeam(auth, teamId))) {
    return unauthorized();
  }

  const team = await getTeam(teamId, { includeMembers: true });

  if (!team) {
    return notFound('Team not found.');
  }

  return json(team);
}

export async function POST(request: Request, { params }: { params: Promise<{ teamId: string }> }) {
  const schema = z.object({
    name: z.string().max(50),
    accessCode: z.string().max(50),
  });

  const { auth, body, error } = await parseRequest(request, schema);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canUpdateTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  const team = await updateTeam(teamId, body);

  return json(team);
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ teamId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { teamId } = await params;

  if (!(await canDeleteTeam(auth, teamId))) {
    return unauthorized('You must be the owner of this team.');
  }

  await deleteTeam(teamId);

  return ok();
}
