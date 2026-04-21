# Hosts

## Create modal

The bottom `Add Host` button opens `HostFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Namespace`: required. Host namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional.
- `Address group`: optional multi-select. Loaded from all namespaces and displayed as `namespace / displayName-or-name`.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
Host
```

Then it creates one binding per selected AddressGroup:

```ts
HostBinding
```

Each binding:

- is created in the Host namespace
- points `spec.host` to the current Host name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write `Host.refs`. Treat it as computed/read-only backend data.

The modal structure overview is derived from the selected AddressGroups and the current host/service/network binding graph. It reuses the AddressGroup contents tree builder so the sidebar reflects the same structure as other flows.

## Edit modal

The table actions column opens the same `HostFormModal` for a selected Host by passing it as the optional `host` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- `Display name`, `Description`, and `Comment` are editable and saved with toolkit patch helpers.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- AddressGroup membership is initialized from existing `HostBinding` resources and remains editable.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Host namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Data shape notes

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

- Treat host IPs and metainfo as backend-owned data for this modal flow. The modal does not edit them.
- The local docs place these fields under `spec`:
  - `Host.spec.IPs`
  - `Host.spec.metaInfo`
- The current UI normalizes host reads so details/overview continue to work if payloads arrive either under `spec` or flattened at top level.

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- That hard reset is intentional and matches the other resource modals.

## Schema source

Relevant fields:

- `Host.spec.displayName`
- `Host.spec.description`
- `Host.spec.comment`
- `Host.spec.IPs`
- `Host.spec.metaInfo`
- `HostBinding.spec.addressGroup`
- `HostBinding.spec.host`
