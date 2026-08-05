export function waitForStreamData(
  client: any,
  serviceMethod: string,
  requestPayload: any,
  params?: any,
  predicate?: ((payload: any) => boolean) | null,
  timeoutMs?: number
): Promise<any>;

export function collectStreamData(
  client: any,
  serviceMethod: string,
  requestPayload: any,
  params?: any,
  count?: number,
  timeoutMs?: number
): Promise<any[]>;

export function streamToPromise(
  stream: any,
  predicate?: ((payload: any) => boolean) | null
): Promise<any>;
