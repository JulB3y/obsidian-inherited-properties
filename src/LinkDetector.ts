import { TFile } from "obsidian";
import type InheritedPropertiesPlugin from "./main";

export class LinkDetector {
	private plugin: InheritedPropertiesPlugin;
	private lastActiveFile: TFile | null = null;

	constructor(plugin: InheritedPropertiesPlugin) {
		this.plugin = plugin;
	}

	initialize(): void {
		this.plugin.registerEvent(
			this.plugin.app.workspace.on("file-open", (file: TFile | null) => {
				if (file && file.extension === "md") {
					this.lastActiveFile = file;
				}
			})
		);
	}

	getLastActiveFile(): TFile | null {
		return this.lastActiveFile;
	}

	hasLinkTo(parentFile: TFile, targetFile: TFile): boolean {
		const cache = this.plugin.app.metadataCache.getFileCache(parentFile);
		if (!cache) return false;

		const allLinks = [...(cache.links ?? []), ...(cache.embeds ?? [])];
		const targetBasename = targetFile.basename;

		for (const link of allLinks) {
			if (
				link.link === targetBasename ||
				link.link === targetFile.path ||
				link.link === targetFile.name ||
				link.link.replace(/\.md$/, "") === targetBasename
			) {
				return true;
			}

			const resolved =
				this.plugin.app.metadataCache.getFirstLinkpathDest(
					link.link,
					parentFile.path
				);
			if (resolved && resolved.path === targetFile.path) {
				return true;
			}
		}

		return false;
	}
}
