## Welcome to the Common Mapping Client 2!

![Preview](https://github.jpl.nasa.gov/CommonMappingClient/cmc-design/blob/master/screenshots/core.png)

### Overview
The Common Mapping Client (CMC) is a foundation for web-based mapping applications that
leverages, combines, and abstracts certain commonly used mapping functionalities,
enabling developers to spend less time reinventing the wheel and more time solving
their specific problems.

Over the years, there have been many projects that try to solve the same issue:
put data on a map and explore it. Unfortunately, there is an increasingly steep
hill to climb when it comes to actually starting one of these projects. All of
them have to decide: Which framework should I start from? Which library
will give me the features I need? How to I glue all these together with 
a code layout that I won't want to burn next week? CMC solves this by bundling
together a solid and modular base framework with robust mapping libraries,
a well thought out structure, and a thick shield against feature-creep
to deliver what is essentially a starter project for mapping that will let
you start building the cool stuff faster.

We maintain a list of further example projects and projects that began from CMC
so that you can easily get examples of building intricate and detailed workflows
on top of our client.

*General Philosophy*
If a capability or widget is not in 85% of mapping applications, it will not be
part of CMC-Core.

### Live Demo
- Check out our live demo http://graywhale:49160/master/
- GHE code-coverage: http://graywhale:49160/master/test-results/coverage/
- GHE unit test report: http://graywhale:49160/master/test-results/

### Features
* 2D/3D Map library abstraction
* Map layer controls
* Map layer ingestion and merging (from JSON and WMTS capabilities XML)
* Highly customizable user analytics
* Configurable map projection
* Basic vector layer support
* Map extent synchronization across all maps (2D and 3D)
* Geodesic map geometry synchronization across all maps (2D and 3D)
* Global time widget, and interactive timeslider
* Adjustable map layer cache
* Shareable/loadable application state via url parameters with share widget (facebook, twitter, email, google plus)
* Core set of UI elements necessary for most basic applications
* Basemap switching
* Basic shape drawing tools in 2D and 3D
* Basic geodesic measurement (distance and area) tools in 2D and 3D
* Display help documentation from markdown files
* A preconfigured testing framework
* A preconfigured build process
* Handy development tools
  * Hot reloading
  * Local dev and production node servers
  * BrowserSync

### Quickstart

##### Install
1. Install `NodeJS`
2. Get the code
   1. Option A: Grab a tag that suits you
   2. Option B: Fork the repo into your new project and get the cutting edge goodness
   3. Option C: Clone the repo, contribute back, and get the cutting edge goodness
3. `npm install`: install node dependencies
4. `npm start`: build and server development code bundle
5. Start building.

##### Build
* `npm run build`: build production code bundle
* `npm run open:dist`: serve production code bundle

##### Test
* `npm run test`: Single run of tests
* `npm run test:watch`: Run tests with code watch
* `npm run test:cover`: Single run of tests with coverage report
* flags
  * `--includecoretests`: Include cmc-core tests as well
  * `--nowebgl`: Run tests in phantomJS and skip tests that require webgl

### Contributing to the Project

*Contributing Directly to CMC-Core*

You are more than welcome to create forks to fix bugs, add features or
enhancements or otherwise improve the tool.

*Contributing to the CMC Ecosystem*

If you use CMC for your own project, please let us know so that we may list it
under our [Example Projects](https://github.jpl.nasa.gov/CommonMappingClient/cmc-core/blob/master/docs/core-docs/EXAMPLE_PROJECTS.md) for others to find inspiration in.

If you create a particularly useful or robust widget in your own CMC descendant,
please create an example project demonstrating just that widget so that others
who have the same problem down the road may find a solution faster.

### Documentation Shortcut

* [Developer Guide](https://github.jpl.nasa.gov/CommonMappingClient/cmc-core/blob/master/docs/core-docs/DEVELOPER_MANUAL.md)
* [Example Projects](https://github.jpl.nasa.gov/CommonMappingClient/cmc-core/blob/master/docs/core-docs/EXAMPLE_PROJECTS.md)


## Copyright and Export Classification

```
Copyright 2017, by the California Institute of Technology. ALL RIGHTS RESERVED.
United States Government Sponsorship acknowledged. Any commercial use must be
negotiated with the Office of Technology Transfer at the California Institute
of Technology.

This software is subject to U.S. export control laws and regulations and has
been classified as EAR99.  By accepting this software, the user agrees to comply
with all applicable U.S. export laws and regulations. User has the responsibility
to obtain export licenses, or other export authority as may be required before
exporting such information to foreign countries or providing access to foreign persons.
```

## Licensing

```
 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 ```
