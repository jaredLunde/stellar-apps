let resolver

if (typeof document !== 'undefined') {
  resolver = require('resolve-url')
}
else {
  resolver = require('url').resolve
}

// This resolves fully qualified URLs for thinks like <link rel='canonical'/>
export const resolve = uri => resolver(process.env.DOMAIN, uri)

// These are the page URL definitions. URLs are defined this way so that they can
// easily be updated later on. Any references in <Link to={}/> should use these
// references
//
// NOTE: These urls should ALWAYS ALWAYS ALWAYS contain a trailing / for static sites
//       since static sites are directory-based. If this is a Lambda-based SSR solution
//       you can omit trailing slashes
export const home = () => '/'
