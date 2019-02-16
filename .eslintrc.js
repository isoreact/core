module.exports = {
    "parser": "babel-eslint",
    "extends": [
        "./node_modules/fs-default-project-config/resources/.eslintrc.js",
    ],
    "rules": {
        "no-invalid-this": 0,                          // it doesn't understand class properties
        "no-empty-function": 0,                        // not installing lodash just for noop
    },
    "settings": {
        "react": {
            "version": "detect"
        }
    }
};
