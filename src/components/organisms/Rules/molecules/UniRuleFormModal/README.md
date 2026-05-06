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

On narrow screens, the overview sidebar is hidden and the form keeps the same internal scroll behavior.

## Form Model

The form stores UI-friendly values:

- `namespace` and `name` identify the Rule.
- `displayName`, `action`, `traffic`, `description`, and `comment` map to editable `spec` fields.
- `local` and `remote` endpoint blocks map to `spec.endpoints.local` and `spec.endpoints.remote`.
- Transport panel values normalize back to `spec.transport` at submit time.

`traffic` is stored in the form as the capitalized select value (`Both`, `Ingress`, or `Egress`) and saved with the same casing.

Edit prefill normalizes backend traffic values before calling `setFieldsValue` so AntD can match the current select option.

Endpoint types currently supported by the modal are `AddressGroup`, `Service`, `FQDN`, and `CIDR`.

For `AddressGroup` endpoints, the endpoint namespace scopes the visible options. The modal uses the cluster-wide AddressGroup list for the shared lookup graph and merges in the Local and Remote namespace-scoped query results as fallbacks. If a namespace-scoped AddressGroup response omits `metadata.namespace`, the selected endpoint namespace is applied before options are built. Services still use the shared service option list and are scoped client-side by the chosen endpoint namespace.

## Validation

AntD form validation runs before the create or patch flow reads the full form store.

- `namespace`, `name`, and selected endpoint resource identifiers use Kubernetes DNS label validation with a 63 character limit.
- `displayName` is optional and limited to 63 characters.
- `action`, `traffic`, endpoint types, IP family, and protocol are checked against local `v3` / `v3sgroups` enum values.
- Local endpoints are limited to `AddressGroup` and `Service`.
- Remote endpoints allow `AddressGroup`, `Service`, `FQDN`, and `CIDR`.
- `FQDN` values must match the shared hostname-like FQDN validator.
- `CIDR` values must pass the shared IPv4/IPv6 CIDR validator.
- TCP/UDP port entries accept comma-separated ports and ranges, for example `80,443` or `1000-2000`.
- ICMP type entries accept integer values from `0` through `255`.
- Transport is optional when the whole Ports panel is empty. Once a protocol or transport entry is provided, the form requires the matching IP family/protocol/entry combination before submit.

Validation source priority is the local `v3` / `v3sgroups` OpenAPI shape for current `sgroups.io/v1alpha1` resources, with `tmp/newApi` rule docs used only for legacy rule-variant transport semantics.

## Create Flow

Create submits a single `Rule` resource.

There are no Host, Service, Network, or AddressGroup binding resources in this flow. Endpoint references are written directly into the Rule payload.

Create payloads normalize `spec.session.traffic` to the local OpenAPI enum casing (`Both`, `Ingress`, or `Egress`).

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

In edit mode, changed Local or Remote endpoint selections are shown with a subtle green background and left accent on both the Local/Remote overview wrapper and the changed endpoint root node. This highlight is based on normalized endpoint payload comparison, so unchanged fields do not mark the overview.

Endpoint tree keys are recursively prefixed with the wrapping overview key. This keeps repeated endpoint keys such as `service-endpoint`, `address-group-endpoint`, namespace groups, and their nested transport or binding children unique when Local and Remote render similar resources in the same AntD Tree.

Overview graph lookups do not block form initialization after the form is ready. The sidebar renders from currently available data, so slow or disabled related-resource queries should produce partial or empty overview content rather than an infinite loading state.

## Lifecycle

The parent conditionally renders the modal only while it is open. The modal also uses AntD `destroyOnHidden` and resets refs/state after close.

Edit prefill should run once per open cycle after resources needed for the form are ready. Modal loading gates should use React state, not refs read during render.
