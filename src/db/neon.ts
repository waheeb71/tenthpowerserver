export interface NeonQueryResult<T = any> {
  rows: T[];
  rowCount?: number;
  command?: string;
}

export async function queryNeon<T = any>(
  sql: string,
  params: any[] = [],
  connectionString?: string
): Promise<T[]> {
  const conn =
    connectionString ||
    process.env.NEON_DATABASE_URL ||
    '';

  if (!conn) {
    throw new Error('NEON_DATABASE_URL is not configured');
  }

  // Extract host endpoint
  const match = conn.match(/@([^/]+)\//);
  const host = match ? match[1] : 'ep-muddy-cloud-axv9ixcc-pooler.c-4.us-east-2.aws.neon.tech';
  const endpoint = `https://${host}/sql`;

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Neon-Connection-String': conn,
    },
    body: JSON.stringify({
      query: sql,
      params,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Neon Error [${response.status}]: ${errText}`);
  }

  const data = (await response.json()) as NeonQueryResult<T>;
  return data.rows || [];
}

export async function executeNeon(
  sql: string,
  params: any[] = [],
  connectionString?: string
): Promise<boolean> {
  try {
    await queryNeon(sql, params, connectionString);
    return true;
  } catch (err) {
    console.error('Neon execute error:', err);
    return false;
  }
}
