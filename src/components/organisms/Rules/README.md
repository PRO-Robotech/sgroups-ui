# Rules

## Create modal

The bottom `Add UniRule` button opens `UniRuleFormModal`.

The modal follows the Figma layout structure, but the payload and editable fields follow the local `v3` / `v3sgroups` `sgroups.io/v1alpha1` schema. Older `tmp/newApi` rule docs are used only to confirm practical create-time validation behavior for TCP/UDP and ICMP rule variants.

- `Tenant`: required. Rule namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: hidden. Create mode generates a UUID value for `metadata.name` and keeps it in the form store for submit.
- `Display name`: optional, max 63 chars. Uses the shared hostname-label validator: letters, numbers, hyphens, and optional dots; a dot is not required. Create mode is prefilled with `rules-`.
- `Action`: required. AntD validates `Allow` or `Deny`.
- `Traffic`: required. UI labels and saved `spec.session.traffic` values are `Both`, `Ingress`, or `Egress`.
- `Local`: required endpoint block.
- `Remote`: required endpoint block.
- `Description`: optional.
- `Comment`: optional.
- `IP family`: transport selector. Required when Remote is not `Service`; otherwise optional until transport data is entered. `IPv4` or `IPv6`.
- `Protocol`: transport selector. Required when Remote is not `Service`; otherwise optional until transport data is entered. `TCP`, `UDP`, or `ICMP`.
- `Transport entries`: repeated section. Required when Remote is not `Service`; otherwise optional until transport data is entered.
  - selecting a protocol auto-adds and expands the first blank entry if the section is empty
  - for `TCP` and `UDP`, each entry uses `ports`
  - for `ICMP`, each entry uses `types`
  - each entry may also include optional `description` and `comment`
  - if transport entries are filled, `IP family` and `Protocol` become required

## Endpoint rules

The current `RuleEndpoint` CRD supports these types:

- `AddressGroup`
- `Service`
- `FQDN`
- `CIDR`

For `AddressGroup` and `Service` endpoints:

- the form stores `namespace` and `name` separately
- namespace is not locked to the rule namespace
- the visible selector is an AntD Cascader with namespace as the first level and resource name as the second level
- the endpoint namespace field is hidden but remains registered in the form store; selecting a Cascader leaf updates both endpoint `namespace` and `name`
- visible labels and search text use `spec.displayName`, falling back to the resource name only when no display name exists
- submitted endpoint values remain the selected resource names and namespaces because the backend stores references by identifier
- services can be chosen from any namespace
- AddressGroup options are grouped by namespace, using the cluster-wide AddressGroup list plus local/remote namespace-scoped query results as fallbacks
- namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal fills it from the selected endpoint namespace before building options
- selected resource namespace and name are validated as Kubernetes DNS labels, max 63 chars

For string endpoints:

- `FQDN` is validated as a hostname-like FQDN
- `CIDR` is validated for backend canonical IPv4 and IPv6 CIDR form. Non-zero host bits are rejected, for example `10.0.0.1/24`; full host prefixes like `192.168.1.1/32` are valid.

## API flow

The save flow creates the main resource directly:

```ts
Rule
```

There are no binding resources in the UniRule modal flow. Endpoint references are written directly into:

```ts
Rule.spec.endpoints.local
Rule.spec.endpoints.remote
```

Transport data is written into:

```ts
Rule.spec.transport
```

Session direction is written into:

```ts
Rule.spec.session
```

## Backend Casing Workaround

Traffic values are normalized to the local OpenAPI enum casing (`Both`, `Ingress`, or `Egress`) before form prefill and before writes.

## Table display

The Rules table uses badge/tag formatting consistently:

- `Display Name` is the first pinned column and renders a canonical `Rule` badge. It shows `spec.displayName`, falling back to `metadata.name` only when the display name is empty.
- The `Display Name` value links to the Rule detail page at `rules/{namespace}/{metadata.name}`. The link text uses the display name, but the URL uses immutable identifiers.
- `Name` is intentionally hidden from the table, but remains in row data for edit/delete endpoints.
- `Tenant` renders a canonical `Tenant` badge.
- `Local` and `Remote` render canonical resource-kind badges for `AddressGroup` and `Service` endpoints using the referenced resource display name when available, falling back to the referenced resource name only when no display name exists. Those concrete resource values link to their internal detail pages using the referenced namespace and `metadata.name`. `FQDN` and `CIDR` endpoints render their direct values.
- `Action` renders as an AntD tag.
- Transport details stay available in the verbose panel and modal, but the compact table does not show `Protocol`, `IP family`, or `Ports / Types` columns.
- The `Protocol`, `IP Family`, and `Ports / Types` table column definitions remain commented in `tableConfig.ts` so they can be restored without rebuilding the transport renderers.
- `Local`, `Remote`, and `Created` are intentionally wider than compact enum columns so common endpoint labels and timestamps wrap less often.

## Edit modal

The table `Actions` column uses the same compact three-dot dropdown pattern as `openapi-ui`. Edit and delete are menu items inside that row dropdown.

Edit opens the same `UniRuleFormModal` for a selected Rule by passing it as the optional `rule` prop.

In edit mode:

- `Tenant` and `Name` are hidden immutable identifiers because they identify the resource endpoint.
- The edit modal header prefers `spec.displayName` and falls back to `metadata.name`.
- The modal does not use PUT.
- Edit save patches only changed fields.
- Optional string fields are deleted with `patchEntryWithDeleteOp` when cleared.
- Changed values are saved with `patchEntryWithReplaceOp`.
- If nothing changed, no update request is sent.

Patched fields are currently:

- `Rule.spec.displayName`
- `Rule.spec.action`
- `Rule.spec.description`
- `Rule.spec.comment`
- `Rule.spec.endpoints.local`
- `Rule.spec.endpoints.remote`
- `Rule.spec.session`
- `Rule.spec.transport`

## Delete modal

The table delete action opens `SgroupsDeleteModal`, a local wrapper around the toolkit delete request behavior.

The modal title renders `Delete`, a canonical `Tenant` badge with the row namespace, then a canonical `Rule` badge with `spec.displayName` falling back to `metadata.name`.

The delete endpoint is built from the selected row `metadata.namespace` and `metadata.name`:

```ts
;/api/celrsstu / { cluster } / k8s / apis / sgroups.io / v1alpha1 / namespaces / { namespace } / rules / { name }
```

If the row namespace is missing, the current screen namespace is used as a fallback.

## Validation Notes

The implementation validates with AntD before building the save payload.

- `Action`, `Traffic`, endpoint type, IP family, and protocol are checked against local enum values from the `v3` / `v3sgroups` schema.
- Local endpoints can only be `AddressGroup` or `Service`.
- Remote endpoints can be `AddressGroup`, `Service`, `FQDN`, or `CIDR`.
- `TCP` and `UDP` transport entries validate single ports and ranges like `80,443` or `1000-2000`
- `ICMP` entries validate type values from `0` to `255`
- `spec.transport` is required when the Remote endpoint is not `Service`
- selecting a protocol requires at least one transport entry
- selecting a protocol auto-adds and expands the first blank transport entry in the Ports panel when none exists yet
- adding a transport entry requires both protocol and IP family
- transport payload may be omitted only when the Remote endpoint is `Service` and the whole transport section is empty
- nested transport entry edits revalidate the protocol and IP family selector errors so a valid port or ICMP type immediately clears stale selector-level validation messages
- Remote endpoint type changes revalidate the transport selectors so switching between `Service` and non-service remotes updates required transport errors immediately

## Structure overview

The right sidebar renders a `Structure Overview` tree with separate top-level `Local` and `Remote` sections.

- `AddressGroup` and `Service` endpoints reuse the existing rule verbose tree builder
- `AddressGroup` and `Service` endpoint summaries and tree labels resolve referenced resource display names before rendering
- the tree expands through the current host, network, and service binding graph
- AddressGroup endpoint contents are grouped by resource namespace before individual HostBinding, NetworkBinding, and ServiceBinding badge nodes
- each binding badge node expands to the resolved Host, Network, or Service resource badge and its details
- `FQDN` and `CIDR` endpoints render as direct endpoint leaves
- local and remote endpoint children are recursively prefixed by `overview-local` or `overview-remote` so repeated endpoint shapes keep unique AntD Tree keys
- overview graph lookups do not block modal initialization after the form is ready; the sidebar renders from currently available data
- the tree starts collapsed by default; users expand Local, Remote, endpoint, namespace, and resource branches as needed

## Modal lifecycle

- AntD modals must set `maskClosable={false}`. Users should close modals only with the Cancel button or the close icon.
- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- Edit prefill runs once per open cycle after the async resources needed for the form are ready, including endpoint options for selected AddressGroup and Service endpoints so Cascader labels render like create selections.
- The loading state uses React state, not refs read during render.

## Schema Source

The implementation follows the local `v3` / `v3sgroups` OpenAPI dumps for the current `sgroups.io/v1alpha1` resource shape. The `tmp/newApi` rule docs are reference material for legacy rule-specific required fields and transport validation semantics.

Relevant fields:

- `Rule.spec.displayName`
- `Rule.spec.action`
- `Rule.spec.description`
- `Rule.spec.comment`
- `Rule.spec.endpoints.local`
- `Rule.spec.endpoints.remote`
- `Rule.spec.session.traffic`
- `Rule.spec.transport.IPv`
- `Rule.spec.transport.protocol`
- `Rule.spec.transport.entries`
