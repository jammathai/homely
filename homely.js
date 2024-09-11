export class Component {
  /** @param {string} html @param {Node} parent */
  constructor(html) {
    const template = document.createElement("template");
    template.innerHTML = html
      .replaceAll("{", "<span data-prop>")
      .replaceAll("}", "</span>");
    this.frag = template.content;

    traverseChildren(this.frag, (elem) => {
      if (elem.hasAttribute("data-prop")) {
        const propName = elem.textContent;

        Object.defineProperty(this, propName, {
          configurable: true,
          set: (v) => {
            this["#" + propName] = v;

            if (v instanceof State) {
              elem.textContent = v.value;
              v.addEffect(() => {
                elem.textContent = v.value;
              });
            } else {
              elem.textContent = v;
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
    });
  }

  /** @param {HTMLElement} elem */
  appendTo(elem) {
    elem.append(this.frag);
    delete this.frag;
  }
}

export class State {
  #value;

  constructor(value) {
    this.#value = value;
    /** @type (() => void)[] */
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

/** @param {Node} node @param {(elem: HTMLElement) => void} callback */
function traverseChildren(node, callback) {
  for (const child of node.children) {
    callback(child);
    traverseChildren(child, callback);
  }
}
