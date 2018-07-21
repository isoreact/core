import ReactDOMServer from 'react-dom/server';
import {ServerStyleSheet} from 'styled-components';

/**
 * Isomorphic component renderer with support for styled-components.
 */
export default class StyledComponentsServerRenderer {
    bodyHtml = '';
    headHtml = '';

    render(reactElement) {
        const sheet = new ServerStyleSheet();

        this.bodyHtml = ReactDOMServer.renderToString(sheet.collectStyles(reactElement));
        this.headHtml = sheet.getStyleTags();
    }
}
