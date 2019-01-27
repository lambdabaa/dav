import prop from './prop';

export default function addressBookQuery(object) {
  return `<card:addressbook-query xmlns:card="urn:ietf:params:xml:ns:carddav" xmlns:d="DAV:">
    <d:prop>
      ${object.props.map(prop).join('\n      ')}
    </d:prop>
    <card:filter>
      ${object.filters.map(prop)}
    </card:filter>
    ${(object.limits?object.limits.map(prop):'')}
  </card:addressbook-query>`
}
