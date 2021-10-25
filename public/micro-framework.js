/**
 * This is our routes array,
 * It stores all registered routes
 * and is used to find the page elements for a given route
 */
const routes = [];

/**
 * Register a route which can be navigated to.
 * A route can contain multiple segments. Those can be fixed strings or variable parameters
 * which will be passed with the navigation event.
 *
 * @param {string} pathString a string of format '/todos/:id/edit'. Needs to start with a /
 * @param {string} pageId the id of the page element. On navigation the hidden attribute of this page is removed.
 * @param {(params) => boolean | (params) => Promise<boolean> | null} [guard=null] a function to be executed before entering the page. If it returns false the navigation is not performed.
 */
function registerRoute(pathString, pageId, guard=null) {
  if (!pathString.startsWith('/')) {
    throw new Error(`Path ${pathString} should start with a "/"`)
  }

  // split the path in it's segments -> /abc/def => ['', 'abc', 'def']
  const pathSegments = pathString.split('/');

  // transform the segements
  // so that we can easily distinguish params in the path form normal path segments
  const path = pathSegments.map(s => {
    if (s.startsWith(':')) {
      return { type: 'param', name: s.substr(1) };
    } else {
      return { type: 'path', name: s };
    }
  })

  // add the route to our global array
  routes.push({ path, pageId, guard });
}

/**
 * Determine if a route matches a given path
 * @param {string} path
 * @param {{path: {type: 'path' | 'param', name: string}[], pageId: string}} route
 */
function isRouteMatch(path, route) {
  const pathSegments = path.split('/');

  // if the length of path segements is not equal, it can't match
  if (pathSegments.length !== route.path.length) {
    return false;
  }

  // check if for every segment the name matches with the given route
  // or if the route has a param at that location (so every string is allowed)
  return pathSegments.every((e,i) => e === route.path[i].name || route.path[i].type === 'param');
}

/**
 * Extract parameters from a path. Precondition: the route needs to match the path.
 * Otherwise bad things will happen.
 * @param {string} path
 * @param {{path: {type: 'path' | 'param', name: string}[], pageId: string}} route
 * @returns params
 */
 function extractParameters(path, route) {
  const pathSegments = path.split('/');
  const params = {};
  route.path.forEach((p, i) => {
    if (p.type === 'param') {
      params[p.name] = pathSegments[i];
    }
  });

  return params;
}

/**
 * Show the the page with the given id and hide all others
 * @param path the url path of the page to show
 */
function gotoPage(path) {
  if (!path.startsWith('/')) {
    throw new Error(`Path ${path} should start with a "/"`)
  }

  const match = routes.find(r => isRouteMatch(path, r));
  if (match === undefined) {
    throw new Error(`Route for ${path} not found`)
  }

  gotoPageAsync(path, match);
}

async function checkGuard(guard, params) {
  if  (guard != null) {
    let result = guard(params);
    if (typeof result.then === 'function') {
      return await result;
    } else {
      return result;
    }
  } else {
    return true;
  }
}

async function gotoPageAsync(path, match) {
  const pageId = match.pageId;
  const pageElement = document.querySelector(`#${pageId}`);
  if (!pageElement) {
    console.warn(`DOM element for id ${pageId} does not exist`);
    return;
  }

  const params = extractParameters(path, match);

  const navigationAllowed = await checkGuard(match.guard, params);
  if (!navigationAllowed) {
    return;
  }

  routes.forEach(r => {
    const element = document.querySelector(`#${r.pageId}`);
    if (element) {
      element.setAttribute('hidden', '');
    }
  });

  pageElement.removeAttribute('hidden');

  window.history.pushState({ pageId: pageId, path }, "", encodeURI(path));

  const event = new CustomEvent('navigation', { bubbles: true, detail: {params, pageId, pageElement} });
  pageElement.dispatchEvent(event);
}

function doInitialNavigation() {
  let pathname = decodeURI(window.location.pathname);
  if (!pathname.startsWith('/')) {
    pathname = '/' + pathname;
  }

  gotoPage(pathname)
}

/**
 * Run initialization when the script is loaded
 */
document.addEventListener("DOMContentLoaded", function() {
  window.onpopstate = function(e){

    if(e.state){
      gotoPage(e.state.path)
    }
  };
})