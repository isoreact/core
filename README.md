# IsoReact &middot; [![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/isoreact/core/blob/master/LICENSE) [![npm version](https://img.shields.io/npm/v/@isoreact/core.svg?style=flat)](https://www.npmjs.com/package/@isoreact/core) [![Build Status](https://travis-ci.org/isoreact/core.svg?branch=develop)](https://travis-ci.org/isoreact/core) [![PRs Welcome](https://img.shields.io/badge/pull_requests-welcome-brightgreen.svg)](https://github.com/isoreact/core/blob/master/CONTRIBUTING.md)

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

## Status

**This is an early work in progress. It is not yet suitable for production!**

## Installation

```
npm i -S @isoreact/core
```

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
    <Connect context={profileContext}>
        <section className="profile__name">
            {({name}) => name}
        </section>
    </Connect>
);

const ProfilePhoto = () => (
    <Connect context={profileContext}>
        <section className="profile__photo">
            {({photo}) => (
                <img className="profile__photo-img" src={photo} />
            )}
        </section>
    </Connect>
);

const ProfileLoading = () => (
    <div>
        { /* Use your imagination */ }
    </div>
);

const Profile = () => (
    <section className="profile">
        <Connect context={profileContext}>
            {({isLoading}) => isLoading ? (
                <ProfileLoading />
            ) : (
                <React.Fragment>
                    <ProfileName />
                    <ProfilePhoto />
                </React.Fragment>
            )}
        </Connect>
    </section>
);

export default Profile;
```

Define your component's event stream and make it isomorphic:

```js
// iso-profile.js
import PropType from 'prop-types';
import {of as observableOf, combineLatest} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {isomorphic} from '@isoreact/core';
import Profile from './profile';
import profileContext from './profile-context';
import fetchName from './streams/fetch-name';
import fetchPhoto from './streams/fetch-photo';

export const isoProfileDefinition = {
    name: 'iso-profile',
    component: Profile,
    context: profileContext,
    loadingProp: 'isLoading',
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
                    // React component rendered with these props
                    props: {
                        name,
                        photo,
                    },
                    
                    // Data rendered alongside the React element in the HTML page
                    hydration: {
                        name,
                        photo,
                    },
                })),
                shareReplay(1),
            );
    },
    propTypes: {
        userId: PropType.string.isRequired,
    },
};

export const IsoProfile = isomorphic(isoProfileDefinition);
```

The general contract of `getData(props, hydration)` is:

* Return a hot `Observable` that emits its last value, if any, immediately upon subscription. (Use `shareReplay(1)`.)
* The observable must emit objects of the form `{props, hydration}` where both `props` and `hydration` are objects.
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
    // Generate server-side rendered profile of user 123
    const htmlArray = await Promise.all(
        userIds.map((userId) => renderToHtml(<IsoProfile userId={userId} />))
    );

    return `<body>${htmlArray.map(({body}) => body)}</body>`;
}
```

When `renderToHtml` is called, it will call each isomorphic components' `getData` function, passing in the isomorphic
component's props (in this case, `userId`). When the stream returned by `getData` produces its first event (an object
consisting of `props` to inject into the React component and `hydration` to attach to the HTML page), the isomorphic
component's React component will be rendered with those `props` and the `hydration` data will be rendered adjacent to
it in the HTML page.

Somewhere on the client:

```js
import {hydrate} from '@isoreact/core';
import {isoProfileDefinition} from './iso-profile';

// Hydrate all instances of iso-profile on the page
hydrate(isoProfileDefinition);
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
    // Generate server-side rendered profile of user 123
    const htmlArray = await Promise.all(
        userIds.map((userId) => renderToHtml(
            <IsoProfile userId={userId} />,
            {serverRenderer: StyledComponentsServerRenderer}
        ))
    );

    return `<head>${htmlArray.map(({head}) => head)}</head><body>${htmlArray.map(({body}) => body)}</body>`;
}
```

This uses `StyledComponentsServerRenderer` as an alternative renderer, which uses `ServerStyleSheet` from
styled-components to gather rendered stylesheets.

## Contributing

Contributions are welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) in this repo for contribution guidelines.
