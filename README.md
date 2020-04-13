# link-pkg

Symlink (A) a Node.js package into (B) another Node.js project. Lets you symlink from any folder in (B), cleans up/creates directories as needed and warns you when a breaking change in (A) could lead to package/dependencies incompatibility.

Example:

```
dev/
├── project/
│   └── node_modules/
│       └── my-package ->
└── my-package/
```

Install globally:

```bash
$ npm i radekstepan/link-pkg -g
$ link-pkg <PATH_TO_PACKAGE>
```

OR use one-off:

```bash
$ npx radekstepan/link-pkg <PATH_TO_PACKAGE>
```