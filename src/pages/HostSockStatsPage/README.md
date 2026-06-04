# Host Socket Stats

`SgroupsHostSockStatsTab` renders the `Host` socket statistics subresource inside the Host detail page:

```txt
hosts/{namespace}/{metadata.name}#sockstats
```

The tab uses immutable Host identifiers from the detail factory. It does not select a Host from form state.

`HostSockStatsPage` remains as a compatibility wrapper for the legacy route shape, but `AppInner` redirects `hosts/{namespace}/{metadata.name}/sockstats` to `hosts/{namespace}/{metadata.name}#sockstats`.

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

Selectors are user-submitted. Conditions are encoded as one comma-separated `key=value` selector:

```txt
selector=state=Listen,protocol=tcp
```

The UI does not expose repeated selector params or OR selector groups.

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

The initial form defaults to `state=Listen` and `watch=true`. Opening the tab automatically submits that initial request.

## Watch

When `watch=true`, the UI first fetches one non-watch snapshot with the same selectors to populate the current table, then opens the `watch=true` stream for subsequent `SocketStatList` snapshots. Watch is enabled by default.

Each watch event is a full socket-stat table snapshot, not a row patch. The UI accepts raw `SocketStatList` objects, Kubernetes-style watch events with the list under `object`, and `data:`-prefixed stream lines. The UI replaces the entire table for every received batch. Stopping the watch aborts the fetch stream.

## Display

The table renders:

- protocol, family, and state
- local and remote address/port
- interface and inode
- process tags formatted as `comm (pid)`
