# AddressGroups

## Create modal

The bottom `Add Address Group` button opens `AddressGroupFormModal`.

The modal is based on the Figma form layout and uses Ant Design form controls:

- `Namespace`: required. AddressGroup namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional. Max 63 characters.
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

The table actions column includes edit and delete actions.

Edit opens the same `AddressGroupFormModal` for a selected AddressGroup by passing it as the optional `addressGroup` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- `Display name`, `Allow access`, `Description`, and `Comment` are editable and saved with patch helpers from the toolkit.
- Edit save patches only changed fields. Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared, and changed values are saved with `patchEntryWithReplaceOp`.
- Hosts, services, and networks are initialized from existing bindings and are editable.
- Removing a selected host, service, or network deletes the corresponding binding.
- Adding a selected host, service, or network creates the corresponding binding.
- In edit mode, namespace-scoped resource and binding queries must start from `addressGroup.metadata.namespace` immediately. Waiting for the form watcher alone causes partial prefills.
- Edit prefill should run only once per modal open, after host/network/service binding queries are ready. Repeated partial `setFieldsValue` calls can leave AntD selects visually stuck on reopen.
- Resource badge rendering is reused from the table formatter for the modal title, options, tags, and overview.

## Delete modal

The table delete action opens the toolkit `DeleteModal`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu /
  { cluster } /
  k8s /
  apis /
  sgroups.io /
  v1alpha1 /
  namespaces /
  { namespace } /
  addressgroups /
  { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- That hard reset is intentional. Soft resets were not enough for AntD multi-select state in this flow.

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
