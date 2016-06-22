/**
 * ASP.NET Core Starter Kit
 *
 * Copyright © 2014-2016 Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import React from 'react';

function decodeParam(val) {
  if (!(typeof val === 'string' || val.length === 0)) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = `Failed to decode param '${val}'`;
      err.status = 400;
    }

    throw err;
  }
}

// Match the provided URL path pattern to an actual URI string. For example:
//   matchURI({ path: '/posts/:id' }, '/dummy') => null
//   matchURI({ path: '/posts/:id' }, '/posts/123') => { id: 123 }
function matchURI(route, path) {
  // Deserialize the RegExp pattern (see utils/routes-loader.js)
  if (typeof route.pattern === 'string') {
    const fragments = route.pattern.match(/\/(.*?)\/([gimy])?$/);
    /* eslint-disable no-param-reassign */
    route.pattern = new RegExp(fragments[1], fragments[2] || '');
    /* eslint-enable no-param-reassign */
  }
  const match = route.pattern.exec(path);

  if (!match) {
    return null;
  }

  const params = Object.create(null);

  for (let i = 1; i < match.length; i++) {
    params[route.keys[i - 1].name] = match[i] !== undefined ? decodeParam(match[i]) : undefined;
  }

  return params;
}

function resolve(routes, context) {
  for (const route of routes) {
    const params = matchURI(route, context.path);

    if (!params) {
      continue;
    }

    return route.view().then(View => <View.default route={route} />);
  }

  const error = new Error('Not found');
  error.status = 404;
  const route = routes.find(x => x.path === '/error');
  return route.view().then(View => <View.default route={route} error={error} />);
}

export default { resolve };
