# Networks

## Create modal

The bottom `Add Network` button opens `NetworkFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Namespace`: required. Network namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional, max 63 chars.
- `Address group`: optional multi-select. Loaded from all namespaces and displayed as `namespace / displayName-or-name`.
- `CIDR`: required. The form validates CIDR shape and requires a network address with zero host bits, for example `10.0.0.0/8` or `2001:db8::/64`.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
Network
```

Then it creates one binding per selected AddressGroup:

```ts
NetworkBinding
```

Each binding:

- is created in the Network namespace
- points `spec.network` to the current Network name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write `Network.refs`. Treat it as computed/read-only backend data.

The modal structure overview is derived from the selected AddressGroups and the current host/service/network binding graph. It reuses the AddressGroup contents tree builder so the sidebar reflects the same structure as other flows.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `NetworkFormModal` for a selected Network by passing it as the optional `network` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- `Display name`, `CIDR`, `Description`, and `Comment` are editable and saved with toolkit patch helpers.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- `CIDR` is validated as a network CIDR and patched only when its trimmed value actually changed.
- AddressGroup membership is initialized from existing `NetworkBinding` resources and remains editable.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Network namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Delete modal

The table delete action opens the toolkit `DeleteModal`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / networks / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- That hard reset is intentional and matches the other resource modals.

## Schema source

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

Relevant fields:

- `Network.spec.displayName`
- `Network.spec.CIDR`
- `Network.spec.description`
- `Network.spec.comment`
- `NetworkBinding.spec.addressGroup`
- `NetworkBinding.spec.network`
