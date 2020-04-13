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
$ cd <PATH_TO_PROJECT>
$ link-pkg <PATH_TO_PACKAGE>
```

OR use one-off:

```bash
$ cd <PATH_TO_PROJECT>
$ npx radekstepan/link-pkg <PATH_TO_PACKAGE>
```
