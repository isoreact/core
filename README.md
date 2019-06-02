# IsoReact &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/isoreact/core/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@isoreact/core.svg?style=flat)](https://www.npmjs.com/package/@isoreact/core) ![npm](https://img.shields.io/npm/dw/@isoreact/core.svg) [![Build Status](https://travis-ci.org/isoreact/core.svg?branch=develop)](https://travis-ci.org/isoreact/core) [![Gitter](https://img.shields.io/gitter/room/isoreact-core/isoreact.svg)](https://gitter.im/isoreact-core/isoreact) [![PRs Welcome](https://img.shields.io/badge/pull_requests-welcome-brightgreen.svg)](https://github.com/isoreact/core/blob/master/CONTRIBUTING.md)

**Important:** This library has been deprecated in favor of individual libraries, each focusing on a different state
management library, starting with Bacon.js 1.x in [@isoreact/bacon1](https://github.com/isoreact/bacon1).

IsoReact is a small library to use React and RxJS together to build isomorphic
React components.

Features:

* Server-side render fully populated components (not just loading states).
* Hydrate server-side rendered components without hitting APIs for the initial
  client-side render.
* State management with [RxJS](https://github.com/ReactiveX/rxjs).
* Connect state to the component tree via the [new context API](https://reactjs.org/docs/context.html).

This is a library, not a framework. It is focused on state management and
isomorphism and should otherwise stay out of your way.

## Installation

```
npm i -S @isoreact/core
```

## Examples

See [isoreact/example](https://github.com/isoreact/example)

## Usage

Create a context to connect an RxJS event stream to your React component:

```js
// profile-context.js
import React from 'react';

export default React.createContext();
```

Create your React component hierarchy, connecting your context to it using `<Connect context={yourContext} />`:

```js
// profile.js
import React from 'react';
import {Connect} from '@isoreact/core';
import profileContext from './profile-context';

const ProfileName = () => (
    <section className="profile__name">
        <Connect
            context={profileContext}
            distinctBy={({name}) => name}
        >
            {({name}) => name}
        </Connect>
    </section>
);

const ProfilePhoto = () => (
    <section className="profile__photo">
        <Connect context={profileContext}>
            {({photo}) => (
                <img className="profile__photo-img" src={photo} />
            )}
        </Connect>
    </section>
);

const Profile = () => (
    <section className="profile">
        <ProfileName />
        <ProfilePhoto />
    </section>
);

export default Profile;
```

You might have noticed `distinctBy={({name}) => name}` in one of the `<Connect />` elements. It's an optional function that uniquely identifies values we're interested in, which is used by `Connect` to skip duplicate values and therefore duplicate renders.

Define your component's event stream and make it isomorphic:

```js
// iso-profile.js
import PropType from 'prop-types';
import {of as observableOf, combineLatest} from 'rxjs';
import {map} from 'rxjs/operators';
import {isomorphic} from '@isoreact/core';
import Profile from './profile';
import profileContext from './profile-context';
import fetchName from './streams/fetch-name';
import fetchPhoto from './streams/fetch-photo';

const IsoProfile = isomorphic({
    name: 'iso-profile',
    component: Profile,
    context: profileContext,
    getData: (props, hydration) => {
        const {userId} = props;
        
        const name$ = hydration
            ? observableOf({name: hydration.name})
            : fetchName(userId);
        
        const photo$ = hydration
            ? observableOf({photo: hydration.photo})
            : fetchPhoto(userId);
        
        return combineLatest(name$, photo$)
            .pipe(
                map(([name, photo]) => ({
                    // React component rendered with this state as its props
                    state: {
                        name,
                        photo,
                    },
                    
                    // Data rendered alongside the React element in the HTML page
                    hydration: {
                        name,
                        photo,
                    },
                })),
            );
    },
    propTypes: {
        userId: PropType.string.isRequired,
    },
});

export default IsoProfile;
```

The general contract of `getData(props, hydration)` is:

* Return an observable that emits objects of the form `{state, hydration}` where both `state` and `hydration` are
  objects.
* If `getData` is provided a `hydration` object, the observable is expected to immediately produce an event.
* Events must contain `hydration` only when the `hydration` parameter is not present (i.e. on the server).
* Events can contain `hydration` when the `hydration` parameter is present, but it will have no effect.
* Keep hydration small to keep server-side rendered HTML pages small. Only attach the minimum amount of data required
  to hydrate isomorphic components without them having to fetch data from APIs.

Somewhere on the server:

```js
import React from 'react';
import {renderToHtml} from '@isoreact/core';
import {IsoProfile} from './iso-profile';

// Server-side render an HTML page consisting of the profiles from a list of user IDs.
async function renderUserProfilesPage(userIds) {
    // Generate server-side rendered profile of users
    const htmlArray = await Promise.all(
        userIds.map((userId) => renderToHtml(<IsoProfile userId={userId} />))
    );

    return `<body>${htmlArray.join('')}</body>`;
}
```

When `renderToHtml` is called, it will call each isomorphic components' `getData` function, passing in the isomorphic
component's props (in this case, `userId`). When the stream returned by `getData` produces its first event (an object
consisting of `state` to inject into the React component and `hydration` to attach to the HTML page), the isomorphic
component's React component will be rendered with the `state` as its `props` and the `hydration` data will be rendered
adjacent to it in the HTML page.

Somewhere on the client:

```js
import {hydrate} from '@isoreact/core';
import IsoProfile from './iso-profile';

// Hydrate all instances of iso-profile on the page
hydrate(IsoProfile);
```

When `hydrate` is called, it finds all the server-side rendered instances of the isomorphic component in the DOM, reads
their attached `props` and `hydration` data, then calls `getData(props, hydration)`, expecting the client to render the
profiles synchronously, without having to load data from APIs.

Bear in mind that isomorphic components are just React components, so you can use them directly in JSX and you don't
even need to initially render them on the server. You could even use this library just for connecting to RxJS.

## Support for styled-components

The server-side rendering portion of the above example can be updated as follows:

```js
import React from 'react';
import {renderToHtml, StyledComponentsServerRenderer} from '@isoreact/core';
import {IsoProfile} from './iso-profile';

// Server-side render an HTML page consisting of the profiles from a list of user IDs.
async function renderUserProfilesPage(userIds) {
    // Generate server-side rendered profile of users
    const renderer = new StyledComponentsServerRenderer();
    const htmlArray = await Promise.all(
        userIds.map((userId) => renderToHtml(
            <IsoProfile userId={userId} />,
            {renderer}
        ))
    );

    return `<head>${renderer.getStyleTags()}</head><body>${htmlArray.join('')}</body>`;
}
```

This uses `StyledComponentsServerRenderer` as an alternative renderer, which uses `ServerStyleSheet` from
styled-components to gather rendered stylesheets.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) in this repo for contribution guidelines.
