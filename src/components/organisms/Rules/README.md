# Rules

## Create modal

The bottom `Add UniRule` button opens `UniRuleFormModal`.

The modal follows the Figma layout structure, but the payload and editable fields follow the local `v3` / `v3sgroups` `sgroups.io/v1alpha1` schema. Older `tmp/newApi` rule docs are used only to confirm practical create-time validation behavior for TCP/UDP and ICMP rule variants.

- `Namespace`: required. Rule namespace. Kubernetes DNS label format, max 63 chars.
- `Name`: required. Kubernetes DNS label format, max 63 chars.
- `Display name`: optional, max 63 chars.
- `Action`: required. AntD validates `Allow` or `Deny`.
- `Traffic`: required. UI labels and saved `spec.session.traffic` values are `Both`, `Ingress`, or `Egress`.
- `Local`: required endpoint block.
- `Remote`: required endpoint block.
- `Description`: optional.
- `Comment`: optional.
- `IP family`: optional transport selector. `IPv4` or `IPv6`.
- `Protocol`: optional transport selector. `TCP`, `UDP`, or `ICMP`.
- `Transport entries`: optional repeated section.
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
- the `Name` select is scoped by the chosen resource namespace
- services can be chosen from any namespace
- AddressGroup options are scoped by the chosen endpoint namespace, using the cluster-wide AddressGroup list plus local/remote namespace-scoped query results as fallbacks
- namespace-scoped AddressGroup responses may omit `metadata.namespace`; the modal fills it from the selected endpoint namespace before building options
- selected resource namespace and name are validated as Kubernetes DNS labels, max 63 chars

For string endpoints:

- `FQDN` is validated as a hostname-like FQDN
- `CIDR` is validated for both IPv4 and IPv6 CIDR formats

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

- `Name` and `Namespace` render canonical resource-kind badges.
- `Local` and `Remote` render canonical resource-kind badges for `AddressGroup` and `Service` endpoints; `FQDN` and `CIDR` endpoints render their direct values.
- `Action`, `Protocol`, `IP family`, and transport entries render as AntD tags.
- Transport entries render one tag per entry. Entry descriptions and comments are shown in tooltips instead of inline tag text.
- `Name`, `Local`, `Remote`, and `Created` are intentionally wider than compact enum columns so common rule names, endpoint labels, and timestamps wrap less often.

## Edit modal

The table actions column includes edit and delete actions.

Edit opens the same `UniRuleFormModal` for a selected Rule by passing it as the optional `rule` prop.

In edit mode:

- `Namespace` and `Name` are read-only because they identify the resource endpoint.
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

The table delete action opens the toolkit `DeleteModal`.

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
- selecting a protocol requires at least one transport entry
- adding a transport entry requires both protocol and IP family
- transport payload is omitted only when the whole transport section is empty

## Structure overview

The right sidebar renders a `Structure Overview` tree with separate top-level `Local` and `Remote` sections.

- `AddressGroup` and `Service` endpoints reuse the existing rule verbose tree builder
- the tree expands through the current host, network, and service binding graph
- AddressGroup endpoint contents are grouped by resource namespace before individual HostBinding, NetworkBinding, and ServiceBinding badge nodes
- each binding badge node expands to the resolved Host, Network, or Service resource badge and its details
- `FQDN` and `CIDR` endpoints render as direct endpoint leaves
- local and remote endpoint children are recursively prefixed by `overview-local` or `overview-remote` so repeated endpoint shapes keep unique AntD Tree keys
- overview graph lookups do not block modal initialization after the form is ready; the sidebar renders from currently available data
- the tree starts collapsed by default; users expand Local, Remote, endpoint, namespace, and resource branches as needed

## Modal lifecycle

- The modal is conditionally rendered only while open, so closing it fully unmounts the component and reopening mounts a fresh instance.
- Edit prefill runs once per open cycle after the async resources needed for the form are ready.
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
