import { unauthorized, json } from '@/lib/response';
import { canViewWebsite } from '@/lib/auth';
import { getSessionData } from '@/queries';
import { parseRequest } from '@/lib/request';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ websiteId: string; sessionId: string }> },
) {
  const { auth, error } = await parseRequest(request);

  if (error) {
    return error();
  }

  const { websiteId, sessionId } = await params;

  if (!(await canViewWebsite(auth, websiteId))) {
    return unauthorized();
  }

  const data = await getSessionData(websiteId, sessionId);

  return json(data);
}
