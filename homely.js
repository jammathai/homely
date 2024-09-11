export class Component {
  /** @param {string} html @param {Node} parent */
  constructor(html) {
    const template = document.createElement("template");
    template.innerHTML = html
      .replaceAll("{", "<span data-state>")
      .replaceAll("}", "</span>");
    this.frag = template.content;

    traverseChildren(this.frag, (elem) => {
      if (elem.hasAttribute("data-state")) {
        const stateName = elem.textContent;
        this[stateName] = new State();
        useEffect(() => {
          elem.textContent = this[stateName].value;
        }, [this[stateName]]);
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
