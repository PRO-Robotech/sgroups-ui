# AddressGroupFormModal

Modal for creating and editing `AddressGroup` resources and their host, service, and network bindings.

## Files

- `AddressGroupFormModal.tsx`: modal shell, AntD form, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: binding diff helpers, overview tree data, and editable spec patch logic.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

In edit mode, the resource title is rendered at the top of the AntD form. The canonical `AddressGroup` badge is static; the adjacent display-name text has a pencil action that toggles an inline `displayName` input. Keep this title field inside the `Form` tree so AntD validation, submit, and reset behavior continue to include it. Create mode keeps the normal body `Display name` field.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the AddressGroup. `name` is hidden in create and edit; create mode generates a UUID value and keeps it registered in the form store.
- `displayName`, `allowAccess`, `description`, and `comment` map to editable `spec` fields. In edit mode, `displayName` is edited from the title pencil instead of a body form row.
- `hosts` and `networks` are selected by name from the AddressGroup namespace and synced through binding resources. Their visible select labels and search text use `spec.displayName`, falling back to the resource name only when no display name exists.
- `services` are selected as `namespace/name` values from all namespaces and synced through binding resources. Their visible select labels and search text use `spec.displayName` with namespace context, falling back to the service name only when no display name exists.

Do not write `AddressGroup.refs` from this modal. It is backend-computed data.

## Validation

AntD form validation mirrors the local `v2`/`v3sgroups` schema and backend validation from `tmp/sgroups`:

- `namespace`: required Kubernetes resource name, max 63 characters.
- `name`: hidden required Kubernetes resource name, generated as a UUID in create mode, max 63 characters.
- `displayName`: optional, max 63 characters. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `addressgroups-` plus six random digits.
- `defaultAction`: controlled by the Allow access switch and submitted as `Allow` or `Deny`.
- `description` and `comment`: optional strings. The current schema does not define stricter client-side limits for these fields.

Validation failures should stop submit before any create, patch, or binding request is sent.

## Create Flow

Create submits the AddressGroup first, then creates selected bindings:

- `HostBinding` in the AddressGroup namespace.
- `NetworkBinding` in the AddressGroup namespace.
- `ServiceBinding` in the selected Service namespace.

Hosts and Networks are selected from the future AddressGroup namespace. Services can be selected from any namespace. Select option labels and search text show display names when present; option values still use names or `namespace/name` identifiers for binding payloads.

The create payload uses the hidden generated `name` as `metadata.name`; users do not type resource names in this modal.

Changing `namespace` clears the selected Hosts and Networks because those selections are scoped to the future AddressGroup namespace. It must not clear selected Services; Service bindings are created in each selected Service namespace.

Binding requests are intentionally executed one at a time. The backend can reject concurrent binding sync with serialization errors, so do not replace this with `Promise.all`.

## Edit Flow

Edit mode receives an existing `addressGroup` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build patch endpoints.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- Selected Hosts, Services, and Networks are initialized from existing bindings, not from `refs`.
- Removed selections delete bindings.
- Added selections create bindings.
- If no editable fields or bindings changed, no update request is sent.

Patch and binding requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields or bindings changed.

## Structure Overview

The sidebar renders a single AddressGroup contents tree from the selected Hosts, Services, and Networks. Hosts, Networks, and Services are grouped by resource namespace before individual resource nodes.

Create mode builds synthetic binding objects from the current form selection so the overview can reuse the same AddressGroup contents tree as edit mode and verbose panels. The hidden generated AddressGroup `name` is used as the stable pending internal name; otherwise the shared tree filters can drop selected resources because the synthetic binding target does not match the tree root.

In edit mode, newly added selections are shown with a high-contrast green highlight, left accent, bold text, and an `Added` marker. Removed selections disappear from the overview immediately because the sidebar reflects the current form selection, not the saved backend state.

Tree keys are parent-derived by the shared contents tree builder, including the namespace grouping layer. If this tree is later embedded under another overview node, pass that parent key as the builder prefix instead of relying on short repeated section keys.

The AddressGroup root node and resolved Host, Network, and Service child nodes include a small detail-link icon next to their badges. Detail links use the resource namespace and immutable `metadata.name`; display names remain label-only.

The overview tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` here unless the product explicitly needs initial expansion.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close. This hard reset is intentional because partial async prefills can leave AntD multi-selects visually broken on reopen.

Edit prefill should run once per open cycle after the full async resource set is ready.
