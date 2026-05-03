import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
    test('Extension should be present', () => {
        const extension = vscode.extensions.getExtension('Monosen.neomono');
        assert.ok(extension, 'Extension should be installed');
    });

    test('Should register all commands', async () => {
        // Activate the extension first
        const extension = vscode.extensions.getExtension('Monosen.neomono');
        await extension!.activate();
        
        const commands = await vscode.commands.getCommands(true);
        const neomonoCommands = commands.filter(cmd => cmd.startsWith('neomono.'));
        
        assert.ok(neomonoCommands.includes('neomono.enableNeonDreams'), 'enableNeonDreams command should be registered');
        assert.ok(neomonoCommands.includes('neomono.disableNeonDreams'), 'disableNeonDreams command should be registered');
        assert.ok(neomonoCommands.includes('neomono.toggleNeonDreams'), 'toggleNeonDreams command should be registered');
        assert.ok(neomonoCommands.includes('neomono.enableReactorGlow'), 'enableReactorGlow command should be registered');
        assert.ok(neomonoCommands.includes('neomono.disableReactorGlow'), 'disableReactorGlow command should be registered');
        assert.ok(neomonoCommands.includes('neomono.toggleReactorGlow'), 'toggleReactorGlow command should be registered');
        assert.ok(neomonoCommands.includes('neomono.resetReactorCustomizations'), 'resetReactorCustomizations command should be registered');
    });

    test('Should contribute both themes', () => {
        const extension = vscode.extensions.getExtension('Monosen.neomono');
        const packageJSON = extension!.packageJSON;
        
        const themes = packageJSON.contributes.themes;
        assert.strictEqual(themes.length, 2, 'Should have 2 themes');
        
        const themeLabels = themes.map((t: { label: string }) => t.label);
        assert.ok(themeLabels.includes('Neomono'), 'Should include Neomono theme');
        assert.ok(themeLabels.includes('Neomono Deep'), 'Should include Neomono Deep theme');
    });
});
