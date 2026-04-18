export const html = new Proxy(
  {},
  {
    get(_, key) {
      return (...children) => createElement(key, ...children);
    },
  },
);

function createElement(tagName, ...children) {
  const element = document.createElement(tagName);
  if (element instanceof HTMLUnknownElement)
    warn(`html.${tagName}(...) returns an invalid tag`);

  for (const child of children) {
    if (Object.getPrototypeOf(child) === Object.prototype) {
      assignElementProps(element, child);
    } else if (typeof child === "string") {
      appendText(element, child);
    } else {
      element.append(child);
    }
  }

  return element;
}

function assignElementProps(element, props) {
  for (const [key, value] of Object.entries(props)) {
    assignProp(element, key, value);
  }
}

function assignProp(object, key, value) {
  object[key] = value;
  if (object[key] !== value) {
    warn(
      `{ ... ${key}:`,
      consoleValue(value),
      "→",
      consoleValue(object[key]),
      "}",
    );
  }
}

function appendText(element, string) {
  if (
    element.lastChild !== null &&
    element.lastChild.nodeType === Node.TEXT_NODE
  ) {
    element.lastChild.textContent += string;
  } else {
    element.append(string);
  }
}

export function wrap(object) {
  const refs = Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, new Ref(value)]),
  );

  return new Proxy(refs, {
    get(target, key) {
      if (key[0] === "$") {
        const value = target[key.slice(1)];
        if (value === undefined) {
          warn(`{ ... }.${key} is undefined`);
        }
        return value;
      }
      if (target[key]) {
        return target[key].getValue();
      }
      return undefined;
    },

    set(target, key, value) {
      if (key[0] === "$") {
        error(
          TypeError,
          `{ ... }.${key} cannot be set because it is a state reference`,
        );
      }
      if (!target[key]) {
        target[key] = new Ref(value);
        return true;
      }
      target[key].setValue(value);
      return true;
    },
  });
}

export function addEffect(effect, deps) {
  if (typeof effect !== "function") {
    error(TypeError, "effect is not a function");
  }

  if (!Array.isArray(deps)) {
    error(TypeError, "deps is not an array");
  }

  for (const [index, dep] of deps.entries()) {
    if (!(dep instanceof Ref)) {
      error(TypeError, `deps[${index}] is not a state reference`);
    }
    if (!dep.addEffect(effect)) {
      warn(`effect has already been added to deps[${index}]`);
    }
  }
  effect();
}

class Ref {
  #value;
  #effects;

  constructor(value) {
    this.#value = value;
    this.#effects = [];
  }

  addEffect(effect) {
    if (this.#effects.includes(effect)) {
      return false;
    }
    this.#effects.push(effect);
    return true;
  }

  getValue() {
    return this.#value;
  }

  setValue(value) {
    this.#value = value;
    for (const effect of this.#effects) {
      effect();
    }
  }
}

function consoleValue(value) {
  if (typeof value === "string") return `"${value}"`;
  return value;
}

function warn(...data) {
  console.warn(`(${getCallSite()})`, ...data);
}

function error(constructor, message) {
  throw new constructor(`(${getCallSite()}) ${message}`);
}

function getCallSite() {
  const stack = new Error().stack.split("\n");
  const index = stack.findLastIndex((line) => line.includes("homely.js")) + 1;
  return stack[index].match(/[^/]+\.js:\d+/);
}
