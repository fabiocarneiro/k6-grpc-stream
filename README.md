# k6-grpc-stream

> Promise-based gRPC streaming helpers and `async/await` wrappers for Grafana k6.

`k6-grpc-stream` converts k6's event-based `grpc.Stream` callback API (`stream.on('data')`) into awaitable Promises. This allows clean, modern `async/await` syntax and deadline management in gRPC performance and regression tests.

---

## Installation

```bash
npm install k6-grpc-stream
```

---

## Features

- **Promise-Based Stream Resolution**: `await` streaming data instead of chaining `.on('data')` callbacks.
- **Predicate Filtering**: Resolve streams only when a specific payload condition is satisfied.
- **Stream Message Collection**: Collect $N$ messages from a stream into an array.
- **Deadline Management**: Automatically sets gRPC deadlines on streams so client connections close cleanly on timeouts.

---

## Usage Example

```javascript
import grpc from 'k6/net/grpc';
import { waitForStreamData, collectStreamData } from 'k6-grpc-stream';

const client = new grpc.Client();
client.load(['src/main/proto'], 'myservice.proto');

export default async function () {
  client.connect('grpc.example.com:443', { plaintext: false });

  // 1. Wait for a specific stream payload matching a condition
  const response = await waitForStreamData(
    client,
    'myservice.StreamService/WatchData',
    { topic: 'metrics' },
    { metadata: { Authorization: 'Bearer token' } },
    (payload) => payload.status === 'READY',
    30000 // 30s timeout
  );

  console.log('Received payload:', response);

  // 2. Collect 5 stream messages into an array
  const items = await collectStreamData(
    client,
    'myservice.StreamService/WatchData',
    { topic: 'events' },
    {},
    5, // count
    15000 // 15s timeout
  );

  client.close();
}
```

---

## API

### `waitForStreamData(client, serviceMethod, requestPayload, params, predicate, timeoutMs)`
Opens a gRPC stream, sends `requestPayload`, and resolves with the first payload where `predicate(payload)` returns true.

### `collectStreamData(client, serviceMethod, requestPayload, params, count, timeoutMs)`
Opens a gRPC stream, sends `requestPayload`, and collects `count` messages before resolving as an array.

### `streamToPromise(stream, predicate)`
Wraps an existing active `grpc.Stream` instance into an awaitable Promise.

---

## License

[MIT](LICENSE)
