import { App, MarkdownView, TFile } from "obsidian";
import type { InheritedPropertiesSettings, InheritableProperty } from "./settings";
import type { LinkDetector } from "./LinkDetector";
import type InheritedPropertiesPlugin from "./main";

export class InheritanceEngine {
	private app: App;
	private plugin: InheritedPropertiesPlugin;
	private linkDetector: LinkDetector;

	constructor(plugin: InheritedPropertiesPlugin, linkDetector: LinkDetector) {
		this.app = plugin.app;
		this.plugin = plugin;
		this.linkDetector = linkDetector;
	}

	async handleFileCreation(file: TFile): Promise<void> {
		try {
			if (file.extension !== "md") return;

			const settings = this.plugin.settings;
			if (!settings.enabled) return;

			const parentFile = this.linkDetector.getLastActiveFile();
			if (!parentFile || parentFile.path === file.path) return;

			if (!this.linkDetector.hasLinkTo(parentFile, file)) return;

			const content = await this.app.vault.read(file);
			if (content.trim() !== "") return;

			const parentFrontmatter = this.getParentFrontmatter(parentFile);
			if (!parentFrontmatter) return;

			const propertiesToInherit = this.filterProperties(
				parentFrontmatter,
				settings.properties
			);
			if (Object.keys(propertiesToInherit).length === 0) return;

			await this.writeFrontmatter(file, propertiesToInherit);
			this.positionCursorAfterFrontmatter(file);
		} catch (error) {
			console.error("Inherited Properties: Error handling file creation", error);
		}
	}

	private getParentFrontmatter(file: TFile): Record<string, unknown> | null {
		const cache = this.app.metadataCache.getFileCache(file);
		if (!cache?.frontmatter) return null;
		return cache.frontmatter as Record<string, unknown>;
	}

	private filterProperties(
		parentFrontmatter: Record<string, unknown>,
		configuredProperties: InheritableProperty[]
	): Record<string, unknown> {
		const result: Record<string, unknown> = {};

		for (const prop of configuredProperties) {
			if (!prop.enabled) continue;
			if (!prop.key) continue;
			if (!(prop.key in parentFrontmatter)) continue;

			const value = parentFrontmatter[prop.key];
			if (value === null || value === undefined || value === "") continue;

			if (prop.triggerValues.length === 0) {
				result[prop.key] = value;
			} else if (this.matchesTriggerValues(value, prop.triggerValues)) {
				result[prop.key] = value;
			}
		}

		return result;
	}

	private matchesTriggerValues(
		value: unknown,
		triggerValues: string[]
	): boolean {
		const normalizedTriggers = triggerValues.map((v) =>
			String(v).toLowerCase()
		);

		if (Array.isArray(value)) {
			return value.some((v) =>
				normalizedTriggers.includes(String(v).toLowerCase())
			);
		}

		return normalizedTriggers.includes(String(value).toLowerCase());
	}

	private async writeFrontmatter(
		file: TFile,
		properties: Record<string, unknown>
	): Promise<void> {
		try {
			await this.plugin.app.fileManager.processFrontMatter(
				file,
				(frontmatter: Record<string, unknown>) => {
					for (const [key, value] of Object.entries(properties)) {
						frontmatter[key] = value;
					}
				}
			);
		} catch (error) {
			console.error("Inherited Properties: Failed to write frontmatter", error);
		}
	}

	private positionCursorAfterFrontmatter(file: TFile): void {
		window.setTimeout(() => {
			const view = this.app.workspace.getActiveViewOfType(MarkdownView);
			if (!view || view.file?.path !== file.path) return;

			const content = this.app.vault.read(file);
			void content.then((text) => {
				const lines = text.split("\n");
				let dashCount = 0;
				for (let i = 0; i < lines.length; i++) {
					if (lines[i].trim() === "---") {
						dashCount++;
						if (dashCount === 2) {
							const targetLine = i + 1;
							view.editor.setCursor({ line: targetLine, ch: 0 });
							return;
						}
					}
				}
			});
		}, 50);
	}
}
