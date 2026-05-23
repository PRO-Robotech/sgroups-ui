# sgroups-ui

## Routes

The plugin has module table routes for the main `sgroups.io/v1alpha1` resources:

- `hosts`
- `services`
- `networks`
- `addressgroups`
- `rules`

Each table has internal detail links in the first `Display Name` column. Detail routes use immutable resource identifiers:

```txt
{plural}/{namespace}/{metadata.name}
```

Visible labels prefer `spec.displayName` and fall back to `metadata.name`. URLs, API requests, delete endpoints, and YAML/editor targets must continue to use `metadata.name`.

Detail pages are built from the shared namespaced resource factory in `src/pages/ResourceDetailsPage`. They include:

- breadcrumbs back to the module table
- basic resource metadata
- labels and annotations cards/actions
- conditions when present
- YAML

They intentionally do not include the generic Kubernetes Events tab.

## ⚙️ Configuration

This app can be configured through environment variables.

| Variable               | Type     | Description                                |
| ---------------------- | -------- | ------------------------------------------ |
| `BASEPREFIX`           | `string` | Base URL for the app. `/openapi-ui-plugin` |
| `CORS_ALLOWED_ORIGINS` | `string` | CORS allowed origins. Separated by comma   |

---

## 🤝 Contributing

[Check this out](./CONTRIBUTING.md)
