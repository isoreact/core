import ReactDOMServer from 'react-dom/server';
import {ServerStyleSheet} from 'styled-components';

export default class StyledComponentsServerRenderer {
    sheet = new ServerStyleSheet();

    getStyleTags() {
        return this.sheet.getStyleTags();
    }

    render = (reactElement) => ReactDOMServer.renderToString(this.sheet.collectStyles(reactElement));
}
