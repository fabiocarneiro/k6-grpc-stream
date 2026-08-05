import grpc from 'k6/net/grpc';

/**
 * Opens a gRPC stream, writes a request payload, and resolves with the first response payload satisfying `predicate`.
 * Sets a gRPC deadline on streamParams matching timeoutMs so the server cancels cleanly on timeout.
 */
export async function waitForStreamData(client, serviceMethod, requestPayload, params = {}, predicate = null, timeoutMs = 30000) {
  const streamParams = Object.assign({}, params, { timeout: `${Math.ceil(timeoutMs / 1000)}s` });

  return new Promise((resolve, reject) => {
    const stream = new grpc.Stream(client, serviceMethod, streamParams);
    let settled = false;

    stream.on('data', (response) => {
      if (settled) return;
      if (!predicate || predicate(response)) {
        settled = true;
        stream.end();
        resolve(response);
      }
    });

    stream.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    stream.on('end', () => {
      if (settled) return;
      settled = true;
      reject(new Error(`gRPC stream ${serviceMethod} ended without matching data`));
    });

    stream.write(requestPayload);
  });
}

/**
 * Opens a gRPC stream, writes a request payload, and collects up to `count` response messages before resolving.
 */
export async function collectStreamData(client, serviceMethod, requestPayload, params = {}, count = 1, timeoutMs = 30000) {
  const streamParams = Object.assign({}, params, { timeout: `${Math.ceil(timeoutMs / 1000)}s` });

  return new Promise((resolve, reject) => {
    const stream = new grpc.Stream(client, serviceMethod, streamParams);
    const items = [];
    let settled = false;

    stream.on('data', (response) => {
      if (settled) return;
      items.push(response);
      if (items.length >= count) {
        settled = true;
        stream.end();
        resolve(items);
      }
    });

    stream.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    stream.on('end', () => {
      if (settled) return;
      settled = true;
      resolve(items);
    });

    stream.write(requestPayload);
  });
}

/**
 * Wraps an existing k6 grpc.Stream instance into an awaitable Promise based on a predicate.
 */
export function streamToPromise(stream, predicate = null) {
  return new Promise((resolve, reject) => {
    let settled = false;

    stream.on('data', (response) => {
      if (settled) return;
      if (!predicate || predicate(response)) {
        settled = true;
        stream.end();
        resolve(response);
      }
    });

    stream.on('error', (err) => {
      if (settled) return;
      settled = true;
      reject(err);
    });

    stream.on('end', () => {
      if (settled) return;
      settled = true;
      reject(new Error('gRPC stream ended without matching data'));
    });
  });
}
