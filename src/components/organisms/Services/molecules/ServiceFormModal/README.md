# ServiceFormModal

Modal for creating and editing `Service` resources, their transport entries, and their AddressGroup membership through `ServiceBinding` resources.

## Files

- `ServiceFormModal.tsx`: modal shell, AntD form, segmented Info/Ports panels, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, and editable spec patch logic.
- `transportUtils.ts`: conversion between UI transport rows and `spec.transports`.
- `styled.ts`: modal layout, two-column grid, overview sidebar, segmented panels, and loading state styles.
- `index.ts`: public export.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Service.
- `displayName`, `description`, and `comment` map to editable `spec` fields.
- `addressGroups` stores selected AddressGroups as namespaced values.
- `transportEntries` stores repeated UI rows and is normalized back to `spec.transports` only at submit time.

The submit handler validates and reads the full form store, including fields hidden behind the segmented panel.

## Create Flow

Create submits the Service first, then creates one `ServiceBinding` per selected AddressGroup.

Each binding:

- is created in the Service namespace
- points `spec.service` to the Service name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

AddressGroup membership for Services is managed only through `ServiceBinding` resources.

## Edit Flow

Edit mode receives an existing `service` prop.

- `namespace` and `name` are read-only identifiers.
- The modal does not use PUT.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- `spec.transports` is patched only when normalized transport data changed.
- AddressGroup selection is initialized from existing `ServiceBinding` resources.
- Removed selections delete bindings.
- Added selections create bindings in the Service namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Transport Rules

Transport entries support `TCP`, `UDP`, and `ICMP`.

- `TCP` and `UDP` entries use `ports`, including comma-separated values and ranges such as `80,443` or `1000-2000`.
- `ICMP` entries use numeric `types` from `0` to `255`.
- Empty or incomplete transport rows are omitted by normalization.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnClose` and resets refs/state after close.

Edit prefill should run once per open cycle after the full async resource set is ready. Keep segmented panel state independent from shared overview data so hidden panel fields do not break submit or overview rendering.
