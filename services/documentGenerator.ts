import {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    AlignmentType,
} from 'docx';
import saveAs from 'file-saver';
import type { AnalysisReport, CaseDocumentType, CriticalPoint, NarrativeAnalysis, AlternativeTheory, EvidentiaryInconsistency, TimelineEvent } from '../types';

const A4_MARGIN = 720; // 0.5 inch margin in twips

const saveBlob = (blob: Blob, fileName: string) => {
    try {
        saveAs(blob, fileName);
    } catch (e) {
        console.warn("saveAs failed inside sandbox iframe, trying anchor element download fallback:", e);
        try {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 150);
        } catch (err) {
            console.error("All file download methods failed:", err);
        }
    }
};

const createHeading = (text: string, level: any = HeadingLevel.HEADING_1) => {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: level === HeadingLevel.HEADING_1 ? 28 : 24 })],
        heading: level,
        spacing: { before: 400, after: 200 },
    });
};

const createSubheading = (text: string) => {
    return new Paragraph({
        children: [new TextRun({ text, bold: true, size: 24 })],
        spacing: { before: 300, after: 150 },
    });
};

const createParagraph = (text: string) => {
    if (!text) return new Paragraph({ children: [] });
    return new Paragraph({
        children: [new TextRun({ text, size: 22 })],
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
    });
};

const createItalicParagraph = (text: string) => {
    return new Paragraph({
        children: [new TextRun({ text: `"${text}"`, italics: true, size: 22 })],
        spacing: { after: 120 },
        alignment: AlignmentType.JUSTIFIED,
        indent: { left: 400, right: 400 },
    });
};

const createCriticalPoint = (cp: CriticalPoint): Paragraph[] => {
    const elements: Paragraph[] = [];
    elements.push(new Paragraph({
        children: [new TextRun({ text: cp.type, bold: true, color: '2E74B5', size: 28 })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 200 },
    }));

    elements.push(createSubheading("Extracto del Documento"));
    elements.push(createItalicParagraph(cp.excerpt));

    elements.push(createSubheading("Análisis de la Vulnerabilidad"));
    elements.push(createParagraph(cp.analysis));

    elements.push(createSubheading("Argumento Estratégico Sugerido"));
    elements.push(createParagraph(cp.suggestedArgument));

    if (cp.fracturePointAnalysis) {
        elements.push(new Paragraph({
            children: [new TextRun({ text: "Análisis de Punto de Fractura", bold: true, color: 'C55A11', size: 24 })],
            spacing: { before: 300, after: 150 },
        }));
        elements.push(createParagraph(`Tesis: ${cp.fracturePointAnalysis.fracturePointThesis}`));
        elements.push(createParagraph(`Principio Violado: ${cp.fracturePointAnalysis.underlyingPrinciple}`));
        elements.push(createParagraph(`Implicación Estratégica: ${cp.fracturePointAnalysis.strategicImplication}`));
    }
    
    if (cp.jurisprudentialShielding && cp.jurisprudentialShielding.length > 0) {
        elements.push(new Paragraph({
            children: [new TextRun({ text: "Blindaje Jurisprudencial", bold: true, color: '0070C0', size: 24 })],
            spacing: { before: 300, after: 150 },
        }));
        cp.jurisprudentialShielding.forEach(shield => {
            elements.push(createParagraph(`Ataque Anticipado: ${shield.anticipatedAttack}`));
            elements.push(createParagraph(`Precedente Defensivo: ${shield.defensivePrecedent}`));
        });
    }

    return elements;
};

const createNarrativeAnalysis = (analysis: NarrativeAnalysis): Paragraph[] => {
    const elements: Paragraph[] = [];
    elements.push(createSubheading("La Historia Inferida del Caso"));
    elements.push(createParagraph(analysis.inferredStory));

    elements.push(createSubheading("Perfil del Decisor (Inferido)"));
    elements.push(createParagraph(analysis.decisionMakerProfile));
    
    if (analysis.stakeholderAnalysis && analysis.stakeholderAnalysis.length > 0) {
        elements.push(createSubheading("Análisis de Actores Clave"));
        analysis.stakeholderAnalysis.forEach(sh => {
            elements.push(new Paragraph({
                children: [
                    new TextRun({ text: `${sh.actor} (${sh.role}): `, bold: true, size: 22 }),
                    new TextRun({ text: `Intereses visibles: ${sh.visibleInterests}. Intereses ocultos (hipótesis): ${sh.hiddenInterests}`, size: 22 })
                ],
                spacing: { after: 120 },
            }));
        });
    }
    
    return elements;
};

const createAlternativeTheories = (theories: AlternativeTheory[]): Paragraph[] => {
    const elements: Paragraph[] = [];
    theories.forEach(theory => {
        elements.push(new Paragraph({
            children: [new TextRun({ text: `${theory.title} (Fuerza: ${theory.strength})`, bold: true, size: 24 })],
            spacing: { before: 300, after: 150 },
        }));
        elements.push(createParagraph(theory.description));
    });
    return elements;
};

const createEvidentiaryInconsistencies = (inconsistencies: EvidentiaryInconsistency[]): Paragraph[] => {
    const elements: Paragraph[] = [];
    inconsistencies.forEach(inc => {
        elements.push(new Paragraph({
            children: [new TextRun({ text: `Inconsistencia Probatoria`, bold: true, color: '7030A0', size: 24 })],
            spacing: { before: 300, after: 150 },
        }));
        elements.push(createParagraph(`Afirmación en Documento: "${inc.claimInDocument}"`));
        elements.push(createParagraph(`Prueba Contradictoria (${inc.evidenceFileName}): "${inc.contradictoryEvidenceExcerpt}"`));
        elements.push(createParagraph(`Análisis: ${inc.analysis}`));
    });
    return elements;
};

const createTimeline = (events: TimelineEvent[]): Paragraph[] => {
    const elements: Paragraph[] = [];
    events.forEach(event => {
        elements.push(new Paragraph({
            children: [new TextRun({ text: event.date, bold: true, size: 24 })],
            spacing: { before: 300, after: 100 },
        }));
        elements.push(createParagraph(event.description));
        elements.push(new Paragraph({
            children: [new TextRun({ text: `Fuente: ${event.source}`, italics: true, size: 20, color: '595959' })],
            spacing: { after: 200 }
        }));
    });
    return elements;
};

export const generateReportDocx = async (report: AnalysisReport, documentType: CaseDocumentType): Promise<void> => {
    const doc = new Document({
        sections: [{
            properties: {
                page: {
                    margin: {
                        top: A4_MARGIN,
                        right: A4_MARGIN,
                        bottom: A4_MARGIN,
                        left: A4_MARGIN,
                    },
                },
            },
            children: [
                createHeading(`Informe de Análisis Estratégico: ${documentType}`),
                createHeading("Resumen Estratégico del Caso", HeadingLevel.HEADING_1),
                createParagraph(report.caseOverview),
                
                ...(report.narrativeAnalysis ? [createHeading("Análisis Narrativo y de Actores", HeadingLevel.HEADING_1), ...createNarrativeAnalysis(report.narrativeAnalysis)] : []),

                ...(report.alternativeTheories.length > 0 ? [createHeading("Teorías del Caso Alternativas", HeadingLevel.HEADING_1), ...createAlternativeTheories(report.alternativeTheories)] : []),

                ...(report.evidentiaryInconsistencies && report.evidentiaryInconsistencies.length > 0 ? [createHeading("Inconsistencias Probatorias", HeadingLevel.HEADING_1), ...createEvidentiaryInconsistencies(report.evidentiaryInconsistencies)] : []),
                
                ...(report.timeline && report.timeline.length > 0 ? [createHeading("Línea de Tiempo del Caso", HeadingLevel.HEADING_1), ...createTimeline(report.timeline)] : []),
                
                ...(report.criticalPoints.length > 0 ? [
                    createHeading("Inventario Forense Exhaustivo", HeadingLevel.HEADING_1),
                    ...report.criticalPoints.flatMap(cp => createCriticalPoint(cp)),
                ] : []),
                 ...(report.groundingSources && report.groundingSources.length > 0 ? [
                    createHeading("Fuentes de Investigación Web", HeadingLevel.HEADING_1),
                    ...report.groundingSources.map(s => createParagraph(`${s.title}: ${s.uri}`))
                 ] : [])
            ],
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveBlob(blob, 'Informe_Analisis_Estrategico.docx');
};


export const generateDraftDocx = async (draftText: string, fileName: string = 'Borrador_Documento_Legal.docx'): Promise<void> => {
    // Split by one or more blank lines to correctly handle paragraphs, filter out empty strings, and trim whitespace.
    const paragraphs = draftText.split(/\n\s*\n/).filter(p => p.trim() !== '').map(p => createParagraph(p.trim()));

    const doc = new Document({
        sections: [{
             properties: {
                page: {
                    margin: {
                        top: A4_MARGIN,
                        right: A4_MARGIN,
                        bottom: A4_MARGIN,
                        left: A4_MARGIN,
                    },
                },
            },
            children: paragraphs,
        }],
    });

    const blob = await Packer.toBlob(doc);
    saveBlob(blob, fileName);
};