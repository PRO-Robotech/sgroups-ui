# UniRuleFormModal

Modal for creating and editing `Rule` resources. Unlike the resource membership modals, this flow writes endpoint references directly into the Rule spec and does not create binding resources.

## Files

- `UniRuleFormModal.tsx`: modal shell, AntD form, segmented panels, async resource loading, create/edit submit flow, and lifecycle reset.
- `types.ts`: component props and form value model.
- `utils.tsx`: endpoint normalization, transport normalization, overview tree data, validation helpers, and editable spec patch logic.
- `styled.ts`: fixed-height modal layout, two-column grid, independent form/overview scrolling, overview sidebar, segmented panels, and loading state styles.
- `index.ts`: public export.

## Layout

The modal body is a fixed-height, viewport-bounded two-column shell. The left form column scrolls internally through the AntD form, while the right Structure Overview keeps its title fixed and scrolls only the overview body.

In edit mode, the resource title is rendered at the top of the AntD form. The canonical `UniRule` badge is static; the adjacent display-name text has a pencil action that toggles an inline `displayName` input. Keep this title field inside the `Form` tree so AntD validation, submit, and reset behavior continue to include it. Create mode keeps the normal body `Display name` field.

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Rule. `name` is hidden in create and edit; create mode generates a UUID value and keeps it registered in the form store.
- `displayName`, `action`, `traffic`, `description`, and `comment` map to editable `spec` fields. In edit mode, `displayName` is edited from the title pencil instead of a body form row.
- `local` and `remote` endpoint blocks map to `spec.endpoints.local` and `spec.endpoints.remote`.
- Transport panel values normalize back to `spec.transport` at submit time.

`traffic` is stored in the form as the capitalized select value (`Both`, `Ingress`, or `Egress`) and saved with the same casing.

Edit prefill normalizes backend traffic values before calling `setFieldsValue` so AntD can match the current select option. It also waits for endpoint resource options needed by the current Local and Remote endpoint types, so prefilled AddressGroup and Service selections render with the same badge labels as create-mode selections.

Endpoint types currently supported by the modal are `AddressGroup`, `Service`, `FQDN`, and `CIDR`.

For `AddressGroup` and `Service` endpoints, Local and Remote render one Cascader selector instead of separate visible Tenant and Name selects. The first Cascader level is namespace and the second level is the selected resource. The form still stores `namespace` and `name` separately under the endpoint block so submit, validation, and patch comparison keep the backend reference shape.

For `AddressGroup` endpoints, the modal uses the cluster-wide AddressGroup list for the shared lookup graph and merges in the Local and Remote namespace-scoped query results as fallbacks. If a namespace-scoped AddressGroup response omits `metadata.namespace`, the selected endpoint namespace is applied before options are built. Services use the shared service option list. Both resource types are grouped by namespace in the Cascader.

AddressGroup and Service endpoint option labels and search text use `spec.displayName`, falling back to the resource name only when no display name exists. Submitted endpoint payloads still store resource names and namespaces because the backend references resources by identifier.

## Validation

AntD form validation runs before the create or patch flow reads the full form store.

- `namespace`, hidden generated `name`, and selected endpoint resource identifiers use Kubernetes DNS label validation with a 63 character limit.
- `displayName` is optional and limited to 63 characters. It uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `rules-` plus six random digits.
- `action`, `traffic`, endpoint types, IP family, and protocol are checked against local `v3` / `v3sgroups` enum values.
- Local endpoints are limited to `AddressGroup` and `Service`.
- Remote endpoints allow `AddressGroup`, `Service`, `FQDN`, and `CIDR`.
- `FQDN` values must match the shared hostname-like FQDN validator.
- `CIDR` values must pass the shared backend-aligned IPv4/IPv6 CIDR validator. Non-zero host bits are rejected, for example `10.0.0.1/24`; full host prefixes like `192.168.1.1/32` are valid.
- TCP/UDP port entries accept comma-separated ports and ranges, for example `80,443` or `1000-2000`.
- ICMP type entries accept integer values from `0` through `255`.
- Selecting a protocol in the Ports panel initializes and expands one blank transport entry when no entry exists yet. The blank entry is only UI state; it does not produce `spec.transport` until the user fills ports, ICMP types, description, or comment.
- Transport is required when the Remote endpoint is not `Service`. Non-service remotes must submit `spec.transport` with IP family, protocol, and at least one transport entry.
- Transport remains optional for Remote `Service` endpoints when the whole Ports panel is empty. Once a protocol or transport entry is provided, the form requires the matching IP family/protocol/entry combination before submit.
- The protocol and IP family field validators depend on nested `transportEntries` values and Remote endpoint type. Keep `onValuesChange` revalidation for those selector fields when a transport row or Remote endpoint changes, otherwise AntD can leave stale selector-level errors visible after the required transport state changes.

Validation source priority is the local `v3` / `v3sgroups` OpenAPI shape for current `sgroups.io/v1alpha1` resources, with `tmp/newApi` rule docs used only for legacy rule-variant transport semantics.

## Create Flow

Create submits a single `Rule` resource.

The create payload uses the hidden generated `name` as `metadata.name`; users do not type resource names in this modal.

There are no Host, Service, Network, or AddressGroup binding resources in this flow. Endpoint references are written directly into the Rule payload.

Create payloads normalize `spec.session.traffic` to the local OpenAPI enum casing (`Both`, `Ingress`, or `Egress`).

Create mode accepts optional `initialValues` from related detail pages. These values are merged into the default create form values before the one-time create prefill runs, so callers can preselect a Local or Remote endpoint while keeping the generated Rule name and default action/session values.

AddressGroup and Service detail `Rules` tabs pass these values from their segmented Add flow:

- `Rules from`: preselects the current resource as the Local endpoint.
- `Rules to`: preselects the current resource as the Remote endpoint.

## Edit Flow

Edit mode receives an existing `rule` prop.

- `namespace` and `name` are hidden immutable identifiers; keep their values registered in the AntD form store so submit can build the patch endpoint.
- The modal does not use PUT.
- Editable fields are patched only when changed.
- Cleared optional strings use `patchEntryWithDeleteOp`.
- Changed values use `patchEntryWithReplaceOp`.
- If nothing changed, no update request is sent.

Patch requests are intentionally executed one at a time. The backend can reject concurrent updates, so keep this flow sequential even when several fields changed.

Patched fields include:

- `spec.displayName`
- `spec.action`
- `spec.description`
- `spec.comment`
- `spec.endpoints.local`
- `spec.endpoints.remote`
- `spec.session`
- `spec.transport`

## Structure Overview

The sidebar wraps local and remote endpoint trees under `overview-local` and `overview-remote`. AddressGroup endpoint contents inherit the verbose rule tree shape, including namespace grouping for Hosts, Networks, and Services.

The Local and Remote overview count badges count configured endpoint roots only. Empty placeholder leaves such as `No endpoint configured` must stay visible in the tree but must not increment the badge count.

In edit mode, changed Local or Remote endpoint selections are shown with a high-contrast green highlight, left accent, bold text, and a `Changed` marker on both the Local/Remote overview wrapper and the changed endpoint root node. This highlight is based on normalized endpoint payload comparison, so unchanged fields do not mark the overview.

Endpoint tree keys are recursively prefixed with the wrapping overview key. This keeps repeated endpoint keys such as `service-endpoint`, `address-group-endpoint`, namespace groups, and their nested transport or binding children unique when Local and Remote render similar resources in the same AntD Tree.

Overview graph lookups do not block form initialization after the form is ready. The sidebar renders from currently available data, so slow or disabled related-resource queries should produce partial or empty overview content rather than an infinite loading state.

The overview tree starts collapsed by default. Do not set `defaultExpandAll` or `defaultExpandedKeys` here unless the product explicitly needs initial expansion.

## Lifecycle

Set `maskClosable={false}` on the AntD `Modal`. Backdrop clicks must not close the modal; use the Cancel button or close icon for explicit close actions.

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close.

Edit prefill should run once per open cycle after resources needed for the form are ready, including endpoint resource options for selected AddressGroup and Service endpoints. Cascader values are derived from the stored endpoint `namespace` and `name`; keep those hidden fields registered so reopening and patch payloads stay stable. Modal loading gates should use React state, not refs read during render.

Use field-specific AntD watchers for Local and Remote endpoint blocks. Watching the whole form can return an empty object before initialization and accidentally disable endpoint option queries that need edit-mode endpoint namespaces.
