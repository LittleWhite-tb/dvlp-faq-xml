'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class TargetDocumentImpl {
    static createTargetDocumentImpl(targetDocument, slugifiedQaName, sectionPathName, slugifiedSectionName, sectionTitle) {
        return new TargetDocumentImpl(targetDocument, slugifiedQaName, sectionPathName, slugifiedSectionName, sectionTitle);
    }
    static createSectionDocumentImpl(targetDocument, sectionPathName, slugifiedSectionName, sectionTitle) {
        return new TargetDocumentImpl(targetDocument, undefined, sectionPathName, slugifiedSectionName, sectionTitle);
    }
    constructor(targetDocument, slugifiedQaName, sectionPathName, slugifiedSectionName, sectionTitle) {
        this.documentPaths = targetDocument.documentPaths;
        this.transformedData = targetDocument.transformedData;
        this.fmMetaData = targetDocument.fmMetaData || null;
        this.slugifiedQaName = slugifiedQaName;
        this.sectionPathName = sectionPathName;
        this.slugifiedSectionName = slugifiedSectionName;
        this.sectionTitle = sectionTitle;
    }
}
exports.TargetDocumentImpl = TargetDocumentImpl;
