<p align="center">
  <img src="ferlab.png" alt="ferlab repository img" width="180px" />
</p>
<p align="center">
  <a href="https://opensource.org/licenses/Apache-2.0"><img src="https://img.shields.io/badge/License-Apache%202.0-blue.svg?style=for-the-badge"></a>
</p>

# ferlab-next

## Development

* Execute: `npm run dev` to test the build with your changes

### with local wrapper-next project:

* Execute: `npm link` here in ferlab-next
* Execute: `npm link @ferlab/next` in your local wrapper-next project to connect ferlab-next and import it.

But currently the start doesn't work because there are incompatibility with duplicate graphql module when we start the wrapper-next with ferlab-next in link.
So use `pack` feature: 

* Execute: `npm run pack` here in ferlab-next: it builds and creates the file "ferlab-next-x.x.x.tgz"
* Execute `npm install ../ferlab-next/ferlab-next-x.x.x.tgz` in your local wrapper-next project
* Then you are allow to run dev your local wrapper-next project with the pack without have to push to npm your local of ferlab-next

## Test

* Execute: `npm run test`

Starter helped by https://advancedweb.hu/modern-javascript-library-starter
