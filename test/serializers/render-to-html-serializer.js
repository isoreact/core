const pretty = require('pretty');

module.exports = {
    print({head, body}) {
        return pretty(`<head>${head}</head><body>${body}</body>`);
    },

    test(val) {
        return ['head', 'body'].every((key) => Object.prototype.hasOwnProperty.call(val, key));
    }
};
