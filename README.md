# link-pkg

Symlink (A) a Node.js package into (B) another Node.js project. Lets you symlink from any folder in (B), cleans up/creates directories as needed and warns you when a breaking change in (A) could lead to package/dependencies incompatibility.

Install globally:

```bash
$ npm i radekstepan/link-pkg -g
$ link-pkg <PATH_TO_PACKAGE>
```

OR use one-off:

```bash
$ npx git:radekstepan/link-pkg <PATH_TO_PACKAGE>
```