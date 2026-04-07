import type InheritedPropertiesPlugin from "./main";

export class PropertyScanner {
	private plugin: InheritedPropertiesPlugin;

	constructor(plugin: InheritedPropertiesPlugin) {
		this.plugin = plugin;
	}

	scanVaultProperties(): string[] {
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

		return Array.from(propertyKeys).sort();
	}
}
