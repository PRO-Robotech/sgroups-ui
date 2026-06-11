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

In edit mode, the resource title is rendered at the top of the AntD form. The canonical `Service` badge is static; the adjacent display-name text has a pencil action that toggles an inline `displayName` input. Keep this title field inside the `Form` tree so AntD validation, submit, and reset behavior continue to include it. Create mode keeps the normal body `Display name` field.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Service. `name` is hidden in create and edit; create mode generates a UUID value and keeps it registered in the form store.
- Tenant option labels and search text use `spec.displayName`, falling back to `metadata.name`; option values remain `metadata.name` for API namespaces.
- `displayName`, `description`, and `comment` map to editable `spec` fields. In edit mode, `displayName` is edited from the title pencil instead of a body form row.
- `addressGroupNamespace` is hidden legacy form state kept for compatibility; Cascader branch loading is driven by modal state, not by this field.
- `addressGroups` stores selected AddressGroups as namespaced values.
- AddressGroup selection uses a multi-select Cascader. The first level is namespace and the second level is AddressGroup. AddressGroups can be selected from any namespace; each namespace branch is loaded only when needed.
- Selected AddressGroup tags include namespace and AddressGroup badges. AddressGroup option labels and search text use `spec.displayName`, falling back to the AddressGroup name only when no display name exists.
- Namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal applies the Cascader branch namespace before building options so AntD can resolve selected values to badge labels.
- `transportEntries` stores repeated UI rows and is normalized back to `spec.transports` only at submit time.

The submit handler validates and reads the full form store, including fields hidden behind the segmented panel.

Changing or expanding one AddressGroup namespace does not clear selections from other namespaces. Submit preserves selected `namespace/name` values across namespaces.

## Validation

The modal uses AntD form rules for backend-backed constraints:

- `namespace`: required Kubernetes resource namespace, max 63 chars.
- `name`: hidden required Kubernetes resource name, generated as a UUID in create mode, max 63 chars.
- `displayName`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `services-` plus six random digits.
- `addressGroupNamespace`: hidden compatibility field; not user-editable.
- `transportEntries[].IPv`: required, must be `IPv4` or `IPv6`.
- `transportEntries[].protocol`: required, must be `TCP`, `UDP`, or `ICMP`.
- `transportEntries[].ports`: required for `TCP` and `UDP`; accepts comma-separated ports and ranges.
- `transportEntries[].types`: used for `ICMP`; accepts numeric values from `0` to `255`.

The local `v2` and `v3sgroups` OpenAPI ServiceSpec declares service text fields as strings and transport enums for IP family and protocol. The display-name length comes from the extracted backend validator in `tmp`; `description` and `comment` currently have no stricter documented limits.

## Create Flow

Create submits the Service first, then creates one `ServiceBinding` per selected AddressGroup.

The create payload uses the hidden generated `name` as `metadata.name`; users do not type resource names in this modal.

Each binding:

- is created in the Service namespace
- points `spec.service` to the Service name and namespace
- points `spec.addressGroup` to the selected AddressGroup name and namespace

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

AddressGroup membership for Services is managed only through `ServiceBinding` resources.

## Edit Flow

Edit mode receives an existing `service` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build patch and binding endpoints.
- The modal does not use PUT.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- `spec.transports` is patched only when normalized transport data changed.
- AddressGroup selection is initialized from existing `ServiceBinding` resources.
- AddressGroup Cascader selections are initialized from existing `ServiceBinding.spec.addressGroup` values.
- Removed selections delete bindings.
- Added selections create bindings in the Service namespace.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar is built from selected AddressGroups and the current host, network, and service binding graph. Selected AddressGroups can span namespaces and are grouped by namespace first. Each namespace contains its selected AddressGroup children. Each AddressGroup child reuses the AddressGroup contents tree builder.

In edit mode, newly selected AddressGroups are shown with a high-contrast green highlight, left accent, bold text, and an `Added` marker. The pending Service binding is also injected into that AddressGroup branch and marked as `Added` so the overview previews the post-save graph.

Each selected AddressGroup overview node passes its own `overview-{namespace/name}` key as the tree key prefix. Nested namespace, section, binding, transport, entry, empty, and error keys then extend their parent key so repeated resources remain unique across the full AntD Tree.

The overview tree is remounted when AddressGroup selection changes. Overview graph fetches do not block the form after initial prefill; the sidebar renders from currently available data instead of holding an infinite spinner.

Selected AddressGroup nodes and resolved resource children include a small detail-link icon next to their badges. Detail links use resource namespaces and immutable `metadata.name`; display names remain label-only.

The overview tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` here unless the product explicitly needs initial expansion.

## Transport Rules

Transport entries support `TCP`, `UDP`, and `ICMP`.

- `TCP` and `UDP` entries use `ports`, including comma-separated values and ranges such as `80,443` or `1000-2000`.
- `ICMP` entries use numeric `types` from `0` to `255`.
- Empty or incomplete transport rows are omitted by normalization.

## Lifecycle

Set `mask={{ closable: false }}` on the AntD `Modal`. Backdrop clicks must not close the modal; use the Cancel button or close icon for explicit close actions.

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close.

Edit prefill should run once per open cycle after resources needed for the form are ready. AddressGroup Cascader branches are loaded lazily by namespace; prefilled selections may add their namespaces to the Cascader tree before those branches are opened. Keep segmented panel state independent from shared overview data so hidden panel fields do not break submit or overview rendering.

Use field-specific AntD watchers for `addressGroups`. Watching the whole form can return an empty object before initialization and accidentally disable dependent queries.
