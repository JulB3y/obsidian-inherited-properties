import { App, PluginSettingTab, Setting } from "obsidian";
import type InheritedPropertiesPlugin from "./main";
import type { InheritableProperty } from "./settings";
import { PropertySuggest } from "./PropertySuggest";
import { PropertyScanner } from "./PropertyScanner";

export class InheritedPropertiesSettingTab extends PluginSettingTab {
	private plugin: InheritedPropertiesPlugin;
	private propertyListEl: HTMLElement | null = null;
	private propertyScanner: PropertyScanner;
	private saveTimeout: number | null = null;

	constructor(app: App, plugin: InheritedPropertiesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
		this.propertyScanner = new PropertyScanner(plugin);
		this.plugin.registerEvent(
			this.plugin.app.vault.on("modify", () => this.propertyScanner.invalidateCache())
		);
		this.plugin.registerEvent(
			this.plugin.app.vault.on("delete", () => this.propertyScanner.invalidateCache())
		);
		this.plugin.registerEvent(
			this.plugin.app.vault.on("create", () => this.propertyScanner.invalidateCache())
		);
	}

	private debouncedSave(): void {
		if (this.saveTimeout !== null) {
			window.clearTimeout(this.saveTimeout);
		}
		this.saveTimeout = window.setTimeout(async () => {
			await this.plugin.saveSettings();
			this.saveTimeout = null;
		}, 300);
	}

	display(): void {
		const { containerEl } = this;
		containerEl.empty();

		containerEl.createEl("h2", { text: "Inherited Properties" });

		new Setting(containerEl)
			.setName("Enable inheritance")
			.setDesc(
				"Automatically inherit properties when creating notes via links"
			)
			.addToggle((toggle) =>
				toggle
					.setValue(this.plugin.settings.enabled)
					.onChange(async (value) => {
						this.plugin.settings.enabled = value;
						await this.plugin.saveSettings();
					})
			);

		const header = containerEl.createDiv({ cls: "inherited-properties-header" });
		header.createEl("h3", { text: "Properties" });
		const addBtn = header.createEl("button", {
			cls: "mod-cta",
			text: "Add Property",
		});
		addBtn.addEventListener("click", () => {
			this.plugin.settings.properties.push({
				key: "",
				enabled: true,
				triggerValues: [],
			});
			this.renderPropertyList();
		});

		this.propertyListEl = containerEl.createDiv({
			cls: "inherited-properties-list",
		});
		this.renderPropertyList();
	}

	private renderPropertyList(): void {
		if (!this.propertyListEl) return;
		this.propertyListEl.empty();

		const props = this.plugin.settings.properties;

		if (props.length === 0) {
			this.propertyListEl.createEl("p", {
				text: "No properties configured. Click 'Add Property' to add one.",
				cls: "setting-item-description",
			});
			return;
		}

		for (let i = 0; i < props.length; i++) {
			this.renderPropertyRow(props[i], i);
		}
	}

	private renderPropertyRow(prop: InheritableProperty, index: number): void {
		if (!this.propertyListEl) return;

		const row = this.propertyListEl.createDiv({ cls: "inherited-property-row" });

		const toggleInput = row.createEl("input", { type: "checkbox" });
		toggleInput.checked = prop.enabled;
		toggleInput.classList.add("inherited-prop-toggle");
		toggleInput.addEventListener("change", () => {
			this.plugin.settings.properties[index].enabled = toggleInput.checked;
			this.debouncedSave();
		});

		const keyInput = row.createEl("input", { type: "text" });
		keyInput.placeholder = "Property key";
		keyInput.value = prop.key;
		keyInput.classList.add("inherited-prop-key");
		keyInput.addEventListener("input", () => {
			this.plugin.settings.properties[index].key = keyInput.value;
			this.debouncedSave();
		});
		new PropertySuggest(this.app, this.propertyScanner, keyInput);

		const triggerInput = row.createEl("input", { type: "text" });
		triggerInput.placeholder = "Trigger values (comma-separated)";
		triggerInput.value = prop.triggerValues.join(", ");
		triggerInput.classList.add("inherited-prop-triggers");
		triggerInput.addEventListener("input", () => {
			this.plugin.settings.properties[index].triggerValues = triggerInput.value
				.split(",")
				.map((v) => v.trim())
				.filter((v) => v !== "");
			this.debouncedSave();
		});

		const deleteBtn = row.createEl("button", { cls: "inherited-prop-delete", attr: { "aria-label": "Delete" } });
		deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1 2-2 2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>';
		deleteBtn.addEventListener("click", async () => {
			this.plugin.settings.properties.splice(index, 1);
			await this.plugin.saveSettings();
			this.renderPropertyList();
		});
	}
}
