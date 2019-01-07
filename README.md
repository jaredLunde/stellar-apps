<h1 align=center>
  stellar-apps  
</h1>

<p align=center>
  <br/>
  <br/>
  <img src='assets/Icon-FullColor.svg' width='300' height='300' alt='Stellar Apps'/>
  <br/>
  <br/>
</p>

______

<p align=center>
  A collection of React components and JS libraries used by <a href='https://BeStellar.co'><b>BeStellar.co</b></a> apps
</p>

<p align=center>
https://www.npmjs.com/org/stellar-apps
</p>

<br/><br/>

## Packages

**getDefaultMatches** [**`@stellar-apps/get-default-matches`**](./packages/get-default-matches)

Determines the default breakpoint to set for a `curls/BreakPoint` component based upon the
device returned by the curls `theme.grid.device` (one of desktop/mobile/tablet).

______

**LazyLoad** [**`@stellar-apps/lazy-load`**](./packages/lazy-load)

Components for lazy loading images, iframes, and more.

______

**MadeByStellar** [**`@stellar-apps/made-by-stellar`**](./packages/made-by-stellar)

A component that creates a "Made with 🚀 by Stellar" link.

______

**SEO** [**`@stellar-apps/seo`**](./packages/seo)

A basic toolset for killing several (social, SEO) birds with one stone in non-complex meta data situations.

______

<br/><br/>

## Package Management

### Create a new package
`yarn create-pkg [package name] [--react|-r|--esx|-e]`

#### Options
- `[package name]`
    - The name of the new package
- `--react|-r`
    - Creates a new React package
- `--esx|-e`
    - Creates a new plain Babel package without React

______

### Install all packages
`yarn install-all`

------

### Build all packages
`yarn build-all`

______

### Upgrade all packages
`yarn upgrade-all`

______

### Publish all packages
`yarn publish-all [version bump]`

#### Options
- `[version bump]`
    - abides by `semver`
    - one of `prerelease`, `patch`, `minor`, `major` to be applied to all packages in the repo
