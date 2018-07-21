import hash from 'object-hash';

/**
 * Generate a <code>hydration</code> key based on an isomorphic component name and the props of one of its instances
 * or nested isomorphic component instances.
 *
 * @param {string} name  - isomorphic component name
 * @param {Object} props - isomorphic component instance props
 * @return {string} the hydration key
 */
export default function keyFor(name, props) {
    return `${name}--${hash(props, {algorithm: 'sha256'})}`;
}
