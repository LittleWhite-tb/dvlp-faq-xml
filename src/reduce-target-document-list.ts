'use strict';

import { TargetDocumentImpl, ReducedTargetDocumentImpl } from './model-impl';
import { ITargetDocument } from 'md-file-converter';
import { FmSummary, FmSummaryAuteur } from 'dvlp-commons';

class SectionListObject {
    public subSections: any = {};

    public constructor(public sectionName: string,
                       public slugifiedSectionName: string,
                       public sectionTitle: string,
                       public qaList: string[]) {}

    public addSubSection(section: SectionListObject) {
        this.subSections[section.sectionName] = section;
    }
}

function initXmlDocument(reducedTargetDocumentList: ReducedTargetDocumentImpl[], targetDocumentToReduceCurrent: TargetDocumentImpl, index: number, targetDocumentToReduceList: TargetDocumentImpl[]): ITargetDocument[] {
    const summaryFmMetaData: FmSummary = reducedTargetDocumentList[0].fmMetaData as FmSummary;
    reducedTargetDocumentList[0].xmlAuthorList = summaryFmMetaData.getAuteurs().reduce((xml, auteur: FmSummaryAuteur) => {
        return xml + `<authorDescription name="${auteur.name}" role="${auteur.role}"><fullname>${auteur.fullname}</fullname><url>${auteur.url}</url></authorDescription>`;
    }, '');

    const sectionListObject = targetDocumentToReduceList
        .reduce((sections: any, qa: TargetDocumentImpl) => {
            if (!sections[qa.slugifiedSectionName]) {
                sections[qa.slugifiedSectionName] = new SectionListObject(qa.sectionPathName, qa.slugifiedSectionName, qa.sectionTitle, []);
                sections[qa.slugifiedSectionName].qaList.push(qa.slugifiedQaName);

                return sections;

            } else {
                sections[qa.slugifiedSectionName].qaList.push(qa.slugifiedQaName);

                return sections;
            }
        }, {});

    // Sort by section name: assure that the subsection is always following the parent section
    const orderedSectionNames: string[] = Object.keys(sectionListObject)
            .sort((key1: string, key2: string) =>
                sectionListObject[key1].sectionName > sectionListObject[key2].sectionName ? 1 : -1)
            .map((key) => key);

    // Putting subsection in adequate parent section
    const sectionHierarchy: typeof sectionListObject = {};
    orderedSectionNames.forEach((key: string) =>  {
        const sectionName: string = sectionListObject[key].sectionName;
        if (sectionName.split('-').length >= 3) {
            // Subsection case

            // Recursive function to find the section which should own the subsection
            const sectionFinder = (sectionList: any, name: string) => {
                if (sectionList[name]) {
                    return sectionList[name];
                }

                if (sectionList.subsection === undefined) {
                    // This section is empty, thus it does not exist in the list
                    return undefined;
                }

                for (const section of sectionList.subSections) {
                    const res = section.sectionFinder(section, name);
                    if (res) {
                        return res;
                    }
                }

                return undefined;
            };

            // We remove the last section numbering to find in which parent it is
            const parentName: string = sectionName.substring(0, sectionName.lastIndexOf('-'));
            const sectionNode = sectionFinder(sectionHierarchy, parentName);
            if (sectionNode !== undefined) {
                sectionNode.addSubSection(sectionListObject[key]);
            }
        } else {
            if (!sectionHierarchy[sectionName]) {
                sectionHierarchy[sectionName] = sectionListObject[key];
        }
    }
    });

    // Produce the XML code for section (and subsection thanks to recursivity)
    let indent = '        ';
    const sectionReducer = (xml: string, section: any): string => {
        const links = section[1].qaList.reduce((qaXml: string, slugifiedQaName: string) => {
            return qaXml + `
    ${indent}<link href="${slugifiedQaName}"/>`;
        }, '');

        indent += '    ';
        const subXML: string = Object.entries(section[1].subSections).reduce(sectionReducer, '');
        indent = indent.slice(0, -4); // Section ended, remove the indent level

        const sectionXml = xml + `
${indent}<section id="${section[1].slugifiedSectionName}">
    ${indent}<title>${section[1].sectionTitle}</title>${links}${subXML}
${indent}</section>`;

        return sectionXml;
    };

    reducedTargetDocumentList[0].xmlSectionList = Object.entries(sectionHierarchy).reduce(sectionReducer, '');

    return addXmlQa(reducedTargetDocumentList, targetDocumentToReduceCurrent);
}

function finalizeXmlDocument(reducedTargetDocumentList: ReducedTargetDocumentImpl[], targetDocumentToReduce: TargetDocumentImpl): ITargetDocument[] {
    reducedTargetDocumentList = addXmlQa(reducedTargetDocumentList, targetDocumentToReduce);

    const fmMetaData: FmSummary = reducedTargetDocumentList[0].fmMetaData as FmSummary;
    const gaXmlProp = (fmMetaData.getEntete().googleAnalytics) ? `\n        <google-analytics>${fmMetaData.getEntete().googleAnalytics}</google-analytics>` : '';

    reducedTargetDocumentList[0].transformedData = `<?xml version="1.0" encoding="UTF-8"?>
<document>
    <!-- en-tete de la FAQ -->
    <editeur>
        <edversion>${fmMetaData.getEditeur().edversion}</edversion>
        <edtypexml>${fmMetaData.getEditeur().edtypexml}</edtypexml>
    </editeur>
    <entete>
        <rubrique>${fmMetaData.getEntete().rubrique}</rubrique>
        <meta>
            <description>${fmMetaData.getEntete().getMeta().description}</description>
            <keywords>${fmMetaData.getEntete().getMeta().keywords}</keywords>
        </meta>
        <titre>
            <page>${fmMetaData.getEntete().getTitre().page}</page>
            <article>${fmMetaData.getEntete().getTitre().article}</article>
        </titre>
        <date>${fmMetaData.getEntete().getDate()}</date>
        <miseajour>${fmMetaData.getEntete().getMiseajour()}</miseajour>${gaXmlProp}
        <licauteur>${fmMetaData.getEntete().licauteur}</licauteur>
        <lictype>${fmMetaData.getEntete().lictype}</lictype>
        <licannee>${fmMetaData.getEntete().licannee}</licannee>
        <serveur>${fmMetaData.getEntete().serveur}</serveur>
        <chemin>${fmMetaData.getEntete().chemin}</chemin>
        <urlhttp>${fmMetaData.getEntete().urlhttp}</urlhttp>
        <nopdf/>
        <nozip/>
        <nodownload/>
        <noebook/>
        <nomfaq>${fmMetaData.getEntete().nomfaq}</nomfaq>
    </entete>
    <!-- description des auteurs -->
    <authorDescriptions>${reducedTargetDocumentList[0].xmlAuthorList}</authorDescriptions>
    <!-- Edito de la FAQ, il faut la placer dans des balises paragraph -->
    <edito>
        <paragraph>${fmMetaData.edito}</paragraph>
    </edito>
    <!-- Sommaire de la FAQ -->
    <!-- licence de reproduction affiché en bas de l'article -->
    <licence>${fmMetaData.licence}</licence>
    <summary>${reducedTargetDocumentList[0].xmlSectionList}
    </summary>
    <!-- Liste des questions de la FAQ -->
    <QAs>${reducedTargetDocumentList[0].xmlQaList}
    </QAs>
</document>
`;

    return reducedTargetDocumentList;
}

function addXmlQa(reducedTargetDocumentList: ReducedTargetDocumentImpl[], targetDocumentToReduce: TargetDocumentImpl) {
    reducedTargetDocumentList[0].xmlQaList += targetDocumentToReduce.transformedData;

    return reducedTargetDocumentList;
}

export function reduceTargetDocumentList(reducedTargetDocumentList: ReducedTargetDocumentImpl[], targetDocumentToReduce: TargetDocumentImpl, index: number, targetDocumentToReduceList: TargetDocumentImpl[]): ITargetDocument[] {
    if (index === 0) {
        return initXmlDocument(reducedTargetDocumentList, targetDocumentToReduce, index, targetDocumentToReduceList);
    }

    if (index === targetDocumentToReduceList.length - 1) {
        return finalizeXmlDocument(reducedTargetDocumentList, targetDocumentToReduce);
    }

    return addXmlQa(reducedTargetDocumentList, targetDocumentToReduce);
}
