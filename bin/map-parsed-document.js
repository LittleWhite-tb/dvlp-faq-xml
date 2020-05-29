'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const md_file_converter_1 = require("md-file-converter");
const model_impl_1 = require("./model-impl");
function makeUnConfiguredMapParsedDocument({ marked, getSlug }) {
    return (conf) => {
        return (mdParsedDocument) => {
            function parseWithMarked(tokens) {
                tokens.links = Object.create(null);
                return marked.parser(tokens, conf.markedOptions);
            }
            function getLastFolderFromPath(path) {
                const lastFolderSep = path.lastIndexOf('/');
                const previousLastFolderSep = path.lastIndexOf('/', lastFolderSep - 1);
                return path.substring(previousLastFolderSep + 1, lastFolderSep);
            }
            if (mdParsedDocument.documentPaths.basename === 'SUMMARY') {
                return md_file_converter_1.TargetDocument.createTargetDocument({
                    documentPaths: mdParsedDocument.documentPaths,
                    transformedData: marked.parser(mdParsedDocument.parsedTokensList, conf.markedOptions),
                    fmMetaData: mdParsedDocument.fmMetaData
                });
            }
            else {
                const mdParsedDocumentImpl = mdParsedDocument;
                const qaFmMetaData = mdParsedDocumentImpl.fmMetaData;
                const questionTitleToken = mdParsedDocumentImpl.questionTitleToken[0];
                const qaContent = parseWithMarked(mdParsedDocumentImpl.parsedTokensList);
                const qaTitleText = questionTitleToken.text;
                const qaTitleTag = parseWithMarked(mdParsedDocumentImpl.questionTitleToken);
                const sectionPathName = getLastFolderFromPath(mdParsedDocument.documentPaths.src);
                const sectionTitle = parseWithMarked(mdParsedDocumentImpl.sectionTitleToken);
                const slugifiedQaName = getSlug(qaTitleText
                    .replace('<i>', '')
                    .replace('</i>', ''), { lang: 'fr' });
                const slugifiedSectionName = getSlug(sectionTitle
                    .replace('<i>', '')
                    .replace('</i>', ''), { lang: 'fr' });
                const transformedData = `
        <QA create_date="${qaFmMetaData.getCreateDate()}" last_update="${qaFmMetaData.getLastUpdateDate()}" name="${slugifiedQaName}">
            ${qaTitleTag}
            <author name="${qaFmMetaData.author}"/>
            <keywords>${qaFmMetaData.keywords}</keywords>
            <answer>
                ${qaContent}
            </answer>
        </QA>`;
                return model_impl_1.TargetDocumentImpl.createTargetDocumentImpl(md_file_converter_1.TargetDocument.createTargetDocument({
                    documentPaths: mdParsedDocumentImpl.documentPaths,
                    transformedData,
                    fmMetaData: qaFmMetaData
                }), slugifiedQaName, sectionPathName, slugifiedSectionName, sectionTitle);
            }
        };
    };
}
exports.makeUnConfiguredMapParsedDocument = makeUnConfiguredMapParsedDocument;
