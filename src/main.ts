import { Plugin, TAbstractFile, TFile } from "obsidian";
import { DEFAULT_SETTINGS, type InheritedPropertiesSettings } from "./settings";
import { InheritedPropertiesSettingTab } from "./SettingsTab";
import { LinkDetector } from "./LinkDetector";
import { InheritanceEngine } from "./InheritanceEngine";

export default class InheritedPropertiesPlugin extends Plugin {
	settings: InheritedPropertiesSettings = DEFAULT_SETTINGS;
	private linkDetector!: LinkDetector;
	private inheritanceEngine!: InheritanceEngine;

	async onload(): Promise<void> {
		await this.loadSettings();

		this.linkDetector = new LinkDetector(this.app);
		this.linkDetector.initialize((ref) => this.registerEvent(ref));

		this.inheritanceEngine = new InheritanceEngine(this, this.linkDetector);

		this.registerEvent(
			this.app.vault.on("create", (file: TAbstractFile) => {
				if (file instanceof TFile) {
					this.inheritanceEngine.handleFileCreation(file);
				}
			})
		);

		this.addSettingTab(
			new InheritedPropertiesSettingTab(this.app, this)
		);
	}

	onunload(): void {}

	async loadSettings(): Promise<void> {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings(): Promise<void> {
		await this.saveData(this.settings);
	}
}
