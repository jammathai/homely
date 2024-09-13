export class Component {
  /** @type {DocumentFragment | undefined} */
  #frag;

  /** @param {string} html @param {Node} parent */
  constructor(html) {
    const template = document.createElement("template");
    template.innerHTML = html
      .replaceAll("{", "<span data-prop>")
      .replaceAll("}", "</span>");
    this.#frag = template.content;

    traverseChildren(this.#frag, (elem) => {
      if (elem.hasAttribute("data-prop")) {
        const propName = elem.textContent;

        Object.defineProperty(this, propName, {
          configurable: true,
          set: (v) => {
            this["#" + propName] = v;

            if (v instanceof State) {
              setContent(elem, v.value);
              v.addEffect(() => {
                setContent(elem, v.value);
              });
            } else {
              setContent(elem, v);
            }

            Object.defineProperty(this, propName, {
              set: () => {
                throw new Error(`"${propName}" cannot be reassigned`);
              },
            });
          },

          get: () => {
            return this["#" + propName];
          },
        });
      }

      if (elem.hasAttribute("data-name"))
        this[elem.getAttribute("data-name")] = elem;
    });
  }

  /** @param {HTMLElement} elem */
  appendTo(elem) {
    if (this.#frag) {
      elem.append(this.#frag);
      this.#frag = undefined;
    } else {
      throw new Error("appendTo() can only be called once per Component");
    }
  }
}

export class State {
  #value;

  constructor(value) {
    this.#value = value;
    /** @type {(() => void)[]} */
    this.effects = [];
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    this.#value = value;
    for (const effect of this.effects) {
      effect();
    }
  }

  addEffect(effect) {
    this.effects.push(effect);
  }
}

/** @param {() => void} effect @param {State[]} deps */
export function useEffect(effect, deps) {
  for (const dep of deps) dep.addEffect(effect);
}

/** @param {HTMLElement} elem */
export function setContent(elem, content) {
  elem.innerHTML = "";
  if (content instanceof Array)
    for (const item of content) appendContent(elem, item);
  else appendContent(elem, content);
}

/** @param {HTMLElement} elem */
function appendContent(elem, content) {
  if (content.appendTo) {
    content.appendTo(elem);
  } else {
    elem.append(content);
  }
}

/** @param {Node} node @param {(elem: HTMLElement) => void} callback */
function traverseChildren(node, callback) {
  for (const child of node.children) {
    callback(child);
    traverseChildren(child, callback);
  }
}
