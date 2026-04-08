import type InheritedPropertiesPlugin from "./main";

export class PropertyScanner {
	private plugin: InheritedPropertiesPlugin;
	private cachedProperties: string[] | null = null;

	constructor(plugin: InheritedPropertiesPlugin) {
		this.plugin = plugin;
	}

	invalidateCache(): void {
		this.cachedProperties = null;
	}

	scanVaultProperties(): string[] {
		if (this.cachedProperties !== null) {
			return this.cachedProperties;
		}

		const propertyKeys = new Set<string>();
		const files = this.plugin.app.vault.getMarkdownFiles();

		for (const file of files) {
			const cache =
				this.plugin.app.metadataCache.getFileCache(file);
			if (cache?.frontmatter) {
				const { position, ...rest } = cache.frontmatter as Record<
					string,
					unknown
				> & { position: unknown };
				for (const key of Object.keys(rest)) {
					propertyKeys.add(key);
				}
			}
		}

		this.cachedProperties = Array.from(propertyKeys).sort();
		return this.cachedProperties;
	}
}
