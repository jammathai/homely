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

function consoleValue(value) {
  if (typeof value === "string") return `"${value}"`;
  return value;
}

function warn(...data) {
  console.warn(`(${getCallSite()})`, ...data);
}

function getCallSite() {
  const stack = new Error().stack.split("\n");
  const index = stack.findLastIndex((line) => line.includes("homely.js")) + 1;
  return stack[index].match(/[^/]+\.js:\d+/);
}
