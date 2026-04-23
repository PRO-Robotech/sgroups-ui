# Services

## Create modal

The bottom `Add Service` button opens `ServiceFormModal`.

The modal follows the Figma layout structure, but the payload and editable fields follow the local `v2` `sgroups.io/v1alpha1` schema:

- `Namespace`: required. Service namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional.
- `Address group`: optional multi-select. Loaded from all namespaces and displayed as `namespace / displayName-or-name`.
- `Description`: optional.
- `Comment`: optional.
- `Transports`: UI-friendly repeated entries that are normalized into `spec.transports` at submit time.

## API flow

The save flow creates the main resource first:

```ts
Service
```

Then it creates one binding per selected AddressGroup:

```ts
ServiceBinding
```

Each binding:

- is created in the selected Service namespace
- points `spec.service` to the current Service name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

The UI does not write a refs-like field on Service. AddressGroup membership is managed through `ServiceBinding` resources.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `ServiceFormModal` for a selected Service by passing it as the optional `service` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
- The modal does not use PUT.
- Edit save patches only changed fields and patches `spec.transports`.
- Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared.
- Changed values are saved with `patchEntryWithReplaceOp`.
- AddressGroup membership is initialized from existing `ServiceBinding` resources and remains editable.
- Removing a selected AddressGroup deletes the corresponding binding.
- Adding a selected AddressGroup creates the corresponding binding in the Service namespace.
- If no editable field changed and no binding changed, no update request is sent.

## Delete modal

The table delete action opens the toolkit `DeleteModal`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / services / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- Segmented content reads and submits the full form store, not only the currently visible panel fields.
- Transport data is kept UI-friendly in the form and normalized back to `spec.transports` only at submit time.

## Schema source

The implementation follows the local `v2` OpenAPI dump for `sgroups.io/v1alpha1` resources.

Relevant fields:

- `Service.spec.displayName`
- `Service.spec.description`
- `Service.spec.comment`
- `Service.spec.transports`
- `ServiceBinding.spec.addressGroup`
- `ServiceBinding.spec.service`
