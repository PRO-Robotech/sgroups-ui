# HostSockStatsPage

`HostSockStatsPage` renders the `Host` socket statistics subresource:

```txt
hosts/{namespace}/{metadata.name}/sockstats
```

The route uses immutable Host identifiers from routing. It does not select a Host from form state.

## Backend endpoint

Requests go through the same cluster proxy path as the rest of the plugin:

```txt
/api/clusters/{cluster}/k8s/apis/sgroups.io/v1alpha1/namespaces/{namespace}/hosts/{name}/sockstats
```

This maps to the backend raw path:

```txt
/apis/sgroups.io/v1alpha1/namespaces/{namespace}/hosts/{name}/sockstats
```

## Selectors

Selectors are user-submitted. One selector card is encoded as comma-separated `key=value` conditions:

```txt
selector=state=Listen,protocol=tcp
```

Multiple selector cards are sent as repeated `selector` query params. The backend OR-joins repeated selector params.

Supported keys come from the backend OpenAPI spec:

- `protocol`
- `family`
- `state`
- `localAddr`
- `localPort`
- `remoteAddr`
- `remotePort`
- `ifname`
- `inode`
- `pid`
- `comm`

The initial form defaults to `state=Listen`.

## Watch

When `watch=true`, the aggregation layer streams newline-delimited `SocketStatList` objects.

Each watch event is a full socket-stat table snapshot, not a row patch. The UI replaces the entire table for every received batch. Stopping the watch aborts the fetch stream.

## Display

The table renders:

- protocol, family, and state
- local and remote address/port
- interface and inode
- process tags formatted as `comm (pid)`
