# AddressGroups

## Create modal

The bottom `Add Address Group` button opens `AddressGroupFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Namespace`: required. AddressGroup namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional.
- `Allow access`: maps to `spec.defaultAction`.
  - enabled: `Allow`
  - disabled: `Deny`
- `Hosts`: optional multi-select. Loaded from the AddressGroup namespace. Creates `HostBinding` resources in the AddressGroup namespace.
- `Services`: optional multi-select. Loaded from all namespaces and displayed as `namespace / service-name`. Creates each `ServiceBinding` in the selected service namespace.
- `Networks`: optional multi-select. Loaded from the AddressGroup namespace. Creates `NetworkBinding` resources in the AddressGroup namespace.
- `Description`: optional.
- `Comment`: optional.

## API flow

The save flow creates the main resource first:

```ts
AddressGroup
```

Then it creates one binding per selected host, service, or network:

```ts
HostBinding
ServiceBinding
NetworkBinding
```

The binding `spec.addressGroup` points at the newly-created AddressGroup. Hosts and networks are bound from the AddressGroup namespace. Services can be selected from any namespace, and their bindings are created in the service namespace.

The `AddressGroup.refs` field is intentionally not written by the UI. It is treated as computed/read-only data and should be populated by backend/controller logic from bindings.

The modal structure overview is a single AddressGroup tree. It does not model local/remote groups; services keep their namespace in the displayed label.

## Edit modal

The table actions column can open the same `AddressGroupFormModal` for a selected AddressGroup by passing it as the optional `addressGroup` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- `Display name`, `Allow access`, `Description`, and `Comment` are editable and saved with patch helpers from the toolkit.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- Hosts, services, and networks are prefilled from `AddressGroup.refs` when available, but are read-only for now. Updating relationships requires binding diffing and delete/create handling, so it is intentionally outside this modal save path.
- Resource badge rendering is reused from the table formatter for the modal title, options, tags, and overview.

## Schema source

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

Relevant fields:

- `AddressGroup.spec.displayName`
- `AddressGroup.spec.defaultAction`
- `AddressGroup.spec.description`
- `AddressGroup.spec.comment`
- `AddressGroup.spec.logs`
- `AddressGroup.spec.trace`
- `HostBinding.spec.addressGroup`
- `HostBinding.spec.host`
- `ServiceBinding.spec.addressGroup`
- `ServiceBinding.spec.service`
- `NetworkBinding.spec.addressGroup`
- `NetworkBinding.spec.network`
