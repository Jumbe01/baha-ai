/** Create an element with inline style and plain-text content (never parsed as HTML). */
export function el(tag: string, style: string, text?: string | number | null, children: Node[] = []): HTMLElement {
    const node = document.createElement(tag);
    node.style.cssText = style;
    if (text != null) node.textContent = String(text);
    children.forEach((c) => node.appendChild(c));
    return node;
}
