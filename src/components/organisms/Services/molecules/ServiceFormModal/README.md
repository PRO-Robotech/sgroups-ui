# ServiceFormModal

Modal for creating and editing `Service` resources, their transport entries, and their AddressGroup membership through `ServiceBinding` resources.

## Files

- `ServiceFormModal.tsx`: modal shell, AntD form, segmented Info/Ports panels, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: current binding lookup, binding diff helpers, overview tree data, and editable spec patch logic.
- `transportUtils.ts`: conversion between UI transport rows and `spec.transports`.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, segmented panels, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Service.
- `displayName`, `description`, and `comment` map to editable `spec` fields.
- `addressGroups` stores selected AddressGroups as namespaced values.
- `transportEntries` stores repeated UI rows and is normalized back to `spec.transports` only at submit time.

The submit handler validates and reads the full form store, including fields hidden behind the segmented panel.

## Validation

The modal uses AntD form rules for backend-backed constraints:

- `namespace`: required Kubernetes resource namespace, max 63 chars.
- `name`: required Kubernetes resource name, max 63 chars.
- `displayName`: optional, max 63 chars.
- `transportEntries[].IPv`: required, must be `IPv4` or `IPv6`.
- `transportEntries[].protocol`: required, must be `TCP`, `UDP`, or `ICMP`.
- `transportEntries[].ports`: required for `TCP` and `UDP`; accepts comma-separated ports and ranges.
- `transportEntries[].types`: used for `ICMP`; accepts numeric values from `0` to `255`.

The local `v2` and `v3sgroups` OpenAPI ServiceSpec declares service text fields as strings and transport enums for IP family and protocol. The display-name length comes from the extracted backend validator in `tmp`; `description` and `comment` currently have no stricter documented limits.

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

## Structure Overview

The sidebar is built from selected AddressGroups and the current host, network, and service binding graph. It reuses the AddressGroup contents tree builder.

In edit mode, newly selected AddressGroups are shown with a subtle green background and left accent. The pending Service binding is also injected into that AddressGroup branch so the overview previews the post-save graph.

Each selected AddressGroup overview node passes its own `overview-{namespace/name}` key as the tree key prefix. Nested section, binding, transport, entry, empty, and error keys then extend their parent key so repeated resources remain unique across the full AntD Tree.

## Transport Rules

Transport entries support `TCP`, `UDP`, and `ICMP`.

- `TCP` and `UDP` entries use `ports`, including comma-separated values and ranges such as `80,443` or `1000-2000`.
- `ICMP` entries use numeric `types` from `0` to `255`.
- Empty or incomplete transport rows are omitted by normalization.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close.

Edit prefill should run once per open cycle after the full async resource set is ready. Keep segmented panel state independent from shared overview data so hidden panel fields do not break submit or overview rendering.
