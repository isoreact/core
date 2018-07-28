import ReactDOMServer from 'react-dom/server';
import {ServerStyleSheet} from 'styled-components';

/**
 * Isomorphic component renderer with support for styled-components.
 *
 * @param {Object} reactElement - the React element to render
 * @returns {Object} the rendered head and body html
 */
export const styledComponentsRenderToHtml = (reactElement) => {
    const sheet = new ServerStyleSheet();

    const body = ReactDOMServer.renderToString(sheet.collectStyles(reactElement));
    const head = sheet.getStyleTags();

    return {
        head,
        body,
    };
};

export default styledComponentsRenderToHtml;
