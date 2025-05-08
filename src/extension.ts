import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';
import { TypstLinter } from './linter';

const linter = new TypstLinter();

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
	// Initialize the linter
	linter.activate(context);
	context.subscriptions.push(linter);

	context.subscriptions.push(
		vscode.commands.registerCommand('typst-preview.compileAndShow', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {return;};

			const doc = editor.document;
			const inputPath = doc.uri.fsPath;
			
			// Get output format from settings
			const config = vscode.workspace.getConfiguration('typst');
			let format = config.get<string>('outputFormat') || 'pdf';
			if (format === 'html') {
				format = featureAdder(format);
			}
			
			// Generate appropriate output path based on format
			const outputPath = getTempOutputPath(inputPath, format.replace(' --features html ', ''));

			exec(`typst compile --format ${format} "${inputPath}" "${outputPath}"`, (err, stdout, stderr) => {
				if (err) {
					const msg = stderr || stdout || err.message;
					vscode.window.showErrorMessage(`Typst compile failed:\n${msg}`);
					vscode.window.showInformationMessage("Check if Typst CLI is installed and in your PATH. \n https://typst.app/");
					return;
				}

				vscode.commands.executeCommand(
					'vscode.open',
					vscode.Uri.file(outputPath),
					vscode.ViewColumn.Beside
				);
			});
		})
	);
}

// Generate a unique output path in the OS temp directory based on format
function getTempOutputPath(inputPath: string, format: string): string {
	const baseName = path.basename(inputPath, '.typ');
	return path.join(os.tmpdir(), `typst-preview-${baseName}.${format}`);
}
// Used for formats that require features (html currently)
function featureAdder(format: string): string {
	return format.concat(` --features ${format} `);
}

// Cleanup linter
export function deactivate() {
	linter.dispose();
}
