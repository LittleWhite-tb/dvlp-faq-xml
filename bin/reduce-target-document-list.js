'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
class SectionListObject {
    constructor(sectionName, slugifiedSectionName, sectionTitle, qaList) {
        this.sectionName = sectionName;
        this.slugifiedSectionName = slugifiedSectionName;
        this.sectionTitle = sectionTitle;
        this.qaList = qaList;
        this.subSections = {};
    }
    addSubSection(section) {
        this.subSections[section.sectionName] = section;
    }
}
function initXmlDocument(reducedTargetDocumentList, targetDocumentToReduceCurrent, index, targetDocumentToReduceList) {
    const summaryFmMetaData = reducedTargetDocumentList[0].fmMetaData;
    reducedTargetDocumentList[0].xmlAuthorList = summaryFmMetaData.getAuteurs().reduce((xml, auteur) => {
        return xml + `<authorDescription name="${auteur.name}" role="${auteur.role}"><fullname>${auteur.fullname}</fullname><url>${auteur.url}</url></authorDescription>`;
    }, '');
    const sectionListObject = targetDocumentToReduceList
        .reduce((sections, qa) => {
        if (!sections[qa.slugifiedSectionName]) {
            sections[qa.slugifiedSectionName] = new SectionListObject(qa.sectionPathName, qa.slugifiedSectionName, qa.sectionTitle, []);
            sections[qa.slugifiedSectionName].qaList.push(qa.slugifiedQaName);
            return sections;
        }
        else {
            sections[qa.slugifiedSectionName].qaList.push(qa.slugifiedQaName);
            return sections;
        }
    }, {});
    const orderedSectionNames = Object.keys(sectionListObject)
        .sort((key1, key2) => sectionListObject[key1].sectionName > sectionListObject[key2].sectionName ? 1 : -1)
        .map((key) => key);
    const sectionHierarchy = {};
    orderedSectionNames.forEach((key) => {
        const sectionName = sectionListObject[key].sectionName;
        if (sectionName.split('-').length >= 3) {
            const sectionFinder = (sectionList, name) => {
                if (sectionList[name]) {
                    return sectionList[name];
                }
                if (sectionList.subsection === undefined) {
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
            const parentName = sectionName.substring(0, sectionName.lastIndexOf('-'));
            const sectionNode = sectionFinder(sectionHierarchy, parentName);
            if (sectionNode !== undefined) {
                sectionNode.addSubSection(sectionListObject[key]);
            }
        }
        else {
            if (!sectionHierarchy[sectionName]) {
                sectionHierarchy[sectionName] = sectionListObject[key];
            }
        }
    });
    let indent = '        ';
    const sectionReducer = (xml, section) => {
        const links = section[1].qaList.reduce((qaXml, slugifiedQaName) => {
            return qaXml + `
    ${indent}<link href="${slugifiedQaName}"/>`;
        }, '');
        indent += '    ';
        const subXML = Object.entries(section[1].subSections).reduce(sectionReducer, '');
        indent = indent.slice(0, -4);
        const sectionXml = xml + `
${indent}<section id="${section[1].slugifiedSectionName}">
    ${indent}<title>${section[1].sectionTitle}</title>${links}${subXML}
${indent}</section>`;
        return sectionXml;
    };
    reducedTargetDocumentList[0].xmlSectionList = Object.entries(sectionHierarchy).reduce(sectionReducer, '');
    return addXmlQa(reducedTargetDocumentList, targetDocumentToReduceCurrent);
}
function finalizeXmlDocument(reducedTargetDocumentList, targetDocumentToReduce) {
    reducedTargetDocumentList = addXmlQa(reducedTargetDocumentList, targetDocumentToReduce);
    const fmMetaData = reducedTargetDocumentList[0].fmMetaData;
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
    <QAs>${reducedTargetDocumentList[0].xmlQaList}</QAs>
</document>
`;
    return reducedTargetDocumentList;
}
function addXmlQa(reducedTargetDocumentList, targetDocumentToReduce) {
    reducedTargetDocumentList[0].xmlQaList += targetDocumentToReduce.transformedData;
    return reducedTargetDocumentList;
}
function reduceTargetDocumentList(reducedTargetDocumentList, targetDocumentToReduce, index, targetDocumentToReduceList) {
    if (index === 0) {
        return initXmlDocument(reducedTargetDocumentList, targetDocumentToReduce, index, targetDocumentToReduceList);
    }
    if (index === targetDocumentToReduceList.length - 1) {
        return finalizeXmlDocument(reducedTargetDocumentList, targetDocumentToReduce);
    }
    return addXmlQa(reducedTargetDocumentList, targetDocumentToReduce);
}
exports.reduceTargetDocumentList = reduceTargetDocumentList;
