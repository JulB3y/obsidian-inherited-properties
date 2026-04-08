import { App, EventRef, TFile } from "obsidian";

interface CachedLink {
	link: string;
}

export class LinkDetector {
	private app: App;
	private lastActiveFile: TFile | null = null;

	constructor(app: App) {
		this.app = app;
	}

	initialize(registerEvent: (eventRef: EventRef) => void): void {
		const ref = this.app.workspace.on("file-open", (file: TFile | null) => {
			if (file && file.extension === "md") {
				this.lastActiveFile = file;
			}
		});
		registerEvent(ref);
	}

	getLastActiveFile(): TFile | null {
		return this.lastActiveFile;
	}

	hasLinkTo(parentFile: TFile, targetFile: TFile): boolean {
		const cache = this.app.metadataCache.getFileCache(parentFile);
		if (!cache) return false;

		const targetBasename = targetFile.basename;
		const targetPath = targetFile.path;
		const targetName = targetFile.name;

		const checkLinks = (links: CachedLink[] | undefined): boolean => {
			if (!links) return false;
			for (const link of links) {
				const raw = link.link;
				if (
					raw === targetBasename ||
					raw === targetPath ||
					raw === targetName ||
					raw.replace(/\.md$/, "") === targetBasename
				) {
					return true;
				}
				const resolved =
					this.app.metadataCache.getFirstLinkpathDest(
						raw,
						parentFile.path
					);
				if (resolved && resolved.path === targetPath) {
					return true;
				}
			}
			return false;
		};

		if (checkLinks(cache.links as CachedLink[] | undefined)) return true;
		if (checkLinks(cache.embeds as CachedLink[] | undefined)) return true;

		return false;
	}
}
