# Public Assets

Any file in this directory which is imported by the application will be loaded via 
either `file-loader`, `json-loader`, or `responsive-loader` depending upon the file type.

The file name will have a unique hash attached to it so you never have to worry about caching 
issues with files imported from this directory.

You could for example import this README and it would be packaged in your Webpack bundle. 