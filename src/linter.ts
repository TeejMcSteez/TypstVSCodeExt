import * as vscode from 'vscode';

export class TypstLinter {
    private diagnosticCollection: vscode.DiagnosticCollection;
    private disposables: vscode.Disposable[] = [];

    constructor() {
        this.diagnosticCollection = vscode.languages.createDiagnosticCollection('typst');
        this.disposables.push(this.diagnosticCollection);
    }

    public activate(context: vscode.ExtensionContext) {
        // Watch for document changes
        context.subscriptions.push(
            vscode.workspace.onDidChangeTextDocument(e => {
                if (e.document.languageId === 'typst') {
                    this.lintDocument(e.document);
                }
            })
        );

        // Watch for document opens
        context.subscriptions.push(
            vscode.workspace.onDidOpenTextDocument(doc => {
                if (doc.languageId === 'typst') {
                    this.lintDocument(doc);
                }
            })
        );

        // Initial lint of all open Typst documents
        vscode.workspace.textDocuments.forEach(doc => {
            if (doc.languageId === 'typst') {
                this.lintDocument(doc);
            }
        });
    }

    private lintDocument(document: vscode.TextDocument) {
        const diagnostics: vscode.Diagnostic[] = [];
        const text = document.getText();

        // Check for common issues
        this.checkForUnclosedBraces(text, document, diagnostics);
        this.checkForUnclosedMath(text, document, diagnostics);
        this.checkForInvalidReferences(text, document, diagnostics);

        this.diagnosticCollection.set(document.uri, diagnostics);
    }

    private checkForUnclosedBraces(text: string, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            const openBraces = (line.match(/\{/g) || []).length;
            const closeBraces = (line.match(/\}/g) || []).length;
            
            if (openBraces !== closeBraces) {
                const range = new vscode.Range(i, 0, i, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Mismatched braces: ${openBraces} opening & ${closeBraces} closing`,
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        });
    }

    private checkForUnclosedMath(text: string, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
        const lines = text.split('\n');
        lines.forEach((line, i) => {
            // Replace escaped dollar signs with a placeholder to not count them
            const processedLine = line.replace(/\\\$/g, 'PLACEHOLDER');
            const openMath = (processedLine.match(/\$/g) || []).length;
            if (openMath % 2 !== 0) {
                const range = new vscode.Range(i, 0, i, line.length);
                const diagnostic = new vscode.Diagnostic(
                    range,
                    'Unclosed math expression',
                    vscode.DiagnosticSeverity.Warning
                );
                diagnostics.push(diagnostic);
            }
        });
    }

    private checkForInvalidReferences(text: string, document: vscode.TextDocument, diagnostics: vscode.Diagnostic[]) {
        // Collect all label definitions of the form @labelname
        const labelRegex = /@([a-zA-Z0-9_\-]+)/g;
        const labels = new Set<string>();
        let labelMatch;
        while ((labelMatch = labelRegex.exec(text)) !== null) {
            labels.add(labelMatch[1]);
        }

        // Find all <labelname> references
        const refRegex = /<([a-zA-Z0-9_\-]+)>/g;
        const referenced = new Set<string>();
        let match;
        while ((match = refRegex.exec(text)) !== null) {
            const refId = match[1];
            referenced.add(refId);
            if (!labels.has(refId)) {
                const pos = document.positionAt(match.index);
                const range = new vscode.Range(pos, pos.translate(0, match[0].length));
                const diagnostic = new vscode.Diagnostic(
                    range,
                    `Reference to non-existent label: ${refId}`,
                    vscode.DiagnosticSeverity.Error
                );
                diagnostics.push(diagnostic);
            }
        }

        for (const label of labels) {
            if (!referenced.has(label)) {
                const labelPos = text.indexOf(`@${label}`);
                if (labelPos !== -1) {
                    const pos = document.positionAt(labelPos);
                    const range = new vscode.Range(pos, pos.translate(0, label.length + 1));
                    const diagnostic = new vscode.Diagnostic(
                        range,
                        `Label '${label}' is defined but never referenced`,
                        vscode.DiagnosticSeverity.Error
                    );
                    diagnostics.push(diagnostic);
                }
            }
        }
    }

    public dispose() {
        this.disposables.forEach(d => d.dispose());
    }
}