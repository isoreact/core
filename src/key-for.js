import objectSorter from 'node-object-hash/objectSorter';
import sha256 from 'hash.js/lib/hash/sha/256';

const sortObject = objectSorter();

const hashObject = (props) => (
    sha256()
        .update(sortObject(props))
        .digest('hex')
);

/**
 * Generate a <code>hydration</code> key based on an isomorphic component name and the props of one of its instances
 * or nested isomorphic component instances.
 *
 * @param {string} name  - isomorphic component name
 * @param {Object} props - isomorphic component instance props
 * @return {string} the hydration key
 */
export default function keyFor(name, props) {
    return `${name}--${hashObject(props)}`;
}
