'use strict';

import { IMdParsedDocument, MdLexeredDocument, MdParsedDocument } from 'md-file-converter';
import { FmSummary, FmQa } from 'dvlp-commons';
import { MdParsedDocumentImpl } from './model-impl';
import { Token, TokensList } from 'marked';

let currentSectionName: TokensList;

/**
 * Each section has a 000.title.md file used to define the section name/title
 * It is a 000.* file to be treated first. It is just used to get the section title for the next QA
 * until we reach the next section (where we will find a new title file).
 *
 * Although, the title file is not returning any document (since it contains nothing interesting)
 * Thus the rest of the process chain will have to handle the possibility to have undefined document
 */
export function parseLexeredDocument(mdLexeredDocument: MdLexeredDocument): IMdParsedDocument {
    function getQuestionTitleToken(tokens: TokensList): Token[] {
        for (const token of tokens) {
            if (token.type === 'heading' && token.depth === 2) {
                return [token];
            }
        }
    }

    function getSectionTitleToken(tokens: TokensList): Token[] {
        for (const token of tokens) {
            if (token.type === 'heading' && token.depth === 1) {
                return [token];
            }
        }
    }

    function filterIrrelevantTitlesTokens(token: Token): boolean {
        return token.type !== 'heading';
    }

    if (mdLexeredDocument.documentPaths.basename === 'SUMMARY') {
        return MdParsedDocument.createMdParsedDocument({
            documentPaths: mdLexeredDocument.documentPaths,
            parsedTokensList: mdLexeredDocument.tokensList,
            fmMetaData: new FmSummary(mdLexeredDocument.fmMetaData)
        });
    } else if (mdLexeredDocument.documentPaths.basename === '000.title') {
        currentSectionName = getSectionTitleToken(mdLexeredDocument.tokensList) as TokensList;
        return MdParsedDocumentImpl.createMdParsedDocumentImpl(
            MdParsedDocument.createMdParsedDocument({
                documentPaths: mdLexeredDocument.documentPaths,
                parsedTokensList: mdLexeredDocument.tokensList.filter(filterIrrelevantTitlesTokens) as TokensList,
                fmMetaData: undefined
                        }),
            undefined,
            currentSectionName
        );
    } else {
        return MdParsedDocumentImpl.createMdParsedDocumentImpl(
            MdParsedDocument.createMdParsedDocument({
                documentPaths: mdLexeredDocument.documentPaths,
                parsedTokensList: mdLexeredDocument.tokensList.filter(filterIrrelevantTitlesTokens) as TokensList,
                fmMetaData: new FmQa(mdLexeredDocument.fmMetaData)
            }),
            getQuestionTitleToken(mdLexeredDocument.tokensList) as TokensList,
            currentSectionName
        );
    }
}
