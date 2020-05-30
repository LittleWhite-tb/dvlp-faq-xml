'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const md_file_converter_1 = require("md-file-converter");
const model_impl_1 = require("./model-impl");
function getReducerConf(initialValues) {
    const arr = initialValues.targetDocumentList.filter((targetDocument) => {
        if (targetDocument === undefined) {
            return false;
        }
        return targetDocument.documentPaths.basename !== 'SUMMARY';
    });
    const faqMetaData = initialValues.targetDocumentList.filter((targetDocument) => {
        if (targetDocument === undefined) {
            return false;
        }
        return targetDocument.documentPaths.basename === 'SUMMARY';
    })[0].fmMetaData;
    const initialValue = [
        model_impl_1.ReducedTargetDocumentImpl.createReducedTargetDocumentImpl(md_file_converter_1.TargetDocument.createTargetDocument({
            documentPaths: initialValues.targetDocumentPaths,
            transformedData: '',
            fmMetaData: faqMetaData
        }), '', '', '')
    ];
    return {
        arr,
        initialValue
    };
}
exports.getReducerConf = getReducerConf;
