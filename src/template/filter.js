export default function filter(item) {
  if (!item.children || !item.children.length) {
    if (typeof item.value === 'undefined') {
      return `<c:${item.type} ${formatAttrs(item.attrs)}/>`;
    }
    return `<c:${item.type} ${formatAttrs(item.attrs)}>${item.value}</c:${item.type}>`;
  }

  let children = item.children.map(filter);
  return `<c:${item.type} ${formatAttrs(item.attrs)}>
            ${children}
          </c:${item.type}>`;
}

function formatAttrs(attrs) {
  if (typeof attrs !== 'object') {
    return '';
  }

  return Object.keys(attrs)
    .map(attr => `${attr}="${attrs[attr]}"`)
    .join(' ');
}
