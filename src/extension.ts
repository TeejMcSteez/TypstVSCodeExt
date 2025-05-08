import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { exec } from 'child_process';

// Called when extension is activated
export function activate(context: vscode.ExtensionContext) {
	context.subscriptions.push(
		vscode.commands.registerCommand('typst-preview.compileAndShow', async () => {
			const editor = vscode.window.activeTextEditor;
			if (!editor) {return;};

			const doc = editor.document;
			const inputPath = doc.uri.fsPath;
			const outputPath = getTempPdfPath(inputPath);

			exec(`typst compile "${inputPath}" "${outputPath}"`, (err, stdout, stderr) => {
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

// Generate a unique output PDF path in the OS temp directory
function getTempPdfPath(inputPath: string): string {
	const baseName = path.basename(inputPath, '.typ');
	return path.join(os.tmpdir(), `typst-preview-${baseName}.pdf`);
}

// Cleanup logic if needed
export function deactivate() {}
