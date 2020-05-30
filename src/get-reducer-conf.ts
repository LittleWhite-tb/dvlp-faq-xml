'use strict';

import { IReducerConf, IDocumentPaths, ITargetDocument, TargetDocument } from 'md-file-converter';
import { ReducedTargetDocumentImpl } from './model-impl';

export function getReducerConf(initialValues: { targetDocumentPaths: IDocumentPaths, targetDocumentList: ITargetDocument[] }): IReducerConf {
    const arr = initialValues.targetDocumentList.filter((targetDocument: TargetDocument) => {
        if (targetDocument === undefined) {
            return false;
        }

        return targetDocument.documentPaths.basename !== 'SUMMARY';
    });

    const faqMetaData = initialValues.targetDocumentList.filter((targetDocument: TargetDocument) => {
        if (targetDocument === undefined) {
            return false;
        }

        return targetDocument.documentPaths.basename === 'SUMMARY';
    })[0].fmMetaData;

    const initialValue = [
        ReducedTargetDocumentImpl.createReducedTargetDocumentImpl(
            TargetDocument.createTargetDocument({
                documentPaths: initialValues.targetDocumentPaths,
                transformedData: '',
                fmMetaData: faqMetaData
            }),
            '',
            '',
            ''
        )
    ];

    return {
        arr,
        initialValue
    };
}
